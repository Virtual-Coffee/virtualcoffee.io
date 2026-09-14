import { and, eq, gt, isNull } from 'drizzle-orm';

import { db, inviteToken, type Transaction } from '@/db';
import { hashToken, newToken } from '@/lib/tokens';

/**
 * Single-use, expiring Slack invite tokens.
 *
 * Replaces `/join-slack?code=…`, which accepted any non-empty value and never
 * expired — anyone who had ever been sent a link, or guessed one, could hand
 * out Slack access indefinitely. Only the hash is stored, so a database leak
 * doesn't yield working invites.
 */

const TOKEN_TTL_DAYS = 30;

/**
 * Mint a Slack invite token. By default it supersedes any still-live one for
 * the same application — one working link at a time: a re-send is for a link
 * that was lost, and a lost link is one somebody else may be holding, for up
 * to 30 days if it were left to expire on its own. The old link then reads as
 * expired on /join-slack, which is also what it is.
 *
 * Approval passes `supersede: false`. Two maintainers approving the same
 * person at once each mint before the status change decides who won, and the
 * loser must not have killed the winner's link on the way in; the loser
 * expires its own with `expireSlackInviteToken` instead.
 */
export async function createSlackInviteToken(
	applicationId: string,
	{ supersede = true }: { supersede?: boolean } = {},
): Promise<{ id: string; token: string; expiresAt: Date }> {
	const { token, expiresAt } = newToken(TOKEN_TTL_DAYS);
	const now = new Date();

	const id = await db().transaction(async (tx) => {
		if (supersede) await expireSlackInviteTokens(applicationId, now, tx);

		const [row] = await tx
			.insert(inviteToken)
			.values({
				applicationId,
				purpose: 'slack',
				tokenHash: hashToken(token),
				expiresAt,
			})
			.returning({ id: inviteToken.id });
		return row.id;
	});

	return { id, token, expiresAt };
}

/**
 * Expire one token, by id, as of `now`: an approval that lost the race after
 * its invite email had gone kills the link in that email, and only that one,
 * so it stops admitting someone the panel no longer shows as approved while
 * the winning approval's link keeps working.
 */
export async function expireSlackInviteToken(
	id: string,
	now: Date,
): Promise<void> {
	await db()
		.update(inviteToken)
		.set({ expiresAt: now })
		.where(
			and(
				eq(inviteToken.id, id),
				isNull(inviteToken.usedAt),
				gt(inviteToken.expiresAt, now),
			),
		);
}

/** Expire every live Slack token for an application, as of `now` — the supersession. */
export async function expireSlackInviteTokens(
	applicationId: string,
	now: Date,
	tx: Transaction | ReturnType<typeof db> = db(),
): Promise<void> {
	await tx
		.update(inviteToken)
		.set({ expiresAt: now })
		.where(
			and(
				eq(inviteToken.applicationId, applicationId),
				eq(inviteToken.purpose, 'slack'),
				isNull(inviteToken.usedAt),
				gt(inviteToken.expiresAt, now),
			),
		);
}

export type TokenRedemption =
	| { ok: true; applicationId: string }
	| { ok: false; reason: 'unknown' | 'used' | 'expired' };

type TokenRow = {
	id: string;
	applicationId: string;
	expiresAt: Date;
	usedAt: Date | null;
};

async function lookup(
	token: string,
): Promise<{ row: TokenRow } | Extract<TokenRedemption, { ok: false }>> {
	const [row] = await db()
		.select({
			id: inviteToken.id,
			applicationId: inviteToken.applicationId,
			expiresAt: inviteToken.expiresAt,
			usedAt: inviteToken.usedAt,
		})
		.from(inviteToken)
		.where(eq(inviteToken.tokenHash, hashToken(token)))
		.limit(1);

	if (!row) return { ok: false, reason: 'unknown' };
	if (row.usedAt) return { ok: false, reason: 'used' };
	// Expired at `expiresAt` itself, matching the `gt()` the redeem uses.
	if (row.expiresAt <= new Date()) return { ok: false, reason: 'expired' };
	return { row };
}

/**
 * What a token is worth, without spending it.
 *
 * Called while rendering /join-slack, which is fetched by every link scanner
 * and preview unfurler between the email and the person. Redeeming on that
 * GET burned the single-use token before anyone clicked; the page now shows
 * a button and the form action redeems.
 */
export async function slackInviteForToken(
	token: string,
): Promise<TokenRedemption> {
	const found = await lookup(token);
	return 'row' in found
		? { ok: true, applicationId: found.row.applicationId }
		: found;
}

/**
 * Redeem a token. The read is a plain select; the conditional update below is
 * what stops two concurrent requests from both succeeding.
 */
export async function redeemSlackInviteToken(
	token: string,
): Promise<TokenRedemption> {
	const found = await lookup(token);
	if (!('row' in found)) return found;

	// Conditional update: only the request that flips usedAt from null wins, and
	// only while the token is still live — a re-send between the lookup and
	// here supersedes it, and the superseded link must not admit anyone.
	const redeemedAt = new Date();
	const claimed = await db()
		.update(inviteToken)
		.set({ usedAt: redeemedAt })
		.where(
			and(
				eq(inviteToken.id, found.row.id),
				isNull(inviteToken.usedAt),
				gt(inviteToken.expiresAt, redeemedAt),
			),
		)
		.returning({ id: inviteToken.id });

	if (claimed.length > 0) {
		return { ok: true, applicationId: found.row.applicationId };
	}

	// Lost to either a concurrent redemption or a supersession; the row says which.
	const [current] = await db()
		.select({ usedAt: inviteToken.usedAt })
		.from(inviteToken)
		.where(eq(inviteToken.id, found.row.id))
		.limit(1);
	return { ok: false, reason: current?.usedAt ? 'used' : 'expired' };
}
