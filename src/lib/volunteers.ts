import { and, count, desc, eq, isNull, sql } from 'drizzle-orm';

import {
	db,
	invite,
	membershipApplication,
	volunteer,
	volunteerInviteLedger,
} from '@/db';
import type { InviteStatus, VolunteerLedgerReason } from '@/db/schema';
import { balancesBySlackUser } from '@/lib/invites';

/** The roster behind /admin/volunteers — reads only; writes are in its `actions.ts`. */

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
 * Every Volunteer with their balance and sent count, in one query.
 *
 * The aggregates are pre-grouped subqueries joined on, not inline correlated
 * subqueries: drizzle renders an interpolated column in raw `sql` unqualified,
 * and both tables have a `slack_user_id`, so `where "slack_user_id" =
 * "slack_user_id"` is always true and every Volunteer gets the whole ledger's
 * sum. Joining the tables directly would fan out instead. Grouping first
 * avoids both.
 */
export async function listVolunteers(): Promise<VolunteerRow[]> {
	const database = db();

	const balances = balancesBySlackUser(database);

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
 * Invites this Volunteer has sent, and where each one led. Not narrowed for
 * privacy like the Volunteer's own view — a maintainer can open the
 * application anyway. `membership_application.invite_id` has no unique
 * constraint (the Airtable import sets it), so rows are deduplicated rather
 * than trusted to be one-to-one.
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
		// The second key decides which application survives the dedupe below:
		// the newest, since ids are v7 (ADR 0008).
		.orderBy(desc(invite.createdAt), desc(membershipApplication.id));

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
			// The hash is what the resend swaps against, so two resends cannot both
			// report success with different links.
			tokenHash: invite.tokenHash,
			tokenExpiresAt: invite.tokenExpiresAt,
		})
		.from(invite)
		.where(and(eq(invite.id, inviteId), eq(invite.status, 'pending')))
		.limit(1);

	return row ?? null;
}
