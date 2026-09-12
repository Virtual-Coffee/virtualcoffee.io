import Airtable from 'airtable';
import { inArray } from 'drizzle-orm';

import {
	applicationEvent,
	db,
	invite,
	membershipApplication,
	type NewMembershipApplication,
} from '../../src/db';
import { bool, classify, date, str } from './classify';

/**
 * One-off import of the Airtable membership base into Postgres.
 *
 * Airtable carries application state in three loose flags. This translates
 * them into the explicit status enum:
 *
 *   On Waiting List              -> waitlisted     (the live queue)
 *   approved                     -> member         (membership granted)
 *   pulled off queue, recent     -> coffee_invited (in flight)
 *   pulled off queue, stale      -> lapsed
 *   never queued, never approved -> lapsed         (stale volunteer invites)
 *
 * `lapsed` is not `declined`. Roughly 1,378 of these rows are people nobody
 * ever made a decision about; recording that as a rejection would be false.
 *
 * Idempotent: rows are keyed on `airtable_record_id`, so a re-run inserts only
 * what is missing. Run with `--dry-run` first and check the cohort counts
 * against the ones in scripts/airtable/README.md.
 */

const BASE_ID = 'appGHm8ztVWug6UxH';
const APPLICATIONS_TABLE = 'membership_form';
const INVITES_TABLE = 'Invites';

const DEFAULT_CUTOFF_DAYS = 180;

/**
 * Cohort sizes read straight from Airtable on 2026-09-05, at a 180-day cutoff.
 * The dry run prints these next to what it actually computed so a mismatch is
 * obvious before anything is written.
 *
 * These drift as the live base changes — people keep joining the waitlist, and
 * every day moves a few more rows past the cutoff. A small difference is
 * expected; a large one means the classification logic has diverged from what
 * Airtable means, and is worth understanding before importing.
 */
const EXPECTED_AT_180_DAYS: Record<string, number> = {
	member: 1099,
	waitlisted: 7,
	coffee_invited: 63,
	lapsed: 1378,
};

type AirtableRow = {
	id: string;
	fields: Record<string, unknown>;
};

async function fetchAll(table: string, apiKey: string): Promise<AirtableRow[]> {
	const base = new Airtable({ apiKey }).base(BASE_ID);
	const rows: AirtableRow[] = [];

	await base(table)
		.select({ pageSize: 100 })
		.eachPage((records, next) => {
			for (const record of records) {
				rows.push({
					id: record.id,
					fields: record.fields as Record<string, unknown>,
				});
			}
			next();
		});

	return rows;
}

async function main() {
	const args = process.argv.slice(2);
	const dryRun = args.includes('--dry-run');
	const cutoffArg = args.find((arg) => arg.startsWith('--cutoff-days='));
	const cutoffDays = cutoffArg
		? Number(cutoffArg.split('=')[1])
		: DEFAULT_CUTOFF_DAYS;

	if (!Number.isFinite(cutoffDays) || cutoffDays <= 0) {
		throw new Error(`Invalid --cutoff-days: ${cutoffArg}`);
	}

	const apiKey = process.env.MEMBERSHIP_AIRTABLE_API_KEY;
	if (!apiKey) {
		throw new Error(
			'MEMBERSHIP_AIRTABLE_API_KEY is not set. Ask a maintainer for a read ' +
				'key for the membership base.',
		);
	}

	const cutoff = new Date(Date.now() - cutoffDays * 24 * 60 * 60 * 1000);
	console.log(
		`Cutoff: ${cutoffDays} days — applications pulled off the waitlist before ` +
			`${cutoff.toISOString().slice(0, 10)} import as \`lapsed\`.\n`,
	);

	console.log('Fetching Airtable rows…');
	const [inviteRows, applicationRows] = await Promise.all([
		fetchAll(INVITES_TABLE, apiKey),
		fetchAll(APPLICATIONS_TABLE, apiKey),
	]);
	console.log(
		`Fetched ${applicationRows.length} applications, ${inviteRows.length} invites.\n`,
	);

	const counts = new Map<string, number>();
	const prepared = applicationRows.map((row) => {
		const classified = classify(row.fields, cutoff);
		const key = `${classified.status} / ${classified.source}`;
		counts.set(key, (counts.get(key) ?? 0) + 1);
		return { row, classified };
	});

	console.log('Cohorts:');
	for (const [key, count] of [...counts.entries()].sort()) {
		console.log(`  ${key.padEnd(34)} ${count}`);
	}
	const byStatus = new Map<string, number>();
	for (const { classified } of prepared) {
		byStatus.set(classified.status, (byStatus.get(classified.status) ?? 0) + 1);
	}
	const usingDefaultCutoff = cutoffDays === DEFAULT_CUTOFF_DAYS;
	console.log(
		usingDefaultCutoff
			? '\nBy status (expected = snapshot taken 2026-09-05):'
			: '\nBy status:',
	);
	for (const status of [
		...new Set([...byStatus.keys(), ...Object.keys(EXPECTED_AT_180_DAYS)]),
	].sort()) {
		const count = byStatus.get(status) ?? 0;
		const expected = usingDefaultCutoff
			? EXPECTED_AT_180_DAYS[status]
			: undefined;
		const note =
			expected === undefined
				? ''
				: expected === count
					? '  (matches)'
					: `  (expected ${expected}, drift ${count - expected > 0 ? '+' : ''}${count - expected})`;
		console.log(`  ${status.padEnd(20)} ${String(count).padStart(5)}${note}`);
	}
	console.log(`  ${'total'.padEnd(20)} ${String(prepared.length).padStart(5)}`);

	if (dryRun) {
		console.log('\nDry run — nothing written.');
		process.exit(0);
	}

	const database = db();

	console.log('\nImporting invites…');
	let insertedInvites = 0;
	for (const row of inviteRows) {
		const statusName = str(
			typeof row.fields.Status === 'object' && row.fields.Status !== null
				? (row.fields.Status as { name?: string }).name
				: row.fields.Status,
		);
		const [inserted] = await database
			.insert(invite)
			.values({
				inviterName: str(row.fields['Inviter Name']),
				inviteeName: str(row.fields.Name),
				inviteeEmail: str(row.fields.Email),
				status:
					statusName === 'Completed'
						? 'completed'
						: statusName === 'Accepted'
							? 'accepted'
							: 'pending',
				airtableRecordId: row.id,
				createdAt: date(row.fields['Invited Date']) ?? new Date(),
			})
			.onConflictDoNothing({ target: invite.airtableRecordId })
			.returning({ id: invite.id });

		if (inserted) insertedInvites += 1;
	}

	// Map every invite, not just the ones this run inserted: `onConflictDoNothing`
	// returns nothing for a row that already exists, and a re-run after a partial
	// failure would otherwise write the remaining applications with no invite.
	const inviteIdByAirtableId = new Map<string, string>();
	if (inviteRows.length > 0) {
		const existing = await database
			.select({ id: invite.id, airtableRecordId: invite.airtableRecordId })
			.from(invite)
			.where(
				inArray(
					invite.airtableRecordId,
					inviteRows.map((row) => row.id),
				),
			);
		for (const row of existing) {
			if (row.airtableRecordId) {
				inviteIdByAirtableId.set(row.airtableRecordId, row.id);
			}
		}
	}
	console.log(
		`Inserted ${insertedInvites} invites, ${inviteIdByAirtableId.size - insertedInvites} already present.`,
	);

	console.log('Importing applications…');
	let insertedCount = 0;

	// Oldest first, so the `reference` identity column — the number maintainers
	// see — counts up with application age rather than Airtable's fetch order.
	const inOrder = [...prepared].sort(
		(a, b) =>
			(date(a.row.fields.created)?.getTime() ?? 0) -
			(date(b.row.fields.created)?.getTime() ?? 0),
	);

	for (const { row, classified } of inOrder) {
		const fields = row.fields;
		const submittedAt = date(fields.created) ?? new Date();
		const fromInviteId = str(fields.from_invite_id);

		const values: NewMembershipApplication = {
			status: classified.status,
			source: classified.source,
			isPriority: classified.source === 'volunteer_invite',
			name: str(fields.name) ?? '(no name given)',
			email: str(fields.email) ?? '',
			pronouns: str(fields.pronouns),
			githubUsername: str(fields.githubUsername),
			twitterUsername: str(fields.twitterUsername),
			howDidYouHear: str(fields.howDidYouHearAboutUs),
			journey: str(fields.journey),
			codeInterests: str(fields.codeInterests),
			virtualCoffee: str(fields.virtualCoffee),
			// The old form required this checkbox in the browser but never stored
			// it, so only rows where Airtable happened to capture it get a date.
			agreedToCocAt: bool(fields.agree) ? submittedAt : null,
			referrer: str(fields.referrer),
			inviteId: fromInviteId
				? (inviteIdByAirtableId.get(fromInviteId) ?? null)
				: null,
			submittedAt,
			waitlistedAt: submittedAt,
			coffeeInvitedAt: classified.coffeeInvitedAt,
			// Attendance was never recorded under the old process.
			coffeeAttendedAt: null,
			approvedAt: classified.approvedAt,
			closedAt:
				classified.status === 'lapsed' ? classified.coffeeInvitedAt : null,
			airtableRecordId: row.id,
		};

		const [inserted] = await database
			.insert(membershipApplication)
			.values(values)
			.onConflictDoNothing({ target: membershipApplication.airtableRecordId })
			.returning({ id: membershipApplication.id });

		if (!inserted) continue;

		insertedCount += 1;
		await database.insert(applicationEvent).values({
			applicationId: inserted.id,
			type: 'imported',
			toStatus: classified.status,
			body: `Imported from Airtable (${row.id})`,
			createdAt: submittedAt,
		});
	}

	console.log(
		`\nInserted ${insertedCount} applications (${
			prepared.length - insertedCount
		} already present).`,
	);
	process.exit(0);
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
