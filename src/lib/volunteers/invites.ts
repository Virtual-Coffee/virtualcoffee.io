import { and, desc, eq, gt, isNotNull, isNull, sql } from 'drizzle-orm';

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
import { volunteerInvite } from '@/emails/volunteerInvite';
import { sendEmail } from '@/lib/email/transport';
import { recordOutcome } from '@/lib/history/eventLog';
import { reportHandled } from '@/lib/monitoring/reportHandled';
import type { Outbound } from '@/lib/outbound';
import { hashToken, newToken } from '@/lib/tokens';
import {
	pendingInvite,
	volunteerSubjectForSlackId,
} from '@/lib/volunteers/volunteers';
import { siteUrl } from '@/util/url.server';

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

/** What redeeming a Claim Link yields. */
export type ClaimedInvite = {
	id: string;
	inviterName: string | null;
	inviterSlackUserId: string | null;
};

/**
 * Spend a Claim Link, or null when it is not live. Takes the caller's
 * transaction so the redemption commits with the application it produces.
 *
 * A conditional UPDATE, so two submissions racing on one link produce exactly
 * one claim — the second finds nothing to redeem. Clearing the hash is what
 * makes the link single-use rather than merely checked-against.
 */
export async function claimInvite(
	token: string,
	now: Date,
	executor: Database | Transaction = db(),
): Promise<ClaimedInvite | null> {
	const [claimed] = await executor
		.update(invite)
		.set({ status: 'accepted', claimedAt: now, tokenHash: null })
		.where(
			and(
				eq(invite.tokenHash, hashClaimToken(token)),
				eq(invite.status, 'pending'),
				gt(invite.tokenExpiresAt, now),
			),
		)
		.returning({
			id: invite.id,
			inviterName: invite.inviterName,
			inviterSlackUserId: invite.inviterSlackUserId,
		});

	return claimed ?? null;
}

/** The Invite's applicant became a member. */
export async function completeInvite(inviteId: string): Promise<void> {
	await db()
		.update(invite)
		.set({ status: 'completed' })
		.where(eq(invite.id, inviteId));
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

type IssuedInvite =
	| { ok: true; inviteId: string; volunteerId: string }
	| { ok: false; reason: 'no_volunteer' | 'no_balance' | 'already_invited' };

/**
 * Write the Invite and charge it, or say why neither happened.
 *
 * The allowance is read under `SELECT … FOR UPDATE` on the Volunteer's row,
 * because two sends started at once would each charge a different Invite
 * against the same last allowance (docs/adr/0011).
 *
 * `already_invited` is `invite_pending_email_idx` firing: another Volunteer
 * invited the same person between the caller's friendly pre-check and this
 * write. Nothing is charged, because the whole transaction rolls back.
 */
async function issueInvite(input: {
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

			return { ok: true, inviteId: row.id, volunteerId: held.id } as const;
		});
	} catch (error) {
		if (isUniqueViolation(error, 'invite_pending_email_idx')) {
			return { ok: false, reason: 'already_invited' };
		}
		throw error;
	}
}

/* -------------------------------------------------------------------------- */
/* Claim Links — every send, and every write of an Invite's token             */
/* -------------------------------------------------------------------------- */

// /join parses `?invite=` (src/app/join/page.tsx); keep the two in step.
const claimUrl = (token: string) => `${siteUrl()}/join?invite=${token}`;

/**
 * Email a Claim Link whose token is already written, and put the outcome on
 * the inviter's History. An inviter who is not a Volunteer here (an imported
 * Invite can name one) has no History: the send still stands and the gap is
 * reported.
 */
async function sendClaimLink(input: {
	inviteId: string;
	inviterSlackUserId: string | null;
	inviterName: string | null;
	inviteeName: string;
	inviteeEmail: string;
	token: string;
	actorUserId: string | null;
	what: string;
}): Promise<Outbound> {
	const sent = await sendEmail(
		volunteerInvite,
		{
			inviterName: input.inviterName || 'A Virtual Coffee volunteer',
			inviteeName: input.inviteeName,
			claimUrl: claimUrl(input.token),
		},
		{ to: input.inviteeEmail },
	);

	const subject = input.inviterSlackUserId
		? await volunteerSubjectForSlackId(input.inviterSlackUserId)
		: null;
	if (subject) {
		await recordOutcome(subject, {
			channel: 'email',
			outbound: sent,
			what: input.what,
			actorUserId: input.actorUserId,
		});
	} else {
		reportHandled(
			new Error(
				`Claim Link sent for Invite ${input.inviteId} with no inviter Volunteer`,
			),
			{ area: 'invites' },
		);
	}

	return sent;
}

/**
 * `refused`: nothing written or sent. `not_sent_given_back`: certainly not
 * delivered, so the Invite is cancelled and refunded. `not_sent_give_back_failed`:
 * certainly not delivered, but the refund failed and the Invite is still
 * `pending` and charged. `maybe_sent`: delivery is unknown, so it stays
 * charged (docs/adr/0011). `failed`: the write itself threw.
 */
export type IssueOutcome =
	| {
			kind: 'refused';
			reason: 'no_volunteer' | 'no_balance' | 'already_invited';
	  }
	| { kind: 'sent'; warning?: string }
	| { kind: 'not_sent_given_back'; message: string }
	| { kind: 'not_sent_give_back_failed'; message: string }
	| { kind: 'maybe_sent'; message: string }
	| { kind: 'failed' };

/**
 * Write an Invite, charge it and email its Claim Link. The write comes first
 * because the token must exist before the email can be composed, so the
 * failure path compensates (docs/adr/0011).
 */
export async function issueAndSend(input: {
	inviter: { slackUserId: string; userId: string | null; name: string };
	invitee: { name: string; email: string };
	/** The name the email signs with; the Invite row keeps `inviter.name`. */
	inviterName: string | null;
}): Promise<IssueOutcome> {
	const { inviter, invitee } = input;
	const { token, expiresAt } = newClaimToken();

	let issued: IssuedInvite;
	try {
		issued = await issueInvite({
			inviter,
			invitee,
			token: { hash: hashClaimToken(token), expiresAt },
		});
	} catch (error) {
		console.error('Failed to record an invite', {
			slackUserId: inviter.slackUserId,
			error,
		});
		reportHandled(error, { area: 'invites' });
		return { kind: 'failed' };
	}

	if (!issued.ok) return { kind: 'refused', reason: issued.reason };

	const sent = await sendClaimLink({
		inviteId: issued.inviteId,
		inviterSlackUserId: inviter.slackUserId,
		inviterName: input.inviterName,
		inviteeName: invitee.name,
		inviteeEmail: invitee.email,
		token,
		actorUserId: inviter.userId,
		what: `Invite to ${invitee.email}`,
	});

	if (sent.ok) return { kind: 'sent', warning: sent.warning };
	if (!sent.definitelyNotSent) {
		return { kind: 'maybe_sent', message: sent.message };
	}

	// Cancelled as well as refunded: left `pending`, the expiry sweep would
	// give back too, and an Invite nobody can claim should not sit in the
	// Volunteer's list as "Sent".
	try {
		await giveBack({
			inviteId: issued.inviteId,
			reason: 'refund_cancelled',
			actorUserId: inviter.userId,
			body: `Send to ${invitee.email} failed: ${sent.message}`,
		});
	} catch (error) {
		console.error('Failed to give back an unsent invite', {
			inviteId: issued.inviteId,
			slackUserId: inviter.slackUserId,
			error,
		});
		reportHandled(error, { area: 'invites' });
		return { kind: 'not_sent_give_back_failed', message: sent.message };
	}
	return { kind: 'not_sent_given_back', message: sent.message };
}

/**
 * `stale`: the Invite was claimed, cancelled or re-sent since the read. In
 * every send outcome the previous link is already dead; there is no rollback.
 */
export type ResendOutcome =
	| { kind: 'refused'; reason: 'not_pending' | 'no_email' | 'imported' }
	| { kind: 'stale' }
	| { kind: 'sent'; email: string; warning?: string }
	| { kind: 'not_sent'; message: string }
	| { kind: 'maybe_sent'; message: string };

/**
 * Swap an Invite's Claim Link and email the new one. No ledger movement: it is
 * the same Invite, already charged, and its expiry restarts.
 *
 * Conditional on `pending` and on the token read, so a link that is not the
 * one in the row never goes out as "re-sent".
 */
async function replaceClaimToken(
	inviteId: string,
	oldHash: string,
	token: { token: string; expiresAt: Date },
): Promise<boolean> {
	const replaced = await db()
		.update(invite)
		.set({
			tokenHash: hashClaimToken(token.token),
			tokenExpiresAt: token.expiresAt,
		})
		.where(
			and(
				eq(invite.id, inviteId),
				eq(invite.status, 'pending'),
				eq(invite.tokenHash, oldHash),
			),
		)
		.returning({ id: invite.id });
	return replaced.length > 0;
}

export async function resendClaimLink(
	inviteId: string,
	{ actorUserId }: { actorUserId: string | null },
): Promise<ResendOutcome> {
	const row = await pendingInvite(inviteId);
	if (!row) return { kind: 'refused', reason: 'not_pending' };
	if (!row.inviteeEmail) return { kind: 'refused', reason: 'no_email' };
	// An imported Invite never had a Claim Link; minting one now would email a
	// years-old invitee a live link.
	if (!row.tokenExpiresAt || !row.tokenHash) {
		return { kind: 'refused', reason: 'imported' };
	}

	const minted = newClaimToken();
	if (!(await replaceClaimToken(inviteId, row.tokenHash, minted))) {
		return { kind: 'stale' };
	}

	const sent = await sendClaimLink({
		inviteId,
		inviterSlackUserId: row.inviterSlackUserId,
		inviterName: row.inviterName,
		inviteeName: row.inviteeName || 'there',
		inviteeEmail: row.inviteeEmail,
		token: minted.token,
		actorUserId,
		what: `Invite re-sent to ${row.inviteeEmail}`,
	});

	if (sent.ok) {
		return { kind: 'sent', email: row.inviteeEmail, warning: sent.warning };
	}
	return sent.definitelyNotSent
		? { kind: 'not_sent', message: sent.message }
		: { kind: 'maybe_sent', message: sent.message };
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
 * The credit is written only where a `spend` exists: an imported Invite was
 * never charged (docs/adr/0012).
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
 * The single net row a Volunteer arrives from Airtable with (docs/adr/0012).
 * Takes the importer's transaction: it belongs with the `volunteer` row that
 * run created, or a re-run would double the allowance.
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
			body: `Invite Allowance carried over from Airtable (${input.airtableRecordId})`,
			...(input.at ? { createdAt: input.at } : {}),
		})
		.returning();

	return row;
}
