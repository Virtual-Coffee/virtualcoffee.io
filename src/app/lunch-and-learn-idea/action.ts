'use server';

import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import { db, lunchAndLearnIdea } from '@/db';
import { createLunchAndLearnIssue } from '@/lib/github/issues';
import { lunchAndLearnMessage, notifySlack } from '@/lib/slack/notify';
import { notifyAndRecord, persistSubmission } from '@/lib/submitSubmission';
import { formObject, invalidFields, staleForm } from '@/util/forms/parse';
import { checkSpam } from '@/util/forms/spamGuard';
import { siteUrl } from '@/util/url.server';
import type { FormState } from '@/util/forms/types';

const schema = z.object({
	Name: z.string().trim().min(1, 'Please tell us your name.').max(200),
	Email: z.email('That doesn’t look like an email address.').max(320),
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
	agree: z.literal('agree', {
		message: 'Please confirm you’ve read the Code of Conduct.',
	}),
});

export async function submitLunchAndLearnIdea(
	_state: FormState,
	formData: FormData,
): Promise<FormState> {
	const guard = checkSpam(formData);
	if (guard === 'stale') return staleForm();
	if (guard !== 'ok') redirect('/lunch-and-learn-idea/thanks');

	const parsed = schema.safeParse(formObject(formData, schema));

	if (!parsed.success) {
		return invalidFields(parsed.error);
	}

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
			failed:
				'Something went wrong saving your form. Please try again, or email hello@virtualcoffee.io.',
		},
	);
	if ('error' in saved) return saved.error;

	// The issue is created first so the Slack message can link it; neither
	// failing loses the idea.
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
			const issueUrl = issue.ok ? issue.url : null;
			// Slack does not depend on the row carrying the URL, so a failed update is
			// noted in the event (whose body already names the issue) rather than
			// allowed to skip the announcement.
			let unsaved = '';
			if (issueUrl) {
				try {
					await db()
						.update(lunchAndLearnIdea)
						.set({ githubIssueUrl: issueUrl })
						.where(eq(lunchAndLearnIdea.id, saved.id));
				} catch (error) {
					console.error(
						`Could not save the issue URL on Lunch & Learn idea ${saved.id}`,
						error,
					);
					unsaved = ' The issue link could not be saved to the submission.';
				}
			}

			const slack = await notifySlack(
				'lunch-and-learn',
				lunchAndLearnMessage({ topic: idea.topic, name: idea.name, issueUrl }),
			);

			const message = `${issue.message}${unsaved} ${slack.message}`;
			if (!issue.ok || !slack.ok) {
				return { ok: false, message, definitelyNotSent: true };
			}
			// What History needs beyond "it went": a Captured note from either
			// side, and the issue link if the row could not keep it.
			const warning = [
				issue.warning,
				unsaved ? `${issue.message}.${unsaved}` : undefined,
				slack.warning,
			]
				.filter(Boolean)
				.join(' ');
			return warning ? { ok: true, message, warning } : { ok: true, message };
		},
	);

	redirect('/lunch-and-learn-idea/thanks');
}
