import { eq, sql } from 'drizzle-orm';

import {
	applicationEvent,
	db,
	invite,
	membershipApplication,
	pendingGrant,
	user,
	volunteer,
	volunteerInviteLedger,
	type ApplicationStatus,
	type VolunteerLedgerReason,
} from '@/db';
import { hashClaimToken } from '@/lib/invites';

/**
 * Small inserters for the db tests. Each returns what a test needs to refer
 * to the row again, and nothing is shared between tests — the setup file
 * truncates everything after each one.
 */

let counter = 0;
const next = () => ++counter;

export async function insertUser(fields: {
	role?: string | null;
	slackUserId?: string | null;
	name?: string;
	email?: string;
}) {
	const n = next();
	const [row] = await db()
		.insert(user)
		.values({
			id: `user-${n}`,
			name: fields.name ?? `User ${n}`,
			email: fields.email ?? `user-${n}@example.test`,
			role: fields.role ?? null,
			slackUserId: fields.slackUserId ?? null,
		})
		.returning({ id: user.id });
	return row;
}

export async function insertApplication(fields: {
	status?: ApplicationStatus;
	name?: string;
	email?: string;
	inviteId?: string | null;
}) {
	const n = next();
	const [row] = await db()
		.insert(membershipApplication)
		.values({
			name: fields.name ?? `Applicant ${n}`,
			email: fields.email ?? `applicant-${n}@example.test`,
			status: fields.status ?? 'waitlisted',
			source: fields.inviteId ? 'volunteer_invite' : 'waitlist_signup',
			isPriority: Boolean(fields.inviteId),
			inviteId: fields.inviteId ?? null,
			waitlistedAt: new Date(),
		})
		.returning({ id: membershipApplication.id });
	return row;
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

export async function insertVolunteer(fields: {
	slackUserId: string;
	active?: boolean;
	userId?: string | null;
	email?: string | null;
	name?: string;
}) {
	const [row] = await db()
		.insert(volunteer)
		.values({
			slackUserId: fields.slackUserId,
			slackDisplayName: fields.name ?? `Volunteer ${fields.slackUserId}`,
			slackHandle: fields.slackUserId.toLowerCase(),
			userId: fields.userId ?? null,
			email: fields.email ?? null,
			deactivatedAt: fields.active === false ? new Date() : null,
		})
		.returning({ id: volunteer.id });
	return row;
}

export async function ledgerRow(fields: {
	slackUserId: string;
	delta: number;
	reason: VolunteerLedgerReason;
	periodKey?: string;
	inviteId?: string;
}) {
	await db()
		.insert(volunteerInviteLedger)
		.values({
			slackUserId: fields.slackUserId,
			delta: fields.delta,
			reason: fields.reason,
			periodKey: fields.periodKey ?? null,
			inviteId: fields.inviteId ?? null,
		});
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

/** A pending Invite with a live Claim Link; returns the plaintext token too. */
export async function insertInvite(fields: {
	inviterSlackUserId: string;
	inviterName?: string;
	inviterUserId?: string | null;
	inviteeEmail?: string;
	token?: string;
	expiresAt?: Date | null;
	status?: 'pending' | 'accepted' | 'completed' | 'expired' | 'cancelled';
}) {
	const token = fields.token ?? `claim-${next()}`;
	const [row] = await db()
		.insert(invite)
		.values({
			inviterSlackUserId: fields.inviterSlackUserId,
			inviterName: fields.inviterName ?? 'Grace',
			inviterUserId: fields.inviterUserId ?? null,
			inviteeName: 'Ada',
			inviteeEmail: fields.inviteeEmail ?? 'ada@example.test',
			status: fields.status ?? 'pending',
			tokenHash: hashClaimToken(token),
			tokenExpiresAt:
				fields.expiresAt === undefined
					? new Date(Date.now() + 24 * 60 * 60 * 1000)
					: fields.expiresAt,
		})
		.returning({ id: invite.id });
	return { id: row.id, token };
}

export async function inviteRow(id: string) {
	const [row] = await db().select().from(invite).where(eq(invite.id, id));
	return row;
}

export async function insertPendingGrant(fields: {
	slackUserId: string;
	role: string;
	grantedBy?: string;
}) {
	const [row] = await db()
		.insert(pendingGrant)
		.values({
			slackUserId: fields.slackUserId,
			slackDisplayName: `Member ${fields.slackUserId}`,
			role: fields.role,
			grantedBy: fields.grantedBy ?? 'user-admin',
		})
		.returning({ id: pendingGrant.id });
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
	await db().execute(sql`
		create or replace function test_fail_insert() returns trigger as $$
		begin
			raise exception 'insert refused by test';
		end
		$$ language plpgsql
	`);
	await db().execute(
		sql.raw(`
		create trigger test_fail_insert
		before insert on "${table}"
		for each row when (${when})
		execute function test_fail_insert()
	`),
	);
	return {
		remove: () =>
			db().execute(
				sql.raw(`drop trigger if exists test_fail_insert on "${table}"`),
			),
	};
}

export function failLedgerInserts(reason: VolunteerLedgerReason) {
	return failInserts('volunteer_invite_ledger', `new.reason = '${reason}'`);
}
