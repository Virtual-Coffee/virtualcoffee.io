import { faker } from '@faker-js/faker';
import { describe, expect, test } from 'vitest';

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

	test('keeps the Slack shape without being the real id', () => {
		const fake = fakeSlackId('U0AB12CD3');
		expect(fake).toMatch(/^U[0-9A-Z]{8,}$/);
		expect(fake).not.toBe('U0AB12CD3');
	});
});

describe('fakeEmail', () => {
	test('ends in the reserved domain and carries the id-derived suffix', () => {
		faker.seed(1);
		const email = fakeEmail('rec123');
		expect(email).toMatch(
			new RegExp(
				`^[a-z0-9._-]+\\.${seedFor('rec123').toString(36)}@${FAKE_EMAIL_DOMAIN}$`,
			),
		);
		expect(FAKE_EMAIL_DOMAIN).toBe('preview.invalid');
	});

	test('is stable for a given faker seed, which is what makes reruns diffable', () => {
		faker.seed(seedFor('rec123'));
		const first = fakeEmail('rec123');
		faker.seed(seedFor('rec123'));
		expect(fakeEmail('rec123')).toBe(first);
	});
});
