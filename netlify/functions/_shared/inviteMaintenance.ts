import { and, eq, isNotNull, isNull, lt, sql } from 'drizzle-orm';

import {
	db,
	invite,
	user,
	volunteer,
	volunteerInviteLedger,
} from '../../../src/db/index.ts';
import { volunteerAccrualEmail } from '../../../src/lib/email/templates.ts';
import { volunteerBalance } from '../../../src/lib/invites.ts';
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
async function expire(now: Date): Promise<number> {
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

	for (const row of due) {
		// One transaction per Invite: once the row is no longer `pending` the
		// next sweep will never see it again, so the refund must land with the
		// status change or not at all.
		await database.transaction(async (tx) => {
			// Conditional on `pending` again: the Invite may have been claimed or
			// cancelled since the select above. Then it is neither expired nor
			// refunded, and it is not counted.
			const flipped = await tx
				.update(invite)
				.set({ status: 'expired', tokenHash: null })
				.where(and(eq(invite.id, row.id), eq(invite.status, 'pending')))
				.returning({ id: invite.id });

			if (flipped.length === 0) return;
			expired += 1;

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
		});
	}

	return expired;
}

/**
 * Tell the Volunteers who accrued something what they now hold. Prefers the
 * roster address over the `user` row's (most have never signed in); one with
 * neither is skipped. A failure is logged and swallowed — the accrual already
 * happened, and failing the run would only make tomorrow's report an error
 * for something that succeeded.
 */
async function notify(slackUserIds: string[]): Promise<{
	emailed: number;
	failures: number;
}> {
	if (slackUserIds.length === 0) return { emailed: 0, failures: 0 };

	const database = db();
	let emailed = 0;
	let failures = 0;

	for (const slackUserId of slackUserIds) {
		try {
			const [row] = await database
				.select({
					name: volunteer.slackDisplayName,
					email: volunteer.email,
					accountEmail: user.email,
				})
				.from(volunteer)
				.leftJoin(user, eq(volunteer.userId, user.id))
				.where(eq(volunteer.slackUserId, slackUserId))
				.limit(1);

			if (!row) continue;
			const address = row.email ?? row.accountEmail;
			if (!address) continue;

			const template = volunteerAccrualEmail(
				row.name,
				await volunteerBalance(slackUserId),
				`${siteUrl()}/invites`,
			);

			const sent = await sendEmail({
				to: address,
				subject: template.subject,
				text: template.text,
			});

			if (sent.ok) emailed += 1;
			else {
				failures += 1;
				console.error('Accrual email failed', {
					slackUserId,
					message: sent.message,
				});
			}
		} catch (error) {
			failures += 1;
			console.error('Accrual email threw', { slackUserId, error });
		}
	}

	return { emailed, failures };
}

export async function runInviteMaintenance(
	now = new Date(),
): Promise<MaintenanceReport> {
	const accruedFor = await accrue(now);
	const expired = await expire(now);
	const { emailed, failures } = await notify(accruedFor);

	return {
		period: periodKey(now),
		accrued: accruedFor.length,
		expired,
		emailed,
		emailFailures: failures,
	};
}
