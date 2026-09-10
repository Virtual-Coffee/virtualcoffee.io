import { desc, eq, sql } from 'drizzle-orm';

import { db, invite, volunteer, volunteerInviteLedger } from '@/db';
import type { Invite, InviteStatus, Volunteer } from '@/db/schema';

/**
 * Reading a Volunteer's Invite Allowance and the Invites they have sent.
 *
 * Everything here keys on the Slack member id rather than a user id, because a
 * Volunteer can hold a balance before they have ever signed in. See
 * `docs/adr/0009` for why that is the identifier, and `docs/adr/0011` for why
 * the balance is a sum rather than a stored number.
 */

/** How many Invites this Volunteer may give out right now. */
export async function volunteerBalance(slackUserId: string): Promise<number> {
	const [row] = await db()
		.select({
			// `sum()` is numeric, which the pg driver hands back as a string, and
			// it is null rather than 0 when the Volunteer has no ledger rows yet.
			total: sql<string | null>`sum(${volunteerInviteLedger.delta})`,
		})
		.from(volunteerInviteLedger)
		.where(eq(volunteerInviteLedger.slackUserId, slackUserId));

	return Number(row?.total ?? 0);
}

export async function getVolunteer(
	slackUserId: string,
): Promise<Volunteer | null> {
	const [row] = await db()
		.select()
		.from(volunteer)
		.where(eq(volunteer.slackUserId, slackUserId))
		.limit(1);

	return row ?? null;
}

/**
 * What a Volunteer is shown about the people they invited.
 *
 * Deliberately narrow. An invitee fills in long-form answers about their career
 * and agrees to the Code of Conduct, then goes through a Coffee and a
 * maintainer's decision — none of which is the referrer's business. A Volunteer
 * gets enough to know whether to nudge someone and whether an Invite is still
 * spent, and nothing else. A declined application simply goes quiet.
 */
export type VolunteerInvite = {
	id: string;
	inviteeName: string | null;
	inviteeEmail: string | null;
	status: InviteStatus;
	createdAt: Date;
	tokenExpiresAt: Date | null;
};

export async function listInvitesFor(
	slackUserId: string,
): Promise<VolunteerInvite[]> {
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

export type { Invite };
