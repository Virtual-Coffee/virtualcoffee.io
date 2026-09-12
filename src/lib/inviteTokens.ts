import { and, eq, gt, isNull } from 'drizzle-orm';

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
 * Mint a Slack invite token, superseding any still-live one for the same
 * application. One working link at a time: a re-send is for a link that was
 * lost, and a lost link is one somebody else may be holding — for up to 30
 * days, if it were left to expire on its own. The old link then reads as
 * expired on /join-slack, which is also what it is.
 */
export async function createSlackInviteToken(
	applicationId: string,
): Promise<{ token: string; expiresAt: Date }> {
	const { token, expiresAt } = newToken(TOKEN_TTL_DAYS);
	const now = new Date();

	await db().transaction(async (tx) => {
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

		await tx.insert(inviteToken).values({
			applicationId,
			purpose: 'slack',
			tokenHash: hashToken(token),
			expiresAt,
		});
	});

	return { token, expiresAt };
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
	if (row.expiresAt < new Date()) return { ok: false, reason: 'expired' };
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

	// Conditional update: only the request that flips usedAt from null wins.
	const claimed = await db()
		.update(inviteToken)
		.set({ usedAt: new Date() })
		.where(and(eq(inviteToken.id, found.row.id), isNull(inviteToken.usedAt)))
		.returning({ id: inviteToken.id });

	if (claimed.length === 0) return { ok: false, reason: 'used' };

	return { ok: true, applicationId: found.row.applicationId };
}
