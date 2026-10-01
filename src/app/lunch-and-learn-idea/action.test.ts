import { describe, expect, test } from 'vitest';

import { fieldErrors, formDataWith } from '@/test/forms';
import { redirectTo } from '@/test/next';

import { submitLunchAndLearnIdea } from './action';

const submit = (formData: FormData) => submitLunchAndLearnIdea(null, formData);

describe('submitLunchAndLearnIdea', () => {
	test('a bot sees the thanks page', async () => {
		await expect(
			submit(formDataWith({}, { spam: true })),
		).rejects.toMatchObject(redirectTo('/lunch-and-learn-idea/thanks'));
	});

	test('the fields are capitalised, as the form has always named them', async () => {
		// Lower-case keys are the wrong form: every required field is missing.
		await expect(
			submit(
				formDataWith({
					name: 'Ada',
					email: 'ada@example.test',
					topic: 'Testing',
					description: 'x',
					timing: 'Friday',
					agree: 'agree',
				}),
			),
		).resolves.toEqual(
			fieldErrors({
				Name: 'Please tell us your name.',
				Email: 'That doesn’t look like an email address.',
				Topic: 'Please give your Lunch & Learn a title.',
				Description: 'Please give us a description we can share.',
				Timing: 'Please tell us what date and time works for you.',
			}),
		);
	});

	test('Format is the only optional field', async () => {
		await expect(
			submit(
				formDataWith({
					Name: 'Ada',
					Email: 'ada@example.test',
					Topic: 'Testing',
					Description: 'x',
					Timing: '',
					agree: 'agree',
				}),
			),
		).resolves.toEqual(
			fieldErrors({
				Timing: 'Please tell us what date and time works for you.',
			}),
		);
	});
});
