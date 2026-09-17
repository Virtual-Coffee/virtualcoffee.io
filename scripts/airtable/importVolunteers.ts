import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

import Airtable from 'airtable';
import { eq, inArray } from 'drizzle-orm';

import { db, invite, volunteer } from '../../src/db';
import { fetchSlackMembers } from '../../src/data/slackMembers';
import { importBalance } from '../../src/lib/volunteers/invites';
import { grantVolunteerRole } from '../../src/lib/access/pendingGrants';
import { CONFIDENT_SCORE, score, type Candidate } from './match';

/**
 * One-off import of the Airtable `Volunteers` table into Postgres. Airtable
 * holds no Slack ids, so the join is a reviewed mapping: `--propose` scores
 * every candidate into an uncommitted mapping file, a maintainer confirms or
 * corrects each row, `--apply` writes only what the file says (docs/adr/0012).
 */

const BASE_ID = 'appGHm8ztVWug6UxH';
const VOLUNTEERS_TABLE = 'Volunteers';
/** `Volunteers.Roles` links here; the API returns only the record ids. */
const ROLES_TABLE = 'Roles';

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
	/** Written by `--propose`; `apply` reads only the handle of the chosen one. */
	candidates: Candidate[];
};

/**
 * The Slack handle of the member the maintainer chose — the roster renders it
 * as `@handle`, so it has to be Slack's, not the Airtable GitHub username. An
 * id typed by hand with no matching candidate has none.
 */
function slackHandle(entry: MappingEntry): string | null {
	const match = entry.candidates.find(
		(candidate) => candidate.slackUserId === entry.slackUserId,
	);
	return match?.handle.trim() || null;
}

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

/** The reviewed ids from an earlier run, so re-proposing does not undo the review. */
function reviewedIds(): Map<string, string> {
	let raw: string;
	try {
		raw = readFileSync(MAPPING_PATH, 'utf8');
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === 'ENOENT') return new Map();
		throw error;
	}

	const previous = JSON.parse(raw) as MappingEntry[];
	return new Map(
		previous
			.filter((entry) => (entry.slackUserId ?? '').trim().length > 0)
			.map((entry) => [entry.airtableRecordId, entry.slackUserId.trim()]),
	);
}

async function propose(apiKey: string) {
	const [rows, roles, members] = await Promise.all([
		fetchAll(VOLUNTEERS_TABLE, apiKey),
		fetchAll(ROLES_TABLE, apiKey),
		fetchSlackMembers(),
	]);

	console.log(
		`Fetched ${rows.length} volunteers, ${roles.length} roles and ${members.length} Slack members.\n`,
	);

	const roleNames = new Map(
		roles.map((role) => [role.id, first(role.fields.Name)] as const),
	);
	const unresolvedRoles = new Set<string>();

	const reviewed = reviewedIds();
	let carried = 0;
	let confident = 0;
	let sole = 0;

	const entries: MappingEntry[] = rows.map((row) => {
		const balance = row.fields['Invites Available'];

		const labels = linkedIds(row.fields.Roles).flatMap((id) => {
			const name = roleNames.get(id);
			if (!name) unresolvedRoles.add(id);
			return name ? [name] : [];
		});

		const entry: MappingEntry = {
			airtableRecordId: row.id,
			name: first(row.fields.Name) ?? '(no name)',
			profileName: first(row.fields['Profile Name']),
			githubUsername: first(row.fields['GitHub Username']),
			email: first(row.fields.Email),
			active: row.fields.Active === true,
			invitesAvailable: typeof balance === 'number' ? balance : null,
			roleLabels: labels.length > 0 ? labels.join(', ') : null,
			inviteRecordIds: linkedIds(row.fields.Invites),
			slackUserId: '',
			candidates: [],
		};

		entry.candidates = members
			.map((member) => score(member, entry))
			.filter((candidate): candidate is Candidate => candidate !== null)
			.sort((a, b) => b.score - a.score)
			.slice(0, 5);

		const previous = reviewed.get(row.id);
		const [best, runnerUp] = entry.candidates;
		if (previous) {
			entry.slackUserId = previous;
			carried += 1;
		} else if (
			best &&
			best.score >= CONFIDENT_SCORE &&
			best.score > (runnerUp?.score ?? 0)
		) {
			entry.slackUserId = best.slackUserId;
			confident += 1;
		} else if (best && entry.candidates.length === 1) {
			// Possibly only a name prefix; the review is what makes this safe.
			entry.slackUserId = best.slackUserId;
			sole += 1;
		}

		return entry;
	});

	writeFileSync(MAPPING_PATH, `${JSON.stringify(entries, null, '\t')}\n`);

	if (unresolvedRoles.size > 0) {
		console.log(
			`Roles not found in ${ROLES_TABLE}, dropped: ${[...unresolvedRoles].join(', ')}\n`,
		);
	}

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
	console.log(`  kept from review  ${carried}`);
	console.log(`  confident         ${confident}`);
	console.log(`  sole candidate    ${sole}   (any score — check these)`);
	console.log(`  needs a human     ${ambiguous}`);
	console.log(`  no candidates     ${none.length}`);

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

	// Trimmed once, here: the id is written to `volunteer`, `pending_grant`,
	// the ledger and `invite`, and the joins between them are exact.
	const mapped = entries
		.map((entry) => ({
			...entry,
			slackUserId: (entry.slackUserId ?? '').trim(),
		}))
		.filter((entry) => entry.slackUserId.length > 0);
	const skipped = entries.length - mapped.length;

	const malformed = mapped.filter(
		(entry) => !/^[UW][A-Z0-9]+$/.test(entry.slackUserId),
	);
	if (malformed.length > 0) {
		console.error(
			'These are not Slack member ids (a handle or an email, probably). Fix the file first:',
		);
		for (const entry of malformed) {
			console.error(`  ${entry.name} -> ${entry.slackUserId}`);
		}
		process.exit(1);
	}

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

	// The other direction: one Airtable record listed twice would be created by
	// its first entry and then treated as already present by its second, which
	// would grant the role and re-point the Invites to the second Slack member.
	const seenRecords = new Set<string>();
	const duplicateRecords = mapped.filter((entry) => {
		if (seenRecords.has(entry.airtableRecordId)) return true;
		seenRecords.add(entry.airtableRecordId);
		return false;
	});

	if (duplicateRecords.length > 0) {
		console.error(
			'One Airtable volunteer is listed more than once. Fix the file first:',
		);
		for (const entry of duplicateRecords) {
			console.error(
				`  ${entry.airtableRecordId} (${entry.name}) -> ${entry.slackUserId}`,
			);
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

	/**
	 * A re-run is for backfilling, not for correcting. The `volunteer` insert
	 * below keeps the stored Slack id on conflict while the grant, the ledger
	 * and the Invites would follow the file's, splitting one person across two
	 * identities. A changed mapping is a migration of its own; refuse it here.
	 */
	const stored = await database
		.select({
			airtableRecordId: volunteer.airtableRecordId,
			slackUserId: volunteer.slackUserId,
			deactivatedAt: volunteer.deactivatedAt,
		})
		.from(volunteer)
		.where(
			inArray(
				volunteer.airtableRecordId,
				mapped.map((entry) => entry.airtableRecordId),
			),
		);
	const storedBy = new Map(stored.map((row) => [row.airtableRecordId, row]));
	const remapped = mapped.filter((entry) => {
		const existing = storedBy.get(entry.airtableRecordId);
		return existing !== undefined && existing.slackUserId !== entry.slackUserId;
	});
	if (remapped.length > 0) {
		console.error(
			'These volunteers are already imported under a different Slack member. A re-run cannot move them; nothing was written:',
		);
		for (const entry of remapped) {
			console.error(
				`  ${entry.name} -> ${entry.slackUserId} (stored: ${storedBy.get(entry.airtableRecordId)?.slackUserId})`,
			);
		}
		process.exit(1);
	}

	let created = 0;
	let relabelled = 0;
	let granted = 0;
	let credited = 0;
	let attributed = 0;

	for (const entry of mapped) {
		/**
		 * One transaction per person: the row, the role, the balance and the
		 * attribution commit together or not at all. A run that dies halfway
		 * leaves nothing behind for the retry to misread — in particular no
		 * `volunteer` row without its `imported` ledger row.
		 */
		await database.transaction(async (tx) => {
			const [row] = await tx
				.insert(volunteer)
				.values({
					slackUserId: entry.slackUserId,
					// The Airtable name is what a maintainer will recognise. A later
					// sign-in does not overwrite it; `claimPendingGrant` applies the
					// Grant written below and fills in the user id.
					slackDisplayName: entry.profileName ?? entry.name,
					slackHandle: slackHandle(entry),
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

			if (row) {
				created += 1;
			} else {
				// Descriptive only, so a re-run may refresh it; the identity may not.
				await tx
					.update(volunteer)
					.set({ roleLabels: entry.roleLabels })
					.where(eq(volunteer.airtableRecordId, entry.airtableRecordId));
				relabelled += 1;
			}

			/**
			 * The other half of a Volunteer. Only for the active ones — the paused
			 * arrive the way `setVolunteerActive` leaves someone, with no role — and
			 * not gated on `row`: the helper merges rather than duplicates, so a
			 * second run over people already imported backfills anyone missed.
			 *
			 * Except someone a maintainer has since paused: `setVolunteerActive`
			 * sets `deactivated_at` and takes the role away, and a re-run must not
			 * hand it back. Airtable's opinion of who is active is the older one.
			 */
			const paused =
				storedBy.get(entry.airtableRecordId)?.deactivatedAt != null;
			if (entry.active && !paused) {
				await grantVolunteerRole(
					tx,
					{
						slackUserId: entry.slackUserId,
						slackDisplayName: entry.profileName ?? entry.name,
						slackHandle: slackHandle(entry),
					},
					'Airtable import',
				);
				granted += 1;
			}

			/**
			 * One net row, not a reconstruction.
			 *
			 * Airtable's number is a running balance with no history behind it — the
			 * grants were manual and unrecorded — so there is nothing to replay. A row
			 * that says "this is what Airtable said, on this date" is the honest
			 * version of a number nobody can explain further.
			 *
			 * Written only alongside the `volunteer` row this run created: the two
			 * share a transaction, so a person already imported has their row, and
			 * the ledger is append-only, so a second one would double the balance.
			 * Nothing else in the ledger is consulted — an `admin_grant` added
			 * between runs is not evidence the import happened.
			 */
			const credit = entry.active ? (entry.invitesAvailable ?? 0) : 0;
			if (row && credit > 0) {
				await importBalance(
					{
						slackUserId: entry.slackUserId,
						credit,
						airtableRecordId: entry.airtableRecordId,
					},
					tx,
				);
				credited += 1;
			}

			/**
			 * Attribute the Invites `importMembership.ts` already brought across. They
			 * carry only an `inviter_name`; this is what lets a Volunteer's own list
			 * and the roster's "sent" count include their history.
			 */
			if (entry.inviteRecordIds.length > 0) {
				const updated = await tx
					.update(invite)
					.set({ inviterSlackUserId: entry.slackUserId })
					.where(inArray(invite.airtableRecordId, entry.inviteRecordIds))
					.returning({ id: invite.id });
				attributed += updated.length;
			}
		});
	}

	console.log(
		`Created ${created} volunteers (${mapped.length - created} already present).`,
	);
	console.log(`Refreshed role labels on ${relabelled} already present.`);
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
		// Without the token `fetchSlackMembers()` falls back to faker members
		// outside production, whose made-up ids would pass `--apply`'s checks.
		if (!process.env.SLACK_BOT_TOKEN) {
			console.error(
				'SLACK_BOT_TOKEN is not set; --propose needs the real directory.',
			);
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
