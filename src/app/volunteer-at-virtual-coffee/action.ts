'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';

import { volunteerSignup } from '@/db';
import { submissionPath } from '@/lib/admin/links';
import { notifySlack, volunteerSignupMessage } from '@/lib/slack/notify';
import {
	notifyAndRecord,
	persistSubmission,
} from '@/lib/submissions/submitSubmission';
import { agree, email, name } from '@/util/forms/fields';
import { intake, savingFailed } from '@/util/forms/intake';
import { githubUsername } from '@/util/forms/parse';
import type { FormState } from '@/util/forms/types';
import { siteUrl } from '@/util/url.server';

const THANKS = '/volunteer-at-virtual-coffee/thanks';

const schema = z.object({
	name: name(),
	email: email(),
	// Required in the browser, so required here too — server validation that is
	// laxer than the form's own `required` attributes is validation in name only.
	github_username: githubUsername('Please give us your GitHub username.'),
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
	agree: agree(),
});

export async function submitVolunteerSignup(
	_state: FormState,
	formData: FormData,
): Promise<FormState> {
	const parsed = intake(formData, { schema, thanks: THANKS });
	if (!parsed.ok) return parsed.state;

	const signup = {
		name: parsed.data.name,
		email: parsed.data.email,
		githubUsername: parsed.data.github_username,
		position: parsed.data.position,
		description: parsed.data.description,
	};

	const saved = await persistSubmission(
		'volunteers',
		async (tx) => {
			const [row] = await tx
				.insert(volunteerSignup)
				.values(signup)
				.returning({ id: volunteerSignup.id });
			return row;
		},
		{
			submitted: 'Signup submitted',
			failed: savingFailed(),
		},
	);
	if ('error' in saved) return saved.error;

	await notifyAndRecord(
		'volunteers',
		saved.id,
		{ channel: 'slack', what: 'Slack notified of a Volunteer signup' },
		async () => {
			return notifySlack(
				'volunteers',
				volunteerSignupMessage({
					name: signup.name,
					email: signup.email,
					position: signup.position,
					adminUrl: `${siteUrl()}${submissionPath('volunteers', saved.id)}`,
				}),
			);
		},
	);

	redirect(THANKS);
}
