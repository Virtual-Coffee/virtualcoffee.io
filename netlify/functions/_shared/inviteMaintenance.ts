import { and, eq, inArray, isNotNull, isNull, lt, sql } from 'drizzle-orm';

import {
	db,
	invite,
	user,
	volunteer,
	volunteerInviteLedger,
} from '../../../src/db/index.ts';
import { volunteerAccrualEmail } from '../../../src/lib/email/templates.ts';
import { balancesBySlackUser } from '../../../src/lib/invites.ts';
import { sendEmail } from '../../../src/lib/email/transport.ts';
import { siteUrl } from '../../../src/util/url.server.ts';

/**
 * The daily upkeep behind Volunteer Invites: accrue this month's Invite, expire
 * Claim Links nobody used, and tell Volunteers what they have. Lives under
 * `_shared/` with relative `.ts` imports because the `@/` alias is not known
 * to resolve inside a bundled function.
 */

export type MaintenanceReport = {
	period: string;
	accrued: number;
	expired: number;
	/** Invites still `pending` because their expiry transaction failed. */
	expiryFailures: number;
	emailed: number;
	emailFailures: number;
};

/** `YYYY-MM` in UTC — the key the accrual's unique index is built on. */
export function periodKey(now: Date): string {
	return now.toISOString().slice(0, 7);
}

/**
 * Give every active Volunteer this month's Invite. "Ensure this month's row
 * exists", not "run on the 1st": the partial unique index on
 * (slack_user_id, period_key) makes `onConflictDoNothing` idempotent.
 * Deactivated Volunteers are skipped, or someone who stepped back two years
 * ago would return holding twenty-four invites nobody reviewed.
 */
async function accrue(now: Date): Promise<string[]> {
	const period = periodKey(now);
	const database = db();

	const active = await database
		.select({ slackUserId: volunteer.slackUserId })
		.from(volunteer)
		.where(isNull(volunteer.deactivatedAt));

	if (active.length === 0) return [];

	const inserted = await database
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
 * Expire Claim Links that were never used, and give the allowance back.
 *
 * Two guards that both matter:
 *
 *   - `token_expires_at is not null` skips the Invites imported from Airtable.
 *     They are `pending` forever because nobody ever recorded an outcome for
 *     them, they never had a Claim Link, and they were never charged against
 *     the new ledger — the import brings a balance across as a single net row.
 *   - a refund is only written where a `spend` exists. The unique index stops a
 *     second refund, but nothing else would stop a *first* one against an
 *     Invite that was never charged, which would invent allowance out of
 *     nothing.
 */
async function expire(
	now: Date,
): Promise<{ expired: number; failures: number }> {
	const database = db();

	const due = await database
		.select({
			id: invite.id,
			slackUserId: invite.inviterSlackUserId,
			spendId: volunteerInviteLedger.id,
		})
		.from(invite)
		.leftJoin(
			volunteerInviteLedger,
			and(
				eq(volunteerInviteLedger.inviteId, invite.id),
				eq(volunteerInviteLedger.reason, 'spend'),
			),
		)
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
		// One transaction per Invite: once the row is no longer `pending` the
		// next sweep will never see it again, so the refund must land with the
		// status change or not at all. And one Invite's failure is its own:
		// the row stays `pending` for tomorrow's sweep, and the rest of the
		// run — the other expiries, and telling Volunteers what they accrued —
		// still happens. The caller decides what to do with the count.
		try {
			const flipped = await database.transaction(async (tx) => {
				// Conditional on `pending` again: the Invite may have been claimed
				// or cancelled since the select above. Then it is neither expired
				// nor refunded, and it is not counted.
				const rows = await tx
					.update(invite)
					.set({ status: 'expired', tokenHash: null })
					.where(and(eq(invite.id, row.id), eq(invite.status, 'pending')))
					.returning({ id: invite.id });

				if (rows.length === 0) return false;

				if (row.slackUserId && row.spendId) {
					await tx
						.insert(volunteerInviteLedger)
						.values({
							slackUserId: row.slackUserId,
							delta: 1,
							reason: 'refund_expired',
							inviteId: row.id,
							body: 'Invite expired unclaimed',
						})
						.onConflictDoNothing();
				}

				return true;
			});

			if (flipped) expired += 1;
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
