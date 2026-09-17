import { and, eq, inArray, isNotNull, lt } from 'drizzle-orm';

import { db, invite, user, volunteer } from '../../../src/db/index.ts';
import { volunteerAccrualEmail } from '../../../src/lib/email/templates.ts';
import {
	accrue,
	balancesBySlackUser,
	giveBack,
	periodKey,
} from '../../../src/lib/volunteers/invites.ts';
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
 * Tell the Volunteers who accrued something what they now hold. Prefers the
 * roster address over the `user` row's (most have never signed in); one with
 * neither is skipped. A failure is logged and swallowed — the accrual already
 * happened, and failing the run would only make tomorrow's report an error
 * for something that succeeded.
 *
 * One query for everyone, then sends a few at a time with a timeout each: a
 * scheduled function has seconds, not minutes, and one hung SMTP exchange
 * must cost one email, not the rest of the roster's.
 */
async function notify(slackUserIds: string[]): Promise<{
	emailed: number;
	failures: number;
}> {
	if (slackUserIds.length === 0) return { emailed: 0, failures: 0 };

	const database = db();
	const balances = balancesBySlackUser(database);
	const rows = await database
		.select({
			slackUserId: volunteer.slackUserId,
			name: volunteer.slackDisplayName,
			email: volunteer.email,
			accountEmail: user.email,
			balance: balances.total,
		})
		.from(volunteer)
		.leftJoin(user, eq(volunteer.userId, user.id))
		.leftJoin(balances, eq(balances.slackUserId, volunteer.slackUserId))
		.where(inArray(volunteer.slackUserId, slackUserIds));

	let emailed = 0;
	let failures = 0;

	const send = async (row: (typeof rows)[number]) => {
		const address = row.email ?? row.accountEmail;
		if (!address) return;

		try {
			const template = volunteerAccrualEmail(
				row.name,
				Number(row.balance ?? 0),
				`${siteUrl()}/invites`,
			);
			const sent = await withTimeout(
				sendEmail({
					to: address,
					subject: template.subject,
					text: template.text,
				}),
				SEND_TIMEOUT_MS,
			);

			if (sent.ok) emailed += 1;
			else {
				failures += 1;
				console.error('Accrual email failed', {
					slackUserId: row.slackUserId,
					message: sent.message,
				});
			}
		} catch (error) {
			failures += 1;
			console.error('Accrual email threw', {
				slackUserId: row.slackUserId,
				error,
			});
		}
	};

	for (let i = 0; i < rows.length; i += SEND_CONCURRENCY) {
		await Promise.all(rows.slice(i, i + SEND_CONCURRENCY).map(send));
	}

	return { emailed, failures };
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
	const accruedFor = await accrue(now);
	const { expired, failures: expiryFailures } = await expire(now);
	const { emailed, failures } = await notify(accruedFor);

	return {
		period: periodKey(now),
		accrued: accruedFor.length,
		expired,
		expiryFailures,
		emailed,
		emailFailures: failures,
	};
}
