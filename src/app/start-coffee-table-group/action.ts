'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';

import { coffeeTableGroupRequest } from '@/db';
import { coffeeTableGroupMessage, notifySlack } from '@/lib/slack/notify';
import { notifyAndRecord, persistSubmission } from '@/lib/submitSubmission';
import { agree, email, name } from '@/util/forms/fields';
import { intake } from '@/util/forms/intake';
import type { FormState } from '@/util/forms/types';

const THANKS = '/start-coffee-table-group/thanks';

const schema = z.object({
	name: name(),
	email: email(),
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
	agree: agree(),
});

export async function submitCoffeeTableGroupRequest(
	_state: FormState,
	formData: FormData,
): Promise<FormState> {
	const parsed = intake(formData, { schema, thanks: THANKS });
	if (!parsed.ok) return parsed.state;

	const request = {
		name: parsed.data.name,
		email: parsed.data.email,
		groupName: parsed.data.group_name,
		description: parsed.data.description,
	};

	const saved = await persistSubmission(
		'coffee-tables',
		async (tx) => {
			const [row] = await tx
				.insert(coffeeTableGroupRequest)
				.values(request)
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

	await notifyAndRecord(
		'coffee-tables',
		saved.id,
		{
			channel: 'slack',
			what: 'Slack notified of a Coffee Table group request',
		},
		async () => {
			return notifySlack('coffee-tables', coffeeTableGroupMessage(request));
		},
	);

	redirect(THANKS);
}
