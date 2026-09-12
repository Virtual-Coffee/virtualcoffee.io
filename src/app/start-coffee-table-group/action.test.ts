import { describe, expect, test } from 'vitest';

import { fieldErrors, formDataWith } from '@/test/forms';
import { redirectTo } from '@/test/next';

import { submitCoffeeTableGroupRequest } from './action';

const submit = (formData: FormData) =>
	submitCoffeeTableGroupRequest(null, formData);

describe('submitCoffeeTableGroupRequest', () => {
	test('a bot sees the thanks page', async () => {
		await expect(
			submit(formDataWith({}, { spam: true })),
		).rejects.toMatchObject(redirectTo('/start-coffee-table-group/thanks'));
	});

	test('the required fields', async () => {
		await expect(submit(formDataWith({}))).resolves.toEqual(
			fieldErrors({
				name: 'Please tell us your name.',
				email: 'That doesn’t look like an email address.',
				group_name: 'Please name your Coffee Table Group.',
				description: 'Please describe your group idea.',
				agree: 'Please confirm you’ve read the Code of Conduct.',
			}),
		);
	});

	test('a group name of 200 characters is fine; 201 is not', async () => {
		const base = {
			name: 'Ada',
			email: 'ada@example.test',
			description: 'Weekly',
			agree: 'agree',
		};
		const long = await submit(
			formDataWith({ ...base, group_name: 'x'.repeat(201) }),
		);
		expect(Object.keys(long?.fieldErrors ?? {})).toEqual(['group_name']);
	});
});
