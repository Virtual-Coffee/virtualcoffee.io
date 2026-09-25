import { afterEach, describe, expect, test, vi } from 'vitest';

import {
	checkSpam,
	HONEYPOT_FIELD,
	issueTimestamp,
	MIN_ELAPSED_MS,
	reissueTimestamp,
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

describe('checkSpam', () => {
	afterEach(() => vi.unstubAllEnvs());

	test('a form filled in at a human pace passes', () => {
		expect(checkSpam(submission(), RENDERED_AT + 3 * SECOND)).toBe('ok');
		expect(checkSpam(submission(), RENDERED_AT + 23 * HOUR)).toBe('ok');
	});

	test('under 2 s is a bot; over 24 h is a person who left the tab open', () => {
		expect(checkSpam(submission(), RENDERED_AT + 1_999)).toBe('invalid');
		expect(checkSpam(submission(), RENDERED_AT + 2_000)).toBe('ok');
		expect(checkSpam(submission(), RENDERED_AT + 24 * HOUR)).toBe('ok');
		expect(checkSpam(submission(), RENDERED_AT + 24 * HOUR + 1)).toBe('stale');
	});

	test('a submission from before the form was rendered is spam', () => {
		expect(checkSpam(submission(), RENDERED_AT - SECOND)).toBe('invalid');
	});

	test('anything in the honeypot is spam, whitespace is not', () => {
		const now = RENDERED_AT + 5 * SECOND;
		expect(
			checkSpam(submission({ [HONEYPOT_FIELD]: 'https://x.test' }), now),
		).toBe('honeypot');
		expect(checkSpam(submission({ [HONEYPOT_FIELD]: '   ' }), now)).toBe('ok');
	});

	test('a stale token with something in the honeypot is still a bot', () => {
		expect(
			checkSpam(submission({ [HONEYPOT_FIELD]: 'x' }), RENDERED_AT + 25 * HOUR),
		).toBe('honeypot');
	});

	/**
	 * Every malformed token must come back as `invalid`, never throw: the file
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
		expect(checkSpam(formData, RENDERED_AT + 5 * SECOND)).toBe('invalid');
	});

	test('back-dating the value breaks the signature', () => {
		const [, signature] = issueTimestamp(RENDERED_AT).split('.');
		const formData = submission({
			[TIMESTAMP_FIELD]: `${RENDERED_AT - HOUR}.${signature}`,
		});
		expect(checkSpam(formData, RENDERED_AT + 5 * SECOND)).toBe('invalid');
	});

	test('a token signed under one secret is rejected under another', () => {
		vi.stubEnv('BETTER_AUTH_SECRET', 'secret-a');
		const formData = submission();
		expect(checkSpam(formData, RENDERED_AT + 5 * SECOND)).toBe('ok');

		vi.stubEnv('BETTER_AUTH_SECRET', 'secret-b');
		expect(checkSpam(formData, RENDERED_AT + 5 * SECOND)).toBe('invalid');
	});
});

describe('issueTimestamp', () => {
	test('is the millisecond timestamp and a hex HMAC, dot-separated', () => {
		expect(issueTimestamp(RENDERED_AT)).toMatch(
			new RegExp(`^${RENDERED_AT}\\.[0-9a-f]{64}$`),
		);
	});
});

describe('reissueTimestamp', () => {
	test('a form re-rendered after an error can be resubmitted at once', () => {
		const formData = submission();
		formData.set(TIMESTAMP_FIELD, reissueTimestamp(RENDERED_AT));
		expect(checkSpam(formData, RENDERED_AT)).toBe('ok');
		expect(reissueTimestamp(RENDERED_AT)).toBe(
			issueTimestamp(RENDERED_AT - MIN_ELAPSED_MS),
		);
	});
});
