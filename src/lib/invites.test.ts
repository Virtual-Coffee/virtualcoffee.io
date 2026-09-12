import { afterEach, describe, expect, test, vi } from 'vitest';

import { CLAIM_TOKEN_TTL_DAYS, hashClaimToken, newClaimToken } from './invites';

describe('hashClaimToken', () => {
	test('is a stable sha256 hex digest', () => {
		expect(hashClaimToken('abc')).toBe(
			'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
		);
		expect(hashClaimToken('abc')).toBe(hashClaimToken('abc'));
		expect(hashClaimToken('abd')).not.toBe(hashClaimToken('abc'));
	});
});

describe('newClaimToken', () => {
	afterEach(() => vi.useRealTimers());

	test('is 32 random bytes as base64url, expiring 90 days out', () => {
		vi.useFakeTimers({ now: Date.parse('2026-09-12T00:00:00Z') });

		const { token, expiresAt } = newClaimToken();
		expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/);
		expect(expiresAt.toISOString()).toBe('2026-12-11T00:00:00.000Z');
		expect(CLAIM_TOKEN_TTL_DAYS).toBe(90);
	});

	test('two tokens differ', () => {
		expect(newClaimToken().token).not.toBe(newClaimToken().token);
	});
});
