import { and, count, desc, eq, isNull, sql } from 'drizzle-orm';

import { db, invite, volunteer, volunteerInviteLedger } from '@/db';
import type { InviteStatus, VolunteerLedgerReason } from '@/db/schema';

/**
 * The roster behind /admin/volunteers.
 *
 * Reading side only — the writes live in that screen's `actions.ts`, which has
 * to re-check its own permission anyway (docs/adr/0006) and would gain nothing
 * from being one import further away.
 */

export type VolunteerRow = {
	id: string;
	slackUserId: string;
	slackDisplayName: string;
	slackHandle: string | null;
	roleLabels: string | null;
	deactivatedAt: Date | null;
	/** Null until they have signed in for the first time. */
	userId: string | null;
	balance: number;
	invitesSent: number;
	createdAt: Date;
};

/**
 * Every Volunteer with their balance, in one query.
 *
 * The balance is a sum over the ledger, so a roster of ninety would otherwise
 * be ninety extra round trips. Both aggregates are correlated subqueries rather
 * than joins: joining two one-to-many tables at once multiplies the rows, and
 * the resulting counts are silently wrong rather than obviously broken.
 */
export async function listVolunteers(): Promise<VolunteerRow[]> {
	const rows = await db()
		.select({
			id: volunteer.id,
			slackUserId: volunteer.slackUserId,
			slackDisplayName: volunteer.slackDisplayName,
			slackHandle: volunteer.slackHandle,
			roleLabels: volunteer.roleLabels,
			deactivatedAt: volunteer.deactivatedAt,
			userId: volunteer.userId,
			createdAt: volunteer.createdAt,
			balance: sql<string | null>`(
				select sum(${volunteerInviteLedger.delta})
				from ${volunteerInviteLedger}
				where ${volunteerInviteLedger.slackUserId} = ${volunteer.slackUserId}
			)`,
			invitesSent: sql<string | null>`(
				select count(*)
				from ${invite}
				where ${invite.inviterSlackUserId} = ${volunteer.slackUserId}
			)`,
		})
		.from(volunteer)
		.orderBy(volunteer.slackDisplayName);

	return rows.map((row) => ({
		...row,
		balance: Number(row.balance ?? 0),
		invitesSent: Number(row.invitesSent ?? 0),
	}));
}

export async function getVolunteerById(id: string) {
	const [row] = await db()
		.select()
		.from(volunteer)
		.where(eq(volunteer.id, id))
		.limit(1);

	return row ?? null;
}

export type LedgerEntry = {
	id: string;
	delta: number;
	reason: VolunteerLedgerReason;
	periodKey: string | null;
	body: string | null;
	createdAt: Date;
};

/** The whole allowance history, newest first — this is the audit trail. */
export async function volunteerLedger(
	slackUserId: string,
): Promise<LedgerEntry[]> {
	return (
		db()
			.select({
				id: volunteerInviteLedger.id,
				delta: volunteerInviteLedger.delta,
				reason: volunteerInviteLedger.reason,
				periodKey: volunteerInviteLedger.periodKey,
				body: volunteerInviteLedger.body,
				createdAt: volunteerInviteLedger.createdAt,
			})
			.from(volunteerInviteLedger)
			.where(eq(volunteerInviteLedger.slackUserId, slackUserId))
			// `createdAt` is not unique; the v7 id breaks ties by creation order.
			.orderBy(
				desc(volunteerInviteLedger.createdAt),
				desc(volunteerInviteLedger.id),
			)
	);
}

export type AdminInviteRow = {
	id: string;
	inviteeName: string | null;
	inviteeEmail: string | null;
	status: InviteStatus;
	createdAt: Date;
	tokenExpiresAt: Date | null;
};

/**
 * Invites this Volunteer has sent.
 *
 * Unlike the Volunteer's own view this is not narrowed for privacy — a
 * maintainer already has the application itself two clicks away — but it is
 * still only the Invite, not the application behind it.
 */
export async function volunteerInvites(
	slackUserId: string,
): Promise<AdminInviteRow[]> {
	return db()
		.select({
			id: invite.id,
			inviteeName: invite.inviteeName,
			inviteeEmail: invite.inviteeEmail,
			status: invite.status,
			createdAt: invite.createdAt,
			tokenExpiresAt: invite.tokenExpiresAt,
		})
		.from(invite)
		.where(eq(invite.inviterSlackUserId, slackUserId))
		.orderBy(desc(invite.createdAt));
}

/** How many Volunteers can currently give out Invites. */
export async function activeVolunteerCount(): Promise<number> {
	const [row] = await db()
		.select({ value: count() })
		.from(volunteer)
		.where(isNull(volunteer.deactivatedAt));

	return row?.value ?? 0;
}

/** A pending Invite, for the admin-only resend. */
export async function pendingInvite(inviteId: string) {
	const [row] = await db()
		.select({
			id: invite.id,
			inviteeName: invite.inviteeName,
			inviteeEmail: invite.inviteeEmail,
			inviterName: invite.inviterName,
			inviterSlackUserId: invite.inviterSlackUserId,
			tokenExpiresAt: invite.tokenExpiresAt,
		})
		.from(invite)
		.where(and(eq(invite.id, inviteId), eq(invite.status, 'pending')))
		.limit(1);

	return row ?? null;
}
