import { describe, expect, test } from 'vitest';

import { fieldErrors, formDataWith } from '@/test/forms';
import { redirectTo } from '@/test/next';

import { submitMembershipApplication } from './action';

const valid = {
	name: 'Ada Lovelace',
	email: 'ada@example.test',
	agree: 'agree',
};

const submit = (formData: FormData) =>
	submitMembershipApplication(null, formData);

describe('submitMembershipApplication', () => {
	test('a bot sees the thank-you page and gets no field errors', async () => {
		await expect(
			submit(formDataWith(valid, { spam: true })),
		).rejects.toMatchObject(redirectTo('/join/thank-you'));
	});

	test('the three required fields', async () => {
		await expect(submit(formDataWith({}))).resolves.toEqual(
			fieldErrors({
				name: 'Please tell us your name.',
				email: 'That doesn’t look like an email address.',
				agree: 'Please confirm you’ve read the Code of Conduct.',
			}),
		);
	});

	test('whitespace is not a name, and the box must actually be ticked', async () => {
		await expect(
			submit(formDataWith({ ...valid, name: '   ', agree: 'on' })),
		).resolves.toEqual(
			fieldErrors({
				name: 'Please tell us your name.',
				agree: 'Please confirm you’ve read the Code of Conduct.',
			}),
		);
	});

	test('length limits hold on the optional fields too', async () => {
		const result = await submit(
			formDataWith({
				...valid,
				pronouns: 'x'.repeat(101),
				journey: 'x'.repeat(5001),
			}),
		);
		expect(result).toMatchObject({ is_error: true });
		expect(Object.keys(result?.fieldErrors ?? {}).sort()).toEqual([
			'journey',
			'pronouns',
		]);
	});
});
