import { createHash, randomBytes } from 'crypto';

/**
 * Single-use secrets sent by email: Slack invite tokens and Claim Links. Only
 * the hash is stored, so a database leak does not yield working links.
 */

export function hashToken(token: string): string {
	return createHash('sha256').update(token).digest('hex');
}

export function newToken(ttlDays: number): { token: string; expiresAt: Date } {
	return {
		token: randomBytes(32).toString('base64url'),
		expiresAt: new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000),
	};
}
