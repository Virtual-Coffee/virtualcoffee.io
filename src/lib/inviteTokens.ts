import { and, eq, gt, isNull, lt } from 'drizzle-orm';

import { db, inviteToken } from '@/db';
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
 * Mint a Slack invite token. Minting never touches an earlier one: the email
 * that carries this token has not gone yet, and until it has, the previous
 * link is the only one the member holds. Two maintainers approving the same
 * person at once each mint before the status change decides who won, and
 * the loser must not have killed the winner's link on the way in — it
 * expires its own with `expireSlackInviteToken`. A re-send retires the
 * earlier links with `supersedeSlackInviteTokens` once its email has gone.
 */
export async function createSlackInviteToken(
	applicationId: string,
): Promise<{ id: string; token: string; expiresAt: Date }> {
	const { token, expiresAt } = newToken(TOKEN_TTL_DAYS);

	const [row] = await db()
		.insert(inviteToken)
		.values({
			applicationId,
			purpose: 'slack',
			tokenHash: hashToken(token),
			expiresAt,
		})
		.returning({ id: inviteToken.id });

	return { id: row.id, token, expiresAt };
}

/**
 * Expire one token, by id, as of `now`: a send that failed after its token
 * was minted kills the link that may nonetheless have been delivered — a
 * timed-out send can still have gone — and only that one, so the link the
 * member already holds keeps working.
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

/**
 * The supersession: expire every live Slack token for an application minted
 * before `keep`, as of `now` — one working link at a time. A re-send is for a
 * link that was lost, and a lost link is one somebody else may be holding,
 * for up to 30 days if it were left to expire on its own. By `createdAt`
 * rather than "all but `keep`" so the newest link always survives, whichever
 * of two concurrent re-sends finishes last; the old link then reads as
 * expired on /join-slack, which is also what it is. Compared in the database
 * — a `created_at` read back into a JS Date loses the microseconds that tell
 * two tokens minted in the same millisecond apart.
 */
export async function supersedeSlackInviteTokens(
	applicationId: string,
	keep: { id: string },
	now: Date,
): Promise<void> {
	const kept = db()
		.select({ createdAt: inviteToken.createdAt })
		.from(inviteToken)
		.where(eq(inviteToken.id, keep.id));
	await db()
		.update(inviteToken)
		.set({ expiresAt: now })
		.where(
			and(
				eq(inviteToken.applicationId, applicationId),
				eq(inviteToken.purpose, 'slack'),
				isNull(inviteToken.usedAt),
				gt(inviteToken.expiresAt, now),
				lt(inviteToken.createdAt, kept),
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
