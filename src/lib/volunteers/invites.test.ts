import { describe, expect, test } from 'vitest';

import { hashClaimToken, periodKey } from './invites';

describe('hashClaimToken', () => {
	test('is a stable sha256 hex digest', () => {
		expect(hashClaimToken('abc')).toBe(
			'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
		);
		expect(hashClaimToken('abc')).toBe(hashClaimToken('abc'));
		expect(hashClaimToken('abd')).not.toBe(hashClaimToken('abc'));
	});
});

describe('periodKey', () => {
	test('is the UTC year and month', () => {
		expect(periodKey(new Date('2026-01-31T23:59:59Z'))).toBe('2026-01');
		expect(periodKey(new Date('2026-02-01T00:00:00Z'))).toBe('2026-02');
	});

	test('a local evening on the 31st is already next month in UTC', () => {
		// The scheduled function runs on Netlify's clock; the key must not depend
		// on whichever zone a maintainer happens to run it from by hand.
		expect(periodKey(new Date('2026-01-31T23:30:00-05:00'))).toBe('2026-02');
	});
});
