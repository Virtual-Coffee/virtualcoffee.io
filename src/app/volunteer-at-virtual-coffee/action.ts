'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';

import { db, volunteerSignup } from '@/db';
import { notifySlack, volunteerSignupMessage } from '@/lib/slack/notify';
import { notifyAndRecord, persistSubmission } from '@/lib/submitSubmission';
import { fieldErrorsFrom } from '@/util/forms/parse';
import { looksLikeSpam } from '@/util/forms/spamGuard';
import type { FormState } from '@/util/forms/types';

const schema = z.object({
	name: z.string().trim().min(1, 'Please tell us your name.').max(200),
	email: z.email('That doesn’t look like an email address.').max(320),
	// Required in the browser, so required here too — server validation that is
	// laxer than the form's own `required` attributes is validation in name only.
	github_username: z
		.string()
		.trim()
		.min(1, 'Please give us your GitHub username.')
		.max(100)
		// Accept a pasted profile URL or an @handle as well as a bare username.
		.transform((value) =>
			value
				.replace(/^https?:\/\/(www\.)?github\.com\//i, '')
				.replace(/^@/, '')
				.replace(/\/$/, ''),
		),
	position: z
		.string()
		.trim()
		.min(1, 'Please tell us which role you’re interested in.')
		.max(300),
	description: z
		.string()
		.trim()
		.min(1, 'Please share any details or thoughts.')
		.max(5000),
	agree: z.literal('agree', {
		message: 'Please confirm you’ve read the Code of Conduct.',
	}),
});

export async function submitVolunteerSignup(
	_state: FormState,
	formData: FormData,
): Promise<FormState> {
	if (looksLikeSpam(formData)) {
		redirect('/volunteer-at-virtual-coffee/thanks');
	}

	const parsed = schema.safeParse({
		name: formData.get('name') ?? '',
		email: formData.get('email') ?? '',
		github_username: formData.get('github_username') ?? '',
		position: formData.get('position') ?? '',
		description: formData.get('description') ?? '',
		agree: formData.get('agree') ?? '',
	});

	if (!parsed.success) {
		return {
			is_error: true,
			message: 'Please check the highlighted fields.',
			fieldErrors: fieldErrorsFrom(parsed.error),
		};
	}

	const saved = await persistSubmission(
		'volunteers',
		async () => {
			const [row] = await db()
				.insert(volunteerSignup)
				.values({
					name: parsed.data.name,
					email: parsed.data.email,
					githubUsername: parsed.data.github_username,
					position: parsed.data.position,
					description: parsed.data.description,
				})
				.returning({ id: volunteerSignup.id });
			return row;
		},
		{
			submitted: 'Signup submitted',
			failed:
				'Something went wrong saving your form. Please try again, or email hello@virtualcoffee.io.',
		},
	);
	if ('error' in saved) return saved.error;

	await notifyAndRecord('volunteers', saved.id, async () => {
		return notifySlack(
			'volunteers',
			volunteerSignupMessage({
				name: parsed.data.name,
				email: parsed.data.email,
				position: parsed.data.position,
				description: parsed.data.description,
			}),
		);
	});

	redirect('/volunteer-at-virtual-coffee/thanks');
}
