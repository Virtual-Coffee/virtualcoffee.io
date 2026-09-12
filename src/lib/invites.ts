import { desc, eq, sql } from 'drizzle-orm';

import {
	db,
	invite,
	membershipApplication,
	volunteer,
	volunteerInviteLedger,
} from '@/db';
import type {
	ApplicationStatus,
	Invite,
	InviteStatus,
	Volunteer,
} from '@/db/schema';
import { hashToken, newToken } from '@/lib/tokens';

/**
 * How long a Claim Link lives. After this the daily job marks the Invite
 * `expired` and gives the Volunteer their allowance back.
 */
const CLAIM_TOKEN_TTL_DAYS = 90;

export const hashClaimToken = hashToken;
export const newClaimToken = () => newToken(CLAIM_TOKEN_TTL_DAYS);

/**
 * Statuses that make an email ineligible for an Invite. `lapsed`, `declined`
 * and `withdrawn` are deliberately absent — `lapsed` in particular means
 * nobody ever decided (see `applicationStatus`).
 */
const BLOCKING_STATUSES: ApplicationStatus[] = [
	'waitlisted',
	'coffee_invited',
	'member',
];

/**
 * Whether this email already has an application that an Invite should not
 * duplicate, and which kind.
 *
 * There is no unique constraint on `membership_application.email` and the
 * import brought duplicates across, so this is a code-level guard over possibly
 * several rows — `member` wins over a live application, because "they're
 * already in" is the more useful thing to be told.
 */
export async function applicationBlockingInvite(
	email: string,
): Promise<'member' | 'in_progress' | null> {
	const rows = await db()
		.select({ status: membershipApplication.status })
		.from(membershipApplication)
		.where(
			sql`lower(${membershipApplication.email}) = ${email.trim().toLowerCase()}`,
		);

	const blocking = rows
		.map((row) => row.status)
		.filter((status) => BLOCKING_STATUSES.includes(status));

	if (blocking.length === 0) return null;
	return blocking.includes('member') ? 'member' : 'in_progress';
}

/**
 * What a Claim Link is worth, without spending it.
 *
 * Called while rendering /join, so it must not consume anything — someone can
 * open the link, close the tab and come back. Returns null for a token that is
 * unknown, already claimed, cancelled, expired by the sweep, or past its date
 * but not yet swept; the form then behaves exactly like an ordinary signup.
 */
export async function inviteForClaimToken(token: string): Promise<{
	id: string;
	inviterName: string | null;
	inviteeName: string | null;
	inviteeEmail: string | null;
} | null> {
	const [row] = await db()
		.select({
			id: invite.id,
			inviterName: invite.inviterName,
			inviteeName: invite.inviteeName,
			inviteeEmail: invite.inviteeEmail,
			status: invite.status,
			tokenExpiresAt: invite.tokenExpiresAt,
		})
		.from(invite)
		.where(eq(invite.tokenHash, hashClaimToken(token)))
		.limit(1);

	if (!row) return null;
	if (row.status !== 'pending') return null;
	if (row.tokenExpiresAt && row.tokenExpiresAt < new Date()) return null;

	return {
		id: row.id,
		inviterName: row.inviterName,
		inviteeName: row.inviteeName,
		inviteeEmail: row.inviteeEmail,
	};
}

// Keyed on the Slack member id, because a Volunteer can hold a balance before
// they have signed in (docs/adr/0009); the balance is a sum (docs/adr/0011).

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
