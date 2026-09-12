'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';

import { coffeeTableGroupRequest, db } from '@/db';
import { coffeeTableGroupMessage, notifySlack } from '@/lib/slack/notify';
import { notifyAndRecord, recordSubmissionEvent } from '@/lib/submitSubmission';
import { fieldErrorsFrom } from '@/util/forms/parse';
import { looksLikeSpam } from '@/util/forms/spamGuard';
import type { FormState } from '@/util/forms/types';

const schema = z.object({
	name: z.string().trim().min(1, 'Please tell us your name.').max(200),
	email: z.email('That doesn’t look like an email address.').max(320),
	// Both are `required` in the browser, so they are required here too.
	group_name: z
		.string()
		.trim()
		.min(1, 'Please name your Coffee Table Group.')
		.max(200),
	description: z
		.string()
		.trim()
		.min(1, 'Please describe your group idea.')
		.max(5000),
	agree: z.literal('agree', {
		message: 'Please confirm you’ve read the Code of Conduct.',
	}),
});

export async function submitCoffeeTableGroupRequest(
	_state: FormState,
	formData: FormData,
): Promise<FormState> {
	if (looksLikeSpam(formData)) {
		redirect('/start-coffee-table-group/thanks');
	}

	const parsed = schema.safeParse({
		name: formData.get('name') ?? '',
		email: formData.get('email') ?? '',
		group_name: formData.get('group_name') ?? '',
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

	let requestId: string;

	try {
		const [row] = await db()
			.insert(coffeeTableGroupRequest)
			.values({
				name: parsed.data.name,
				email: parsed.data.email,
				groupName: parsed.data.group_name,
				description: parsed.data.description,
			})
			.returning({ id: coffeeTableGroupRequest.id });

		requestId = row.id;

		await recordSubmissionEvent({
			kind: 'coffee-tables',
			submissionId: requestId,
			type: 'submitted',
			body: 'Request submitted',
		});
	} catch (error) {
		console.error('Coffee Table group request failed to save', error);
		return {
			is_error: true,
			message:
				'Something went wrong saving your form. Please try again, or email hello@virtualcoffee.io.',
		};
	}

	await notifyAndRecord('coffee-tables', requestId, async () => {
		return notifySlack(
			'coffee-tables',
			coffeeTableGroupMessage({
				name: parsed.data.name,
				email: parsed.data.email,
				groupName: parsed.data.group_name,
				description: parsed.data.description,
			}),
		);
	});

	redirect('/start-coffee-table-group/thanks');
}
