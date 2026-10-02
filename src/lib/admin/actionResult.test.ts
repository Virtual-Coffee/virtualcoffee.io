import { expect, test } from 'vitest';

import { emailFailed, emailWentButRowMoved } from './actionResult';

test('a definite failure says nothing was emailed', () => {
	expect(
		emailFailed({
			message: 'Could not reach the mail server.',
			definitelyNotSent: true,
		}),
	).toEqual({
		ok: false,
		message: 'Could not reach the mail server.',
		emailSent: false,
	});
});

// A timeout may have stranded a message the server had begun accepting.
test('an uncertain failure is unknown, not false', () => {
	expect(
		emailFailed({
			message: 'Could not reach the mail server.',
			definitelyNotSent: false,
		}),
	).toEqual({
		ok: false,
		message: 'Could not reach the mail server.',
		emailSent: 'unknown',
	});
});

test('a send that beat a lost race still says the email went', () => {
	expect(emailWentButRowMoved('Ada’s application changed.')).toEqual({
		ok: false,
		message: 'Ada’s application changed.',
		emailSent: true,
	});
});
