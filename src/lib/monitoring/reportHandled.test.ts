import { captureException } from '@sentry/nextjs';
import { beforeEach, expect, test, vi } from 'vitest';

import { reportHandled } from './reportHandled';

vi.mock('@sentry/nextjs', () => ({ captureException: vi.fn() }));

const capture = vi.mocked(captureException);

beforeEach(() => capture.mockReset());

function sent(): { error: Error; context: unknown } {
	const [error, context] = capture.mock.lastCall ?? [];
	return { error: error as Error, context };
}

test('tags the event as handled, in its area, with the caller’s tags', () => {
	reportHandled(new Error('boom'), {
		area: 'outbound',
		tags: { outbound: 'github issue' },
	});

	expect(sent().context).toEqual({
		level: 'error',
		tags: { reported: 'handled', area: 'outbound', outbound: 'github issue' },
	});
});

test('an email address is masked in the message and the stack', () => {
	const error = new Error('550 rejected <ada@example.test>');
	reportHandled(error, { area: 'outbound' });

	const { error: copy } = sent();
	expect(copy).not.toBe(error);
	expect(copy.message).toBe('550 rejected <a•••@example.test>');
	expect(copy.stack).not.toContain('ada@example.test');
	expect(copy.stack).toContain('a•••@example.test');
});

test('a failed query keeps its SQL and drops the params', () => {
	const pg = Object.assign(new Error('duplicate key value'), {
		code: '23505',
		constraint: 'application_email_key',
		table: 'membership_application',
		detail: 'Key (email)=(ada@example.test) already exists.',
		where: 'SQL statement',
	});
	const query = Object.assign(
		new Error(
			'Failed query: insert into "membership_application" values ($1, $2)\nparams: Ada,ada@example.test',
		),
		{
			name: 'DrizzleQueryError',
			query: 'insert into "membership_application" values ($1, $2)',
			params: ['Ada', 'ada@example.test'],
			cause: pg,
		},
	);

	reportHandled(query, { area: 'join' });

	const { error, context } = sent();
	expect(error.message).toBe(
		'Failed query: insert into "membership_application" values ($1, $2)',
	);
	expect(error.stack).not.toContain('params');
	expect(error).not.toHaveProperty('params');
	expect(error.cause).toBeInstanceOf(Error);
	expect(error.cause).toHaveProperty('message', 'duplicate key value');
	expect(error.cause).not.toHaveProperty('detail');
	expect(error.cause).not.toHaveProperty('where');
	expect(context).toMatchObject({
		contexts: {
			error: {
				code: '23505',
				constraint: 'application_email_key',
				table: 'membership_application',
			},
		},
	});
});

test('a thrown non-Error is replaced, never serialised', () => {
	reportHandled({ email: 'ada@example.test' }, { area: 'join' });
	expect(sent().error.message).toBe('A non-Error value was thrown.');

	reportHandled('no ada@example.test', { area: 'join' });
	expect(sent().error.message).toBe('no a•••@example.test');
});
