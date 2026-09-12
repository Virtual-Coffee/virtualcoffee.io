'use server';

import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import { db, lunchAndLearnIdea } from '@/db';
import { createLunchAndLearnIssue } from '@/lib/github/issues';
import { lunchAndLearnMessage, notifySlack } from '@/lib/slack/notify';
import { notifyAndRecord, persistSubmission } from '@/lib/submitSubmission';
import { formValue, invalidFields, staleForm } from '@/util/forms/parse';
import { checkSpam } from '@/util/forms/spamGuard';
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

	const parsed = schema.safeParse({
		Name: formData.get('Name') ?? '',
		Email: formData.get('Email') ?? '',
		Topic: formData.get('Topic') ?? '',
		Description: formData.get('Description') ?? '',
		Format: formValue(formData, 'Format'),
		Timing: formData.get('Timing') ?? '',
		agree: formData.get('agree') ?? '',
	});

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
		async () => {
			const [row] = await db()
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
	await notifyAndRecord('lunch-and-learn', saved.id, async () => {
		const issue = await createLunchAndLearnIssue(idea);

		if (issue.ok) {
			await db()
				.update(lunchAndLearnIdea)
				.set({ githubIssueUrl: issue.url })
				.where(eq(lunchAndLearnIdea.id, saved.id));
		}

		const slack = await notifySlack(
			'lunch-and-learn',
			lunchAndLearnMessage({
				topic: idea.topic,
				name: idea.name,
				issueUrl: issue.ok ? issue.url : null,
			}),
		);

		if (issue.ok && slack.ok) {
			return { ok: true, message: `Posted to Slack, opened ${issue.url}` };
		}

		return {
			ok: false,
			message: [
				issue.ok ? `Opened ${issue.url}` : issue.message,
				slack.ok ? 'Posted to Slack.' : slack.message,
			].join(' '),
		};
	});

	redirect('/lunch-and-learn-idea/thanks');
}
