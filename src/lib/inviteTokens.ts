import { and, eq, isNull } from 'drizzle-orm';

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

export async function createSlackInviteToken(
	applicationId: string,
): Promise<{ token: string; expiresAt: Date }> {
	const { token, expiresAt } = newToken(TOKEN_TTL_DAYS);

	await db()
		.insert(inviteToken)
		.values({
			applicationId,
			purpose: 'slack',
			tokenHash: hashToken(token),
			expiresAt,
		});

	return { token, expiresAt };
}

export type TokenRedemption =
	| { ok: true; applicationId: string }
	| { ok: false; reason: 'unknown' | 'used' | 'expired' };

/**
 * Redeem a token. The read is a plain select; the conditional update below is
 * what stops two concurrent requests from both succeeding.
 */
export async function redeemSlackInviteToken(
	token: string,
): Promise<TokenRedemption> {
	const database = db();
	const tokenHash = hashToken(token);

	const [row] = await database
		.select({
			id: inviteToken.id,
			applicationId: inviteToken.applicationId,
			expiresAt: inviteToken.expiresAt,
			usedAt: inviteToken.usedAt,
		})
		.from(inviteToken)
		.where(eq(inviteToken.tokenHash, tokenHash))
		.limit(1);

	if (!row) return { ok: false, reason: 'unknown' };
	if (row.usedAt) return { ok: false, reason: 'used' };
	if (row.expiresAt < new Date()) return { ok: false, reason: 'expired' };

	// Conditional update: only the request that flips usedAt from null wins.
	const claimed = await database
		.update(inviteToken)
		.set({ usedAt: new Date() })
		.where(and(eq(inviteToken.id, row.id), isNull(inviteToken.usedAt)))
		.returning({ id: inviteToken.id });

	if (claimed.length === 0) return { ok: false, reason: 'used' };

	return { ok: true, applicationId: row.applicationId };
}
