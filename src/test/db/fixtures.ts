import { eq, sql } from 'drizzle-orm';

import {
	applicationEvent,
	cocReport,
	db,
	devtoolsUser,
	invite,
	inviteToken,
	membershipApplication,
	pendingGrant,
	user,
	volunteer,
	volunteerInviteLedger,
	type VolunteerLedgerReason,
} from '@/db';
import { hashClaimToken } from '@/lib/invites';
import { SUBMISSION_KINDS, type SubmissionKind } from '@/lib/submissions';
import { hashToken } from '@/lib/tokens';

/**
 * Small inserters for the db tests and for `scripts/seedDev.ts`. Each returns
 * what a caller needs to refer to the row again. The defaults are what a test
 * wants (a counter keeps them unique; the setup file truncates everything
 * after each test); the seed passes every column it cares about.
 */

let counter = 0;
const next = () => ++counter;

/** Drops `undefined` so a caller's partial row never overwrites a default. */
function given<T extends object>(fields: T): Partial<T> {
	return Object.fromEntries(
		Object.entries(fields).filter(([, value]) => value !== undefined),
	) as Partial<T>;
}

export async function insertUser(
	fields: Partial<typeof user.$inferInsert> = {},
) {
	const n = next();
	const [row] = await db()
		.insert(user)
		.values({
			id: `user-${n}`,
			name: `User ${n}`,
			email: `user-${n}@example.test`,
			role: null,
			slackUserId: null,
			...given(fields),
		})
		.returning({ id: user.id });
	return row;
}

export async function insertApplication(
	fields: Partial<typeof membershipApplication.$inferInsert> = {},
) {
	const n = next();
	const [row] = await db()
		.insert(membershipApplication)
		.values({
			name: `Applicant ${n}`,
			email: `applicant-${n}@example.test`,
			status: 'waitlisted',
			source: fields.inviteId ? 'volunteer_invite' : 'waitlist_signup',
			// Defaults to whether there is an Invite, as the join action sets it.
			isPriority: Boolean(fields.inviteId),
			inviteId: null,
			waitlistedAt: new Date(),
			...given(fields),
		})
		.returning({ id: membershipApplication.id });
	return row;
}

export async function applicationEventRow(
	fields: typeof applicationEvent.$inferInsert,
) {
	await db().insert(applicationEvent).values(fields);
}

export async function applicationRow(id: string) {
	const [row] = await db()
		.select()
		.from(membershipApplication)
		.where(eq(membershipApplication.id, id));
	return row;
}

export async function applicationEvents(applicationId: string) {
	return db()
		.select({
			type: applicationEvent.type,
			body: applicationEvent.body,
			actorUserId: applicationEvent.actorUserId,
		})
		.from(applicationEvent)
		.where(eq(applicationEvent.applicationId, applicationId))
		.orderBy(applicationEvent.createdAt);
}

export async function insertVolunteer(
	fields: { slackUserId: string; active?: boolean; name?: string } & Partial<
		typeof volunteer.$inferInsert
	>,
) {
	const { active, name, ...rest } = fields;
	const [row] = await db()
		.insert(volunteer)
		.values({
			slackUserId: fields.slackUserId,
			slackDisplayName: name ?? `Volunteer ${fields.slackUserId}`,
			slackHandle: fields.slackUserId.toLowerCase(),
			userId: null,
			email: null,
			deactivatedAt: active === false ? new Date() : null,
			...given(rest),
		})
		.returning({ id: volunteer.id });
	return row;
}

export async function ledgerRow(
	fields: {
		reason: VolunteerLedgerReason;
	} & typeof volunteerInviteLedger.$inferInsert,
) {
	await db().insert(volunteerInviteLedger).values(fields);
}

export async function ledgerFor(slackUserId: string) {
	return db()
		.select({
			delta: volunteerInviteLedger.delta,
			reason: volunteerInviteLedger.reason,
			periodKey: volunteerInviteLedger.periodKey,
			inviteId: volunteerInviteLedger.inviteId,
		})
		.from(volunteerInviteLedger)
		.where(eq(volunteerInviteLedger.slackUserId, slackUserId))
		.orderBy(volunteerInviteLedger.createdAt);
}

type InviteFields = Omit<
	Partial<typeof invite.$inferInsert>,
	'tokenHash' | 'tokenExpiresAt'
> & { expiresAt?: Date | null };

/**
 * A pending Invite with a live Claim Link; returns the plaintext token too.
 * `token: null` seeds one whose link is gone (claimed, cancelled or swept).
 */
export async function insertInvite(
	fields: InviteFields & { token?: string },
): Promise<{ id: string; token: string }>;
export async function insertInvite(
	fields: InviteFields & { token: null },
): Promise<{ id: string; token: null }>;
export async function insertInvite(
	fields: InviteFields & { token?: string | null },
): Promise<{ id: string; token: string | null }>;
export async function insertInvite(
	fields: InviteFields & { token?: string | null },
) {
	const n = next();
	const { token: givenToken, expiresAt, ...rest } = fields;
	const token = givenToken === undefined ? `claim-${n}` : givenToken;
	const [row] = await db()
		.insert(invite)
		.values({
			inviterName: 'Grace',
			inviterUserId: null,
			inviteeName: 'Ada',
			// Unique per row: one live Claim Link per email is enforced.
			inviteeEmail: `ada-${n}@example.test`,
			status: 'pending',
			tokenHash: token === null ? null : hashClaimToken(token),
			tokenExpiresAt:
				token === null
					? null
					: expiresAt === undefined
						? new Date(Date.now() + 24 * 60 * 60 * 1000)
						: expiresAt,
			...given(rest),
		})
		.returning({ id: invite.id });
	return { id: row.id, token };
}

export async function inviteRow(id: string) {
	const [row] = await db().select().from(invite).where(eq(invite.id, id));
	return row;
}

/** A Slack invite token for an approved application; returns the plaintext. */
export async function insertInviteToken(
	fields: { applicationId: string; token?: string } & Omit<
		Partial<typeof inviteToken.$inferInsert>,
		'tokenHash'
	>,
) {
	const { token: givenToken, ...rest } = fields;
	const token = givenToken ?? `slack-${next()}`;
	const [row] = await db()
		.insert(inviteToken)
		.values({
			applicationId: fields.applicationId,
			purpose: 'slack',
			expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
			...given(rest),
			tokenHash: hashToken(token),
		})
		.returning({ id: inviteToken.id });
	return { id: row.id, token };
}

export async function insertPendingGrant(
	fields: { slackUserId: string; role: string } & Partial<
		typeof pendingGrant.$inferInsert
	>,
) {
	const [row] = await db()
		.insert(pendingGrant)
		.values({
			slackUserId: fields.slackUserId,
			role: fields.role,
			slackDisplayName: `Member ${fields.slackUserId}`,
			grantedBy: 'user-admin',
			...given(fields),
		})
		.returning({ id: pendingGrant.id });
	return row;
}

/**
 * Register a user with the devtools panel so "switch user" offers it. The
 * library has no API for this outside its own endpoints, so the row is
 * written directly; `email` is unique and follows the pattern the panel
 * itself generates (`<templateKey>+<suffix>@test.local`).
 */
export async function insertDevtoolsUser(fields: {
	userId: string;
	templateKey: string;
	label: string;
	email?: string;
	id?: string;
}) {
	const now = new Date();
	await db()
		.insert(devtoolsUser)
		.values({
			id: fields.id ?? `devtools-${next()}`,
			userId: fields.userId,
			templateKey: fields.templateKey,
			label: fields.label,
			email:
				fields.email ?? `${fields.templateKey}+${fields.userId}@test.local`,
			createdAt: now,
			updatedAt: now,
		});
}

type SubmissionInsert<K extends SubmissionKind> =
	(typeof SUBMISSION_KINDS)[K]['table']['$inferInsert'];

/**
 * One row of any Submission kind. `insert()` does not take a union of tables,
 * so the call is typed as the CoC table and `values` is checked against the
 * real kind.
 */
export async function insertSubmission<K extends SubmissionKind>(
	kind: K,
	values: SubmissionInsert<K>,
) {
	const table = SUBMISSION_KINDS[kind].table as typeof cocReport;
	const [row] = await db()
		.insert(table)
		.values(values as typeof cocReport.$inferInsert)
		.returning({ id: table.id });
	return row;
}

/**
 * Make every insert into a table fail — optionally only rows matching a
 * `when` clause over `new` — until `remove()` is called.
 *
 * A trigger rather than a mock, so the failure happens inside the real
 * transaction and what the test observes is Postgres rolling it back.
 * `afterEach` only truncates, so a test that installs one must remove it.
 */
export async function failInserts(table: string, when = 'true') {
	return failWrites(table, 'insert', when);
}

/** As `failInserts`, for an `update` or `insert` chosen by the caller. */
export async function failWrites(
	table: string,
	statement: 'insert' | 'update',
	when = 'true',
) {
	await db().execute(sql`
		create or replace function test_fail_write() returns trigger as $$
		begin
			raise exception 'write refused by test';
		end
		$$ language plpgsql
	`);
	await db().execute(
		sql.raw(`
		create trigger test_fail_write
		before ${statement} on "${table}"
		for each row when (${when})
		execute function test_fail_write()
	`),
	);
	return {
		remove: () =>
			db().execute(
				sql.raw(`drop trigger if exists test_fail_write on "${table}"`),
			),
	};
}

export function failLedgerInserts(reason: VolunteerLedgerReason) {
	return failInserts('volunteer_invite_ledger', `new.reason = '${reason}'`);
}
