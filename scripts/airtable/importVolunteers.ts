import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

import Airtable from 'airtable';
import { eq, inArray } from 'drizzle-orm';

import { db, invite, volunteer, volunteerInviteLedger } from '../../src/db';
import { fetchSlackMembers } from '../../src/data/slackMembers';
import { grantVolunteerRole } from '../../src/lib/pendingGrants';
import { CONFIDENT_SCORE, score, type Candidate } from './match';

/**
 * One-off import of the Airtable `Volunteers` table into Postgres.
 *
 * The hard part is not the data, it is the identity. Everything about an Invite
 * Allowance is keyed on the Slack member id (docs/adr/0009), and **Airtable
 * holds no Slack ids at all** — `member_profiles.SlackID` exists and is
 * entirely empty. So the join has to be made from a name, a GitHub username and
 * an email against the live Slack directory, and that will not be clean for
 * everyone: 9 of the 91 rows have no GitHub link, the names are informal
 * ("Kirk", "Meg", "Nicky T"), and one username carries a trailing space.
 *
 * Guessing is not an option. A wrong match credits or debits a real person's
 * allowance, and the failure is invisible — the volunteer simply finds a number
 * they did not expect. So this runs in two phases with a human in the middle:
 *
 *   --propose   score every candidate and write a mapping file
 *   (edit it)   a maintainer confirms or corrects each row
 *   --apply     write only what the file says
 *
 * The mapping file is deliberately **not committed**. It pairs real names with
 * Slack member ids, and it is a working artefact of one migration rather than
 * something the site depends on.
 *
 * Same principle as `lapsed` not `declined` in 0004: where the old system does
 * not actually say something, this does not invent it.
 *
 * An active volunteer also gets the `volunteer` role — as a Pending Grant, since
 * almost none of them have signed in (docs/adr/0010) — because a `volunteer`
 * row on its own accrues Invites its owner cannot reach.
 */

const BASE_ID = 'appGHm8ztVWug6UxH';
const VOLUNTEERS_TABLE = 'Volunteers';

/** Not committed — see `.gitignore` and this file's header. */
const MAPPING_PATH = resolve(import.meta.dirname, 'volunteerSlackMapping.json');

/**
 * Read from Airtable on 2026-09-10. Printed next to what a run actually finds,
 * so drift is obvious before anything is written.
 */
const EXPECTED = {
	total: 91,
	active: 25,
	withoutGithub: 9,
	withoutBalance: 12,
};

type AirtableRow = { id: string; fields: Record<string, unknown> };

type MappingEntry = {
	airtableRecordId: string;
	name: string;
	profileName: string | null;
	githubUsername: string | null;
	email: string | null;
	active: boolean;
	invitesAvailable: number | null;
	roleLabels: string | null;
	inviteRecordIds: string[];
	/** The one field a maintainer edits. Empty means "do not import this row". */
	slackUserId: string;
	/** Reference only; ignored on apply. */
	candidates: Candidate[];
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

/** Airtable lookups come back as arrays; everything here wants one value. */
function first(value: unknown): string | null {
	const raw = Array.isArray(value) ? value[0] : value;
	if (raw === null || raw === undefined) return null;
	if (typeof raw === 'object' && 'name' in raw) {
		return String((raw as { name: unknown }).name).trim() || null;
	}
	const text = String(raw).trim();
	return text.length > 0 ? text : null;
}

function names(value: unknown): string | null {
	if (!Array.isArray(value)) return first(value);
	const list = value
		.map((entry) =>
			entry && typeof entry === 'object' && 'name' in entry
				? String((entry as { name: unknown }).name)
				: String(entry),
		)
		.map((entry) => entry.trim())
		.filter(Boolean);
	return list.length > 0 ? list.join(', ') : null;
}

function linkedIds(value: unknown): string[] {
	if (!Array.isArray(value)) return [];
	return value
		.map((entry) =>
			entry && typeof entry === 'object' && 'id' in entry
				? String((entry as { id: unknown }).id)
				: String(entry),
		)
		.filter((entry) => entry.startsWith('rec'));
}

async function propose(apiKey: string) {
	const [rows, members] = await Promise.all([
		fetchAll(VOLUNTEERS_TABLE, apiKey),
		fetchSlackMembers(),
	]);

	console.log(
		`Fetched ${rows.length} volunteers and ${members.length} Slack members.\n`,
	);

	const entries: MappingEntry[] = rows.map((row) => {
		const balance = row.fields['Invites Available'];

		const entry: MappingEntry = {
			airtableRecordId: row.id,
			name: first(row.fields.Name) ?? '(no name)',
			profileName: first(row.fields['Profile Name']),
			githubUsername: first(row.fields['GitHub Username']),
			email: first(row.fields.Email),
			active: row.fields.Active === true,
			invitesAvailable: typeof balance === 'number' ? balance : null,
			roleLabels: names(row.fields.Roles),
			inviteRecordIds: linkedIds(row.fields.Invites),
			slackUserId: '',
			candidates: [],
		};

		entry.candidates = members
			.map((member) => score(member, entry))
			.filter((candidate): candidate is Candidate => candidate !== null)
			.sort((a, b) => b.score - a.score)
			.slice(0, 5);

		const [best, runnerUp] = entry.candidates;
		if (
			best &&
			best.score >= CONFIDENT_SCORE &&
			best.score > (runnerUp?.score ?? 0)
		) {
			entry.slackUserId = best.slackUserId;
		}

		return entry;
	});

	writeFileSync(MAPPING_PATH, `${JSON.stringify(entries, null, '\t')}\n`);

	const matched = entries.filter((entry) => entry.slackUserId).length;
	const ambiguous = entries.filter(
		(entry) => !entry.slackUserId && entry.candidates.length > 0,
	).length;
	const none = entries.filter((entry) => entry.candidates.length === 0);

	const active = entries.filter((entry) => entry.active).length;
	const withoutGithub = entries.filter((entry) => !entry.githubUsername).length;
	const withoutBalance = entries.filter(
		(entry) => entry.invitesAvailable === null,
	).length;

	console.log('Airtable, against the snapshot taken on 2026-09-10:');
	report('total', entries.length, EXPECTED.total);
	report('active', active, EXPECTED.active);
	report('without github', withoutGithub, EXPECTED.withoutGithub);
	report('without balance', withoutBalance, EXPECTED.withoutBalance);

	console.log(`\nProposed matches:`);
	console.log(`  confident      ${matched}`);
	console.log(`  needs a human  ${ambiguous}`);
	console.log(`  no candidates  ${none.length}`);

	if (none.length > 0) {
		console.log(
			'\nNo Slack candidate at all — fill these in by hand or leave blank:',
		);
		for (const entry of none) {
			console.log(
				`  ${entry.name.padEnd(24)} ${entry.profileName ?? ''} ${entry.githubUsername ?? ''}`,
			);
		}
	}

	console.log(`\nWrote ${MAPPING_PATH}`);
	console.log(
		'Review every row, set or clear `slackUserId`, then re-run with --apply.',
	);
}

function report(label: string, found: number, expected: number) {
	const drift = found === expected ? '' : `  * expected ${expected}`;
	console.log(`  ${label.padEnd(16)} ${String(found).padStart(4)}${drift}`);
}

async function apply(dryRun: boolean) {
	let entries: MappingEntry[];
	try {
		entries = JSON.parse(readFileSync(MAPPING_PATH, 'utf8')) as MappingEntry[];
	} catch {
		console.error(
			`No mapping file at ${MAPPING_PATH}. Run with --propose first.`,
		);
		process.exit(1);
	}

	const mapped = entries.filter((entry) => entry.slackUserId.trim().length > 0);
	const skipped = entries.length - mapped.length;

	const seen = new Set<string>();
	const duplicates = mapped.filter((entry) => {
		if (seen.has(entry.slackUserId)) return true;
		seen.add(entry.slackUserId);
		return false;
	});

	if (duplicates.length > 0) {
		console.error(
			'Two Airtable volunteers are mapped to the same Slack member. Fix the file first:',
		);
		for (const entry of duplicates) {
			console.error(`  ${entry.name} -> ${entry.slackUserId}`);
		}
		process.exit(1);
	}

	console.log(`${mapped.length} mapped, ${skipped} left unmapped.\n`);

	if (dryRun) {
		for (const entry of mapped) {
			const credit = entry.active ? (entry.invitesAvailable ?? 0) : 0;
			console.log(
				`  ${entry.name.padEnd(24)} ${entry.slackUserId.padEnd(14)} ${
					entry.active ? 'active  ' : 'paused  '
				} ${entry.active ? 'grant   ' : 'no grant'} credit ${credit}  invites ${
					entry.inviteRecordIds.length
				}`,
			);
		}
		console.log('\nDry run: nothing written.');
		return;
	}

	const database = db();
	let created = 0;
	let granted = 0;
	let credited = 0;
	let attributed = 0;

	for (const entry of mapped) {
		const [row] = await database
			.insert(volunteer)
			.values({
				slackUserId: entry.slackUserId,
				// The Airtable name is what a maintainer will recognise. A later
				// sign-in does not overwrite it; `claimPendingGrant` applies the
				// Grant written below and fills in the user id.
				slackDisplayName: entry.profileName ?? entry.name,
				slackHandle: entry.githubUsername?.trim() || null,
				roleLabels: entry.roleLabels,
				// The one place a Volunteer's address comes from in bulk. Slack's
				// directory does not carry one without `users:read.email`, so without
				// this the grant and accrual emails reach almost nobody.
				email: entry.email?.trim().toLowerCase() || null,
				/**
				 * Only 25 of the 91 are active. The rest come across so their history
				 * stays attributable and reactivating them is one click, but they
				 * arrive paused and with no balance.
				 */
				deactivatedAt: entry.active ? null : new Date(),
				airtableRecordId: entry.airtableRecordId,
			})
			.onConflictDoNothing({ target: volunteer.airtableRecordId })
			.returning({ id: volunteer.id });

		if (row) created += 1;

		/**
		 * The other half of a Volunteer. Only for the active ones — the paused
		 * arrive the way `setVolunteerActive` leaves someone, with no role — and
		 * not gated on `row`: the helper merges rather than duplicates, so a
		 * second run over people already imported backfills anyone missed.
		 */
		if (entry.active) {
			await database.transaction(async (tx) => {
				await grantVolunteerRole(
					tx,
					{
						slackUserId: entry.slackUserId,
						slackDisplayName: entry.profileName ?? entry.name,
						slackHandle: entry.githubUsername?.trim() || null,
					},
					'Airtable import',
				);
			});
			granted += 1;
		}

		/**
		 * One net row, not a reconstruction.
		 *
		 * Airtable's number is a running balance with no history behind it — the
		 * grants were manual and unrecorded — so there is nothing to replay. A row
		 * that says "this is what Airtable said, on this date" is the honest
		 * version of a number nobody can explain further.
		 */
		const credit = entry.active ? (entry.invitesAvailable ?? 0) : 0;
		if (credit > 0) {
			const existing = await database
				.select({ id: volunteerInviteLedger.id })
				.from(volunteerInviteLedger)
				.where(eq(volunteerInviteLedger.slackUserId, entry.slackUserId))
				.limit(1);

			// Re-runnable: the ledger is append-only, so a second import would
			// otherwise double every balance.
			if (existing.length === 0) {
				await database.insert(volunteerInviteLedger).values({
					slackUserId: entry.slackUserId,
					delta: credit,
					reason: 'imported',
					body: `Balance carried over from Airtable (${entry.airtableRecordId})`,
				});
				credited += 1;
			}
		}

		/**
		 * Attribute the Invites `importMembership.ts` already brought across. They
		 * carry only an `inviter_name`; this is what lets a Volunteer's own list
		 * and the roster's "sent" count include their history.
		 */
		if (entry.inviteRecordIds.length > 0) {
			const updated = await database
				.update(invite)
				.set({ inviterSlackUserId: entry.slackUserId })
				.where(inArray(invite.airtableRecordId, entry.inviteRecordIds))
				.returning({ id: invite.id });
			attributed += updated.length;
		}
	}

	console.log(
		`Created ${created} volunteers (${mapped.length - created} already present).`,
	);
	console.log(`Granted the volunteer role to ${granted}.`);
	console.log(`Wrote ${credited} imported balances.`);
	console.log(`Attributed ${attributed} invites.`);

	if (skipped > 0) {
		console.log(
			`\n${skipped} Airtable volunteers were left out because no Slack member was set.`,
		);
		console.log(
			'Their invites keep `inviter_name` and stay unattributed, which is the honest result.',
		);
	}
}

async function main() {
	const mode = process.argv.includes('--propose')
		? 'propose'
		: process.argv.includes('--apply')
			? 'apply'
			: null;

	if (!mode) {
		console.error(
			'Usage: importVolunteers.ts --propose | --apply [--dry-run]\n\n' +
				'  --propose  read Airtable and Slack, write the mapping file for review\n' +
				'  --apply    write what the reviewed mapping file says',
		);
		process.exit(1);
	}

	if (mode === 'propose') {
		const apiKey = process.env.MEMBERSHIP_AIRTABLE_API_KEY;
		if (!apiKey) {
			console.error('MEMBERSHIP_AIRTABLE_API_KEY is not set.');
			process.exit(1);
		}
		await propose(apiKey);
	} else {
		await apply(process.argv.includes('--dry-run'));
	}

	process.exit(0);
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
