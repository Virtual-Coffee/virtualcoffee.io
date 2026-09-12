import { afterEach, describe, expect, test, vi } from 'vitest';

import {
	HONEYPOT_FIELD,
	issueTimestamp,
	looksLikeSpam,
	TIMESTAMP_FIELD,
} from './spamGuard';

const RENDERED_AT = Date.parse('2026-09-12T12:00:00Z');
const SECOND = 1_000;
const HOUR = 60 * 60 * SECOND;

function submission(
	overrides: Record<string, string> = {},
	renderedAt = RENDERED_AT,
): FormData {
	const formData = new FormData();
	formData.set(TIMESTAMP_FIELD, issueTimestamp(renderedAt));
	formData.set(HONEYPOT_FIELD, '');
	for (const [key, value] of Object.entries(overrides)) {
		formData.set(key, value);
	}
	return formData;
}

describe('looksLikeSpam', () => {
	afterEach(() => vi.unstubAllEnvs());

	test('a form filled in at a human pace passes', () => {
		expect(looksLikeSpam(submission(), RENDERED_AT + 3 * SECOND)).toBe(false);
		expect(looksLikeSpam(submission(), RENDERED_AT + 11 * HOUR)).toBe(false);
	});

	test('the window is closed at both ends: under 2 s and over 12 h', () => {
		expect(looksLikeSpam(submission(), RENDERED_AT + 1_999)).toBe(true);
		expect(looksLikeSpam(submission(), RENDERED_AT + 2_000)).toBe(false);
		expect(looksLikeSpam(submission(), RENDERED_AT + 12 * HOUR)).toBe(false);
		expect(looksLikeSpam(submission(), RENDERED_AT + 12 * HOUR + 1)).toBe(true);
	});

	test('a submission from before the form was rendered is spam', () => {
		expect(looksLikeSpam(submission(), RENDERED_AT - SECOND)).toBe(true);
	});

	test('anything in the honeypot is spam, whitespace is not', () => {
		const now = RENDERED_AT + 5 * SECOND;
		expect(
			looksLikeSpam(submission({ [HONEYPOT_FIELD]: 'https://x.test' }), now),
		).toBe(true);
		expect(looksLikeSpam(submission({ [HONEYPOT_FIELD]: '   ' }), now)).toBe(
			false,
		);
	});

	/**
	 * Every malformed token must come back as `true`, never throw: the file
	 * promises a silent drop, and `timingSafeEqual` throws on a length mismatch
	 * if the alphabet check before it is ever lost.
	 */
	test.each([
		['missing', undefined],
		['no separator', String(RENDERED_AT)],
		['empty signature', `${RENDERED_AT}.`],
		['wrong alphabet, right length', `${RENDERED_AT}.${'z'.repeat(64)}`],
		['right alphabet, wrong length', `${RENDERED_AT}.${'a'.repeat(63)}`],
		['non-numeric value', `now.${'a'.repeat(64)}`],
		['a File instead of a string', new File(['x'], 'x.txt')],
	])('a %s token is spam and does not throw', (_label, token) => {
		const formData = submission();
		if (token === undefined) formData.delete(TIMESTAMP_FIELD);
		else formData.set(TIMESTAMP_FIELD, token);
		expect(looksLikeSpam(formData, RENDERED_AT + 5 * SECOND)).toBe(true);
	});

	test('back-dating the value breaks the signature', () => {
		const [, signature] = issueTimestamp(RENDERED_AT).split('.');
		const formData = submission({
			[TIMESTAMP_FIELD]: `${RENDERED_AT - HOUR}.${signature}`,
		});
		expect(looksLikeSpam(formData, RENDERED_AT + 5 * SECOND)).toBe(true);
	});

	test('a token signed under one secret is rejected under another', () => {
		vi.stubEnv('BETTER_AUTH_SECRET', 'secret-a');
		const formData = submission();
		expect(looksLikeSpam(formData, RENDERED_AT + 5 * SECOND)).toBe(false);

		vi.stubEnv('BETTER_AUTH_SECRET', 'secret-b');
		expect(looksLikeSpam(formData, RENDERED_AT + 5 * SECOND)).toBe(true);
	});
});

describe('issueTimestamp', () => {
	test('is the millisecond timestamp and a hex HMAC, dot-separated', () => {
		expect(issueTimestamp(RENDERED_AT)).toMatch(
			new RegExp(`^${RENDERED_AT}\\.[0-9a-f]{64}$`),
		);
	});
});
