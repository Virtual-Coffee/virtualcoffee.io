import { and, desc, eq, isNotNull, sql } from 'drizzle-orm';

import {
	db,
	invite,
	membershipApplication,
	volunteer,
	volunteerInviteLedger,
	type Database,
	type Transaction,
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
 * Why this email should not be sent an Invite, if it should not.
 *
 * There is no unique constraint on `membership_application.email` and the
 * import brought duplicates across, so this is a code-level guard over possibly
 * several rows — `member` wins over a live application, because "they're
 * already in" is the more useful thing to be told. An unclaimed Claim Link
 * from any Volunteer blocks too; `invite_pending_email_idx` is the guarantee
 * behind that check, this is the friendly message ahead of it.
 */
export async function blockingInvite(
	email: string,
): Promise<'member' | 'in_progress' | 'invited' | null> {
	const normalised = email.trim().toLowerCase();
	const [applications, pending] = await Promise.all([
		db()
			.select({ status: membershipApplication.status })
			.from(membershipApplication)
			.where(sql`lower(${membershipApplication.email}) = ${normalised}`),
		db()
			.select({ id: invite.id })
			.from(invite)
			.where(
				and(
					sql`lower(${invite.inviteeEmail}) = ${normalised}`,
					eq(invite.status, 'pending'),
					isNotNull(invite.tokenHash),
				),
			)
			.limit(1),
	]);

	const blocking = applications
		.map((row) => row.status)
		.filter((status) => BLOCKING_STATUSES.includes(status));

	if (blocking.includes('member')) return 'member';
	if (blocking.length > 0) return 'in_progress';
	return pending.length > 0 ? 'invited' : null;
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

/**
 * How many Invites this Volunteer may give out right now. Takes the caller's
 * transaction where the answer has to hold for a write in the same one.
 */
/**
 * Every Volunteer's balance as a subquery, for screens and jobs that need
 * many at once; `volunteerBalance()` below is the one-row form.
 */
export function balancesBySlackUser(executor: Database | Transaction = db()) {
	return executor
		.select({
			slackUserId: volunteerInviteLedger.slackUserId,
			total: sql<string>`sum(${volunteerInviteLedger.delta})`.as('total'),
		})
		.from(volunteerInviteLedger)
		.groupBy(volunteerInviteLedger.slackUserId)
		.as('balances');
}

export async function volunteerBalance(
	slackUserId: string,
	executor: Database | Transaction = db(),
): Promise<number> {
	const [row] = await executor
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
