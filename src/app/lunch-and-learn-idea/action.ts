'use server';

import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import { db, lunchAndLearnIdea } from '@/db';
import { createLunchAndLearnIssue } from '@/lib/github/issues';
import { lunchAndLearnMessage, notifySlack } from '@/lib/slack/notify';
import {
	notifyAndRecord,
	persistSubmission,
} from '@/lib/submissions/submitSubmission';
import { agree, email, name } from '@/util/forms/fields';
import { intake, savingFailed } from '@/util/forms/intake';
import { siteUrl } from '@/util/url.server';
import type { FormState } from '@/util/forms/types';

const THANKS = '/lunch-and-learn-idea/thanks';

const schema = z.object({
	Name: name(),
	Email: email(),
	Topic: z
		.string()
		.trim()
		.min(1, 'Please give your Lunch & Learn a title.')
		.max(300),
	Description: z
		.string()
		.trim()
		.min(1, 'Please give us a description we can share.')
		.max(5000),
	// The only genuinely optional field on this form.
	Format: z.string().trim().max(300).optional(),
	Timing: z
		.string()
		.trim()
		.min(1, 'Please tell us what date and time works for you.')
		.max(300),
	agree: agree(),
});

export async function submitLunchAndLearnIdea(
	_state: FormState,
	formData: FormData,
): Promise<FormState> {
	const parsed = intake(formData, { schema, thanks: THANKS });
	if (!parsed.ok) return parsed.state;

	const idea = {
		name: parsed.data.Name,
		email: parsed.data.Email,
		topic: parsed.data.Topic,
		description: parsed.data.Description,
		format: parsed.data.Format ?? null,
		timing: parsed.data.Timing,
	};

	const saved = await persistSubmission(
		'lunch-and-learn',
		async (tx) => {
			const [row] = await tx
				.insert(lunchAndLearnIdea)
				.values(idea)
				.returning({ id: lunchAndLearnIdea.id });
			return row;
		},
		{
			submitted: 'Idea submitted',
			failed: savingFailed(),
		},
	);
	if ('error' in saved) return saved.error;

	// The issue is opened first so the Slack message can link it. Each channel
	// is its own line of History, so a Slack outage is never written up as a
	// GitHub failure; neither failing loses the idea.
	let issueUrl: string | null = null;
	await notifyAndRecord(
		'lunch-and-learn',
		saved.id,
		{ channel: 'github issue', what: 'Lunch & Learn issue opened on GitHub' },
		async () => {
			const issue = await createLunchAndLearnIssue({
				...idea,
				adminUrl: `${siteUrl()}/admin/submissions/lunch-and-learn/${saved.id}`,
			});

			// A captured issue has no URL to keep (docs/adr/0013).
			if (!issue.ok || !issue.url) return issue;
			issueUrl = issue.url;

			// Slack does not depend on the row carrying the URL, so a failed update is
			// noted in the event (whose body already names the issue) rather than
			// allowed to skip the announcement.
			try {
				await db()
					.update(lunchAndLearnIdea)
					.set({ githubIssueUrl: issue.url })
					.where(eq(lunchAndLearnIdea.id, saved.id));
			} catch (error) {
				console.error(
					`Could not save the issue URL on Lunch & Learn idea ${saved.id}`,
					error,
				);
				return {
					...issue,
					warning: `${issue.message}. The issue link could not be saved to the submission.`,
				};
			}
			return issue;
		},
	);

	await notifyAndRecord(
		'lunch-and-learn',
		saved.id,
		{ channel: 'slack', what: 'Slack notified of a Lunch & Learn idea' },
		() =>
			notifySlack(
				'lunch-and-learn',
				lunchAndLearnMessage({ topic: idea.topic, name: idea.name, issueUrl }),
			),
	);

	redirect(THANKS);
}
