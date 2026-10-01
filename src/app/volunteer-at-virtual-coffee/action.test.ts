import { describe, expect, test } from 'vitest';

import { fieldErrors, formDataWith } from '@/test/forms';
import { redirectTo } from '@/test/next';

import { submitVolunteerSignup } from './action';

const submit = (formData: FormData) => submitVolunteerSignup(null, formData);

describe('submitVolunteerSignup', () => {
	test('a bot sees the thanks page', async () => {
		await expect(
			submit(formDataWith({}, { spam: true })),
		).rejects.toMatchObject(redirectTo('/volunteer-at-virtual-coffee/thanks'));
	});

	test('everything the browser marks required is required here too', async () => {
		await expect(submit(formDataWith({}))).resolves.toEqual(
			fieldErrors({
				name: 'Please tell us your name.',
				email: 'That doesn’t look like an email address.',
				github_username: 'Please give us your GitHub username.',
				position: 'Please tell us which role you’re interested in.',
				description: 'Please share any details or thoughts.',
				agree: 'Please confirm you’ve read the Code of Conduct.',
			}),
		);
	});
});
