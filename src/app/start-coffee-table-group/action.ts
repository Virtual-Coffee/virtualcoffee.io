'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';

import { coffeeTableGroupRequest } from '@/db';
import { coffeeTableGroupMessage, notifySlack } from '@/lib/slack/notify';
import { notifyAndRecord, persistSubmission } from '@/lib/submitSubmission';
import { formObject, invalidFields, staleForm } from '@/util/forms/parse';
import { checkSpam } from '@/util/forms/spamGuard';
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
	const guard = checkSpam(formData);
	if (guard === 'stale') return staleForm();
	if (guard !== 'ok') redirect('/start-coffee-table-group/thanks');

	const parsed = schema.safeParse(formObject(formData, schema));

	if (!parsed.success) {
		return invalidFields(parsed.error);
	}

	const saved = await persistSubmission(
		'coffee-tables',
		async (tx) => {
			const [row] = await tx
				.insert(coffeeTableGroupRequest)
				.values({
					name: parsed.data.name,
					email: parsed.data.email,
					groupName: parsed.data.group_name,
					description: parsed.data.description,
				})
				.returning({ id: coffeeTableGroupRequest.id });
			return row;
		},
		{
			submitted: 'Request submitted',
			failed:
				'Something went wrong saving your form. Please try again, or email hello@virtualcoffee.io.',
		},
	);
	if ('error' in saved) return saved.error;

	await notifyAndRecord('coffee-tables', saved.id, async () => {
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
