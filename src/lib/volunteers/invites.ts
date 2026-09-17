import { and, desc, eq, isNotNull, isNull, sql } from 'drizzle-orm';

import {
	db,
	invite,
	isUniqueViolation,
	membershipApplication,
	volunteer,
	volunteerInviteLedger,
	type Database,
	type Transaction,
} from '@/db';
import type {
	ApplicationStatus,
	InviteStatus,
	Volunteer,
	VolunteerLedgerReason,
} from '@/db/schema';
import { hashToken, newToken } from '@/lib/tokens';

/**
 * Invites and the Invite Allowance. Every read of the ledger and **every write
 * to it** comes through here, the way the Event Log owns `application_event`
 * — so what a send, a cancellation or a sweep does to a balance is decided
 * once, and nothing outside this module can invent allowance. See
 * docs/adr/0011.
 */

type Executor = Database | Transaction;

/** One row of the ledger: a movement with a reason. */
export type Movement = typeof volunteerInviteLedger.$inferSelect;

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
	// The same predicate the redemption UPDATE uses (`gt(tokenExpiresAt, now)`,
	// which a NULL never satisfies): a hash with no expiry is not a live link,
	// and showing "you've been invited" for one would then write an ordinary
	// signup.
	if (!row.tokenExpiresAt || row.tokenExpiresAt <= new Date()) return null;

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
 * Every Volunteer's balance as a subquery, for screens and jobs that need
 * many at once; `volunteerBalance()` below is the one-row form.
 */
export function balancesBySlackUser(executor: Executor = db()) {
	return executor
		.select({
			slackUserId: volunteerInviteLedger.slackUserId,
			total: sql<string>`sum(${volunteerInviteLedger.delta})`.as('total'),
		})
		.from(volunteerInviteLedger)
		.groupBy(volunteerInviteLedger.slackUserId)
		.as('balances');
}

/**
 * How many Invites this Volunteer may give out right now. Takes the caller's
 * transaction where the answer has to hold for a write in the same one.
 */
export async function volunteerBalance(
	slackUserId: string,
	executor: Executor = db(),
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

/* -------------------------------------------------------------------------- */
/* Movements — the only writers of volunteer_invite_ledger                    */
/* -------------------------------------------------------------------------- */

/** `YYYY-MM` in UTC — the key the accrual's unique index is built on. */
export function periodKey(now: Date): string {
	return now.toISOString().slice(0, 7);
}

/**
 * Give every active Volunteer this month's Invite, and say who got one.
 *
 * "Ensure this month's row exists", not "run on the 1st": the partial unique
 * index on (slack_user_id, period_key) makes `onConflictDoNothing` idempotent,
 * so the daily job can run any number of times. Deactivated Volunteers are
 * skipped, or someone who stepped back two years ago would return holding
 * twenty-four invites nobody reviewed.
 */
export async function accrue(
	now: Date,
	executor: Executor = db(),
): Promise<string[]> {
	const period = periodKey(now);

	const active = await executor
		.select({ slackUserId: volunteer.slackUserId })
		.from(volunteer)
		.where(isNull(volunteer.deactivatedAt));

	if (active.length === 0) return [];

	const inserted = await executor
		.insert(volunteerInviteLedger)
		.values(
			active.map((row) => ({
				slackUserId: row.slackUserId,
				delta: 1,
				reason: 'monthly_accrual' as const,
				periodKey: period,
				body: `Monthly invite for ${period}`,
			})),
		)
		.onConflictDoNothing()
		.returning({ slackUserId: volunteerInviteLedger.slackUserId });

	return inserted.map((row) => row.slackUserId);
}

/**
 * Charge one Invite against a Volunteer's allowance.
 *
 * Takes the caller's transaction, because a spend only makes sense committed
 * with the Invite it names — `volunteer_invite_ledger_spend_idx` is what makes
 * "charged exactly once" true of the pair.
 */
export async function spend(
	input: {
		slackUserId: string;
		inviteId: string;
		actorUserId?: string | null;
		body: string;
		at?: Date;
	},
	executor: Executor = db(),
): Promise<Movement> {
	const [row] = await executor
		.insert(volunteerInviteLedger)
		.values({
			slackUserId: input.slackUserId,
			delta: -1,
			reason: 'spend',
			inviteId: input.inviteId,
			actorUserId: input.actorUserId ?? null,
			body: input.body,
			...(input.at ? { createdAt: input.at } : {}),
		})
		.returning();

	return row;
}

export type IssuedInvite =
	| { ok: true; inviteId: string }
	| { ok: false; reason: 'no_volunteer' | 'no_balance' | 'already_invited' };

/**
 * Write the Invite and charge it, or say why neither happened.
 *
 * The balance is read under `SELECT … FOR UPDATE` on the Volunteer's row. The
 * indexes stop one Invite being charged twice, but two sends started at once
 * would each charge a *different* Invite against the same last allowance, and
 * no index can see that (docs/adr/0011).
 *
 * `already_invited` is `invite_pending_email_idx` firing: another Volunteer
 * invited the same person between the caller's friendly pre-check and this
 * write. Nothing is charged, because the whole transaction rolls back.
 */
export async function issueInvite(input: {
	inviter: { slackUserId: string; userId: string | null; name: string };
	invitee: { name: string; email: string };
	token: { hash: string; expiresAt: Date };
}): Promise<IssuedInvite> {
	const { inviter, invitee } = input;

	try {
		return await db().transaction(async (tx) => {
			const [held] = await tx
				.select({ id: volunteer.id })
				.from(volunteer)
				.where(eq(volunteer.slackUserId, inviter.slackUserId))
				.limit(1)
				.for('update');

			if (!held) return { ok: false, reason: 'no_volunteer' } as const;

			if ((await volunteerBalance(inviter.slackUserId, tx)) < 1) {
				return { ok: false, reason: 'no_balance' } as const;
			}

			const [row] = await tx
				.insert(invite)
				.values({
					inviterUserId: inviter.userId,
					inviterName: inviter.name,
					inviterSlackUserId: inviter.slackUserId,
					inviteeName: invitee.name,
					inviteeEmail: invitee.email,
					status: 'pending',
					tokenHash: input.token.hash,
					tokenExpiresAt: input.token.expiresAt,
				})
				.returning({ id: invite.id });

			await spend(
				{
					slackUserId: inviter.slackUserId,
					inviteId: row.id,
					actorUserId: inviter.userId,
					body: `Invited ${invitee.name} <${invitee.email}>`,
				},
				tx,
			);

			return { ok: true, inviteId: row.id } as const;
		});
	} catch (error) {
		if (isUniqueViolation(error, 'invite_pending_email_idx')) {
			return { ok: false, reason: 'already_invited' };
		}
		throw error;
	}
}

/**
 * What `giveBack()` did. `flipped_without_spend` is an Invite that was closed
 * but not credited, because it was never charged.
 */
export type GaveBack = 'given_back' | 'not_pending' | 'flipped_without_spend';

/**
 * Close an Invite nobody claimed and give the allowance back, in one
 * transaction.
 *
 * Both halves have to commit together: an Invite that is no longer `pending`
 * is invisible to the expiry sweep, so a credit that failed after the flip
 * would never be made good. The UPDATE is conditional on `pending`, which is
 * what makes two clicks — or a cancel racing the sweep — produce one credit
 * rather than two, ahead of the refund index refusing the second row.
 *
 * The credit is written **only where a `spend` exists**. An Invite imported
 * from Airtable is `pending` forever and was never charged, because the import
 * brings a balance across as one net row (docs/adr/0012); crediting it would
 * invent allowance out of nothing.
 *
 * Both token columns are cleared whatever the reason: a given-back Invite has
 * no Claim Link. `inviter` scopes it to one Volunteer, which is how /invites
 * keeps someone from cancelling an Invite off another Volunteer's list.
 */
export async function giveBack(input: {
	inviteId: string;
	reason: 'refund_cancelled' | 'refund_expired';
	actorUserId?: string | null;
	body: string;
	inviter?: string;
	at?: Date;
}): Promise<GaveBack> {
	return db().transaction(async (tx) => {
		const [flipped] = await tx
			.update(invite)
			.set({
				status: input.reason === 'refund_expired' ? 'expired' : 'cancelled',
				tokenHash: null,
				tokenExpiresAt: null,
			})
			.where(
				and(
					eq(invite.id, input.inviteId),
					eq(invite.status, 'pending'),
					input.inviter
						? eq(invite.inviterSlackUserId, input.inviter)
						: undefined,
				),
			)
			.returning({ id: invite.id });

		if (!flipped) return 'not_pending';

		// The spend's own `slack_user_id` is who gets credited, not the Invite's:
		// the credit reverses that row, and the two must net to zero.
		const [charged] = await tx
			.select({ slackUserId: volunteerInviteLedger.slackUserId })
			.from(volunteerInviteLedger)
			.where(
				and(
					eq(volunteerInviteLedger.inviteId, input.inviteId),
					eq(volunteerInviteLedger.reason, 'spend'),
				),
			)
			.limit(1);

		if (!charged) return 'flipped_without_spend';

		// `volunteer_invite_ledger_refund_idx` covers both refund reasons, so a
		// refund of either kind already on this Invite drops this one silently
		// rather than doubling the allowance.
		await tx
			.insert(volunteerInviteLedger)
			.values({
				slackUserId: charged.slackUserId,
				delta: 1,
				reason: input.reason,
				inviteId: input.inviteId,
				actorUserId: input.actorUserId ?? null,
				body: input.body,
				...(input.at ? { createdAt: input.at } : {}),
			})
			.onConflictDoNothing();

		return 'given_back';
	});
}

/**
 * A maintainer's correction, as a row rather than an edit. The sign picks the
 * reason; zero is not a movement and the calling action validates for it.
 */
export async function adjust(
	input: {
		slackUserId: string;
		delta: number;
		actorUserId?: string | null;
		body: string;
		at?: Date;
	},
	executor: Executor = db(),
): Promise<Movement> {
	if (input.delta === 0) {
		throw new Error('An adjustment of zero is not a movement.');
	}

	const [row] = await executor
		.insert(volunteerInviteLedger)
		.values({
			slackUserId: input.slackUserId,
			delta: input.delta,
			reason: input.delta > 0 ? 'admin_grant' : 'admin_revoke',
			actorUserId: input.actorUserId ?? null,
			body: input.body,
			...(input.at ? { createdAt: input.at } : {}),
		})
		.returning();

	return row;
}

/**
 * The single net row a Volunteer arrives from Airtable with.
 *
 * Airtable's number was a running balance with no history behind it, so there
 * is nothing to replay — one row saying "this is what Airtable said" is the
 * honest version of it (docs/adr/0012). Takes the importer's transaction: it
 * belongs with the `volunteer` row that run created, or a re-run would double
 * the balance.
 */
export async function importBalance(
	input: {
		slackUserId: string;
		credit: number;
		airtableRecordId: string;
		at?: Date;
	},
	executor: Executor = db(),
): Promise<Movement> {
	const [row] = await executor
		.insert(volunteerInviteLedger)
		.values({
			slackUserId: input.slackUserId,
			delta: input.credit,
			reason: 'imported',
			body: `Balance carried over from Airtable (${input.airtableRecordId})`,
			...(input.at ? { createdAt: input.at } : {}),
		})
		.returning();

	return row;
}
