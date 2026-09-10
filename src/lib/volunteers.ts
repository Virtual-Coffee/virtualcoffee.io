import { and, count, desc, eq, isNull, sql } from 'drizzle-orm';

import {
	db,
	invite,
	membershipApplication,
	volunteer,
	volunteerInviteLedger,
} from '@/db';
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
 * Every Volunteer with their balance and how many Invites they have sent, in
 * one query.
 *
 * The two aggregates are **pre-aggregated subqueries joined on**, not
 * correlated subqueries written inline. That is not a style preference:
 *
 *   - A correlated subquery has to be spelled in raw `sql`, and drizzle renders
 *     an interpolated column *unqualified*. `volunteer` and
 *     `volunteer_invite_ledger` both have a `slack_user_id`, so
 *     `where ${ledger.slackUserId} = ${volunteer.slackUserId}` becomes
 *     `where "slack_user_id" = "slack_user_id"` — the inner column shadows the
 *     outer one, the predicate is always true, and every Volunteer is handed
 *     the sum of the entire ledger. It reads correctly and is silently wrong.
 *   - Joining the *tables* directly would be wrong a different way: two
 *     one-to-many joins at once multiply the rows and inflate both aggregates.
 *
 * Grouping first fixes both. Each subquery is already one row per Slack member,
 * so the joins cannot fan out, and drizzle aliases them so nothing is shadowed.
 */
export async function listVolunteers(): Promise<VolunteerRow[]> {
	const database = db();

	const balances = database
		.select({
			slackUserId: volunteerInviteLedger.slackUserId,
			total: sql<string>`sum(${volunteerInviteLedger.delta})`.as('total'),
		})
		.from(volunteerInviteLedger)
		.groupBy(volunteerInviteLedger.slackUserId)
		.as('balances');

	const sent = database
		.select({
			slackUserId: invite.inviterSlackUserId,
			total: sql<string>`count(*)`.as('sent_total'),
		})
		.from(invite)
		.groupBy(invite.inviterSlackUserId)
		.as('sent');

	const rows = await database
		.select({
			id: volunteer.id,
			slackUserId: volunteer.slackUserId,
			slackDisplayName: volunteer.slackDisplayName,
			slackHandle: volunteer.slackHandle,
			roleLabels: volunteer.roleLabels,
			deactivatedAt: volunteer.deactivatedAt,
			userId: volunteer.userId,
			createdAt: volunteer.createdAt,
			balance: balances.total,
			invitesSent: sent.total,
		})
		.from(volunteer)
		.leftJoin(balances, eq(balances.slackUserId, volunteer.slackUserId))
		.leftJoin(sent, eq(sent.slackUserId, volunteer.slackUserId))
		.orderBy(volunteer.slackDisplayName);

	return rows.map((row) => ({
		...row,
		// Both are null for a Volunteer with no rows on that side, and `sum()` is
		// numeric, which the driver hands back as a string.
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
	/** The application this Invite produced, if it was ever claimed. */
	applicationId: string | null;
	/** The number the waitlist screens show — never put it in a URL (ADR 0008). */
	applicationReference: number | null;
};

/**
 * Invites this Volunteer has sent, and where each one led.
 *
 * Unlike the Volunteer's own view this is not narrowed for privacy — a
 * maintainer can already open the application itself, which is the point of
 * joining it on here.
 *
 * The join runs from `membership_application.invite_id`, which is the direction
 * the foreign key points: an application knows the Invite it came from, not the
 * other way round. Nothing stops two applications naming one Invite — the
 * column has no unique constraint, and the Airtable import sets it from a
 * `from_invite_id` this codebase never wrote — so the rows are deduplicated
 * rather than trusted to be one-to-one. A fan-out would otherwise list the same
 * Invite twice.
 */
export async function volunteerInvites(
	slackUserId: string,
): Promise<AdminInviteRow[]> {
	const rows = await db()
		.select({
			id: invite.id,
			inviteeName: invite.inviteeName,
			inviteeEmail: invite.inviteeEmail,
			status: invite.status,
			createdAt: invite.createdAt,
			tokenExpiresAt: invite.tokenExpiresAt,
			applicationId: membershipApplication.id,
			applicationReference: membershipApplication.reference,
		})
		.from(invite)
		.leftJoin(
			membershipApplication,
			eq(membershipApplication.inviteId, invite.id),
		)
		.where(eq(invite.inviterSlackUserId, slackUserId))
		.orderBy(desc(invite.createdAt));

	const seen = new Set<string>();
	const unique: AdminInviteRow[] = [];

	for (const row of rows) {
		if (seen.has(row.id)) continue;
		seen.add(row.id);
		unique.push(row);
	}

	return unique;
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
