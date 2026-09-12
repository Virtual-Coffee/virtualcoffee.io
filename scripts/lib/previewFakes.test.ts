import { createHash } from 'node:crypto';

import { faker } from '@faker-js/faker';
import { describe, expect, test, vi } from 'vitest';

import {
	FAKE_EMAIL_DOMAIN,
	fakeEmail,
	fakeSlackId,
	seedFor,
} from './previewFakes';

describe('seedFor', () => {
	test('is a non-negative integer, stable per input', () => {
		expect(seedFor('rec123')).toBe(seedFor('rec123'));
		expect(seedFor(42)).toBe(seedFor('42'));
		expect(seedFor('a')).not.toBe(seedFor('b'));
		expect(Number.isInteger(seedFor('x'))).toBe(true);
		expect(seedFor('a long id that overflows the hash')).toBeGreaterThanOrEqual(
			0,
		);
	});
});

describe('fakeSlackId', () => {
	/**
	 * The same real id lands in five tables; the fake has to be the same in all
	 * of them or a preview's volunteers lose their balances (docs/adr/0009).
	 */
	test('is deterministic, so the five tables still join', () => {
		expect(fakeSlackId('U0AB12CD3')).toBe(fakeSlackId('U0AB12CD3'));
		expect(fakeSlackId('U0AB12CD3')).not.toBe(fakeSlackId('U0AB12CD4'));
	});

	test('two real ids that collide in the faker seed still get distinct fakes', () => {
		expect(seedFor('UAOABCDEF')).toBe(seedFor('UB0ABCDEF'));
		expect(fakeSlackId('UAOABCDEF')).not.toBe(fakeSlackId('UB0ABCDEF'));
		faker.seed(1);
		const a = fakeEmail('UAOABCDEF');
		faker.seed(1);
		expect(fakeEmail('UB0ABCDEF')).not.toBe(a);
	});

	test('keeps the Slack shape without being the real id', () => {
		const fake = fakeSlackId('U0AB12CD3');
		expect(fake).toMatch(/^U[0-9A-F]{10}$/);
		expect(fake).not.toBe('U0AB12CD3');
	});

	/**
	 * CWE-200: an unkeyed hash of a known Slack id is recomputable by anyone
	 * who knows the id, which would let a preview reader find that person's
	 * sanitized rows. The hash has to be salted.
	 */
	test('is not the bare sha256 of the real id', () => {
		const bare = createHash('sha256').update('U0AB12CD3').digest('hex');
		expect(fakeSlackId('U0AB12CD3')).not.toBe(
			`U${bare.slice(0, 10).toUpperCase()}`,
		);
		faker.seed(1);
		expect(fakeEmail('U0AB12CD3')).not.toContain(`.${bare.slice(0, 10)}@`);
	});

	test('does not survive a fresh run — only within-run consistency is promised', async () => {
		const first = fakeSlackId('U0AB12CD3');
		vi.resetModules();
		const fresh = await import('./previewFakes');
		expect(fresh.fakeSlackId('U0AB12CD3')).not.toBe(first);
	});
});

describe('fakeEmail', () => {
	test('ends in the reserved domain and carries a suffix derived from the id', () => {
		faker.seed(1);
		const email = fakeEmail('rec123');
		expect(email).toMatch(
			new RegExp(`^[a-z0-9._-]+\\.[0-9a-f]{10}@${FAKE_EMAIL_DOMAIN}$`),
		);
		expect(FAKE_EMAIL_DOMAIN).toBe('preview.invalid');
	});

	test('is stable for a given faker seed within a run', () => {
		faker.seed(seedFor('rec123'));
		const first = fakeEmail('rec123');
		faker.seed(seedFor('rec123'));
		expect(fakeEmail('rec123')).toBe(first);
	});
});
