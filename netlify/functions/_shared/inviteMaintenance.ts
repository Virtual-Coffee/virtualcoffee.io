import { and, eq, isNotNull, isNull, lt } from 'drizzle-orm';

import {
	db,
	invite,
	user,
	volunteer,
	volunteerAccrualNotice,
	volunteerInviteLedger,
	type AccrualNoticeOutcome,
} from '../../../src/db/index.ts';
import { volunteerAccrual } from '../../../src/emails/volunteerAccrual.tsx';
import {
	accrue,
	balancesBySlackUser,
	giveBack,
	periodKey,
} from '../../../src/lib/volunteers/invites.ts';
import { renderEmail } from '../../../src/lib/email/render.ts';
import { sendEmail } from '../../../src/lib/email/transport.ts';
import { siteUrl } from '../../../src/util/url.server.ts';

/**
 * The daily upkeep behind Volunteer Invites: accrue this month's Invite, expire
 * Claim Links nobody used, and tell Volunteers what they have. Lives under
 * `_shared/` with relative `.ts` imports because the `@/` alias is not known
 * to resolve inside a bundled function.
 */

type MaintenanceReport = {
	period: string;
	accrued: number;
	expired: number;
	/** Invites still `pending` because their expiry transaction failed. */
	expiryFailures: number;
	emailed: number;
	emailFailures: number;
	/** Accruals not reached before the run's budget; tomorrow's run emails them. */
	emailDeferred: number;
};

/** Re-exported so the period key is testable from beside the job that runs it. */
export { periodKey };

/**
 * Expire Claim Links that were never used, and give the allowance back.
 *
 * `token_expires_at is not null` is this sweep's own guard: it skips the
 * Invites imported from Airtable, which are `pending` forever because nobody
 * ever recorded an outcome for them and never had a Claim Link. The second
 * guard — that a credit needs a `spend` — is `giveBack()`'s, and applies to
 * every give-back rather than only this one.
 */
async function expire(
	now: Date,
): Promise<{ expired: number; failures: number }> {
	const due = await db()
		.select({ id: invite.id })
		.from(invite)
		.where(
			and(
				eq(invite.status, 'pending'),
				isNotNull(invite.tokenExpiresAt),
				lt(invite.tokenExpiresAt, now),
			),
		);

	let expired = 0;
	let failures = 0;

	for (const row of due) {
		// One Invite's failure is its own: the row stays `pending` for tomorrow's
		// sweep, and the rest of the run — the other expiries, and telling
		// Volunteers what they accrued — still happens. The caller decides what
		// to do with the count.
		try {
			// An Invite that was never charged is still expired; it is only the
			// credit that is withheld. One that is no longer `pending` was claimed
			// or cancelled since the select above, and is not counted.
			const outcome = await giveBack({
				inviteId: row.id,
				reason: 'refund_expired',
				actorUserId: null,
				body: 'Invite expired unclaimed',
			});

			if (outcome !== 'not_pending') expired += 1;
		} catch (error) {
			failures += 1;
			console.error('Invite expiry failed', { inviteId: row.id, error });
		}
	}

	return { expired, failures };
}

/** How many accrual emails are in flight at once, and how long each may take. */
const SEND_CONCURRENCY = 4;
const SEND_TIMEOUT_MS = 10_000;
/**
 * How far into the run `notify` may still start a batch. A scheduled function
 * is cut off at 30 seconds, and a batch that has started may take
 * `SEND_TIMEOUT_MS` to give up, so this plus that leaves the sweep its share.
 */
const NOTIFY_BUDGET_MS = 15_000;

/**
 * Tell the Volunteers who accrued something what they now hold. Prefers the
 * roster address over the `user` row's (most have never signed in); one with
 * neither is skipped. A failure is logged and swallowed — the accrual already
 * happened, and failing the run would only make tomorrow's report an error
 * for something that succeeded.
 *
 * Works from the ledger, not from what `accrue()` just inserted: every
 * `monthly_accrual` of the period without a `volunteer_accrual_notice` is
 * owed an email, and each attempt writes its notice. So a run that stops at
 * `deadline` — or is killed by the platform — leaves the rest for tomorrow
 * instead of losing them, while an attempt that failed is not repeated every
 * morning until the month turns.
 *
 * One query for everyone, then sends a few at a time with a timeout each: one
 * hung SMTP exchange must cost one email, not the rest of the roster's.
 */
async function notify(
	period: string,
	deadline: number,
): Promise<{ emailed: number; failures: number; deferred: number }> {
	const database = db();
	const balances = balancesBySlackUser(database);
	const rows = await database
		.select({
			ledgerId: volunteerInviteLedger.id,
			slackUserId: volunteer.slackUserId,
			name: volunteer.slackDisplayName,
			email: volunteer.email,
			accountEmail: user.email,
			balance: balances.total,
		})
		.from(volunteerInviteLedger)
		.innerJoin(
			volunteer,
			eq(volunteer.slackUserId, volunteerInviteLedger.slackUserId),
		)
		.leftJoin(user, eq(volunteer.userId, user.id))
		.leftJoin(balances, eq(balances.slackUserId, volunteer.slackUserId))
		.leftJoin(
			volunteerAccrualNotice,
			eq(volunteerAccrualNotice.ledgerId, volunteerInviteLedger.id),
		)
		.where(
			and(
				eq(volunteerInviteLedger.reason, 'monthly_accrual'),
				eq(volunteerInviteLedger.periodKey, period),
				isNull(volunteerAccrualNotice.id),
			),
		)
		.orderBy(volunteerInviteLedger.createdAt);

	let emailed = 0;
	let failures = 0;

	const attempt = async (
		row: (typeof rows)[number],
	): Promise<AccrualNoticeOutcome> => {
		const address = row.email ?? row.accountEmail;
		if (!address) return 'no_address';

		try {
			const rendered = await renderEmail(volunteerAccrual, {
				name: row.name,
				balance: Number(row.balance ?? 0),
				invitesUrl: `${siteUrl()}/invites`,
			});
			const sent = await withTimeout(
				sendEmail({ to: address, ...rendered }),
				SEND_TIMEOUT_MS,
			);

			if (sent.ok) {
				emailed += 1;
				return 'sent';
			}
			failures += 1;
			console.error('Accrual email failed', {
				slackUserId: row.slackUserId,
				message: sent.message,
			});
		} catch (error) {
			failures += 1;
			console.error('Accrual email threw', {
				slackUserId: row.slackUserId,
				error,
			});
		}
		return 'failed';
	};

	const send = async (row: (typeof rows)[number]) => {
		const outcome = await attempt(row);
		// A notice that fails to write is a resend tomorrow, which is the
		// cheaper mistake.
		await database
			.insert(volunteerAccrualNotice)
			.values({ ledgerId: row.ledgerId, outcome })
			.onConflictDoNothing();
	};

	let i = 0;
	for (; i < rows.length && Date.now() < deadline; i += SEND_CONCURRENCY) {
		await Promise.all(rows.slice(i, i + SEND_CONCURRENCY).map(send));
	}

	return { emailed, failures, deferred: Math.max(0, rows.length - i) };
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
	let timer: ReturnType<typeof setTimeout>;
	const timeout = new Promise<never>((_, reject) => {
		timer = setTimeout(() => reject(new Error(`Timed out after ${ms}ms`)), ms);
	});
	return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

export async function runInviteMaintenance(
	now = new Date(),
): Promise<MaintenanceReport> {
	// `now` is the date being maintained; the budget is the wall clock.
	const deadline = Date.now() + NOTIFY_BUDGET_MS;
	const period = periodKey(now);

	// Notify before the sweep: a run cut short makes both good tomorrow, and
	// the email is the part a Volunteer is waiting on.
	const accruedFor = await accrue(now);
	const { emailed, failures, deferred } = await notify(period, deadline);
	const { expired, failures: expiryFailures } = await expire(now);

	return {
		period,
		accrued: accruedFor.length,
		expired,
		expiryFailures,
		emailed,
		emailFailures: failures,
		emailDeferred: deferred,
	};
}
