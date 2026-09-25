import { describe, expect, test } from 'vitest';
import { z } from 'zod';

import { fieldErrors, formDataWith, staleFormState } from '@/test/forms';
import { redirectTo } from '@/test/next';

import { intake } from './intake';

const schema = z.object({
	name: z.string().trim().min(1, 'Please tell us your name.').max(200),
	pronouns: z.string().trim().max(100).optional(),
});

const THANKS = '/example/thanks';

const run = (formData: FormData) =>
	intake(formData, { schema, thanks: THANKS });

/** What `redirect()` threw, since `intake` is synchronous. */
function redirected(formData: FormData): unknown {
	try {
		run(formData);
	} catch (error) {
		return error;
	}
	throw new Error('expected a redirect');
}

describe('intake', () => {
	test('a bot is sent to the thank-you page and nothing is parsed', () => {
		expect(
			redirected(formDataWith({ name: '' }, { spam: true })),
		).toMatchObject(redirectTo(THANKS));
	});

	test('a stale token asks the person to submit again, with a fresh token', () => {
		const result = run(formDataWith({ name: 'Ada' }, { stale: true }));
		if (result.ok) throw new Error('expected a stale form');

		expect(result.state).toEqual(staleFormState());
	});

	test('a failing schema comes back as field errors', () => {
		const result = run(formDataWith({ name: '   ' }));
		if (result.ok) throw new Error('expected a validation failure');

		expect(result.state).toEqual(
			fieldErrors({ name: 'Please tell us your name.' }),
		);
	});

	test('a valid submission hands back the parsed data', () => {
		const result = run(formDataWith({ name: '  Ada  ', pronouns: '   ' }));
		if (!result.ok) throw new Error('expected a pass');

		expect(result.data).toEqual({ name: 'Ada', pronouns: undefined });
	});
});
