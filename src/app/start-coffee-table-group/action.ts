'use server';

import { redirect } from 'next/navigation';

import { coffeeTablesSchema } from '@/lib/submissions/formSchemas';
import { submit } from '@/lib/submissions/submitSubmission';
import { intake } from '@/util/forms/intake';
import type { FormState } from '@/util/forms/types';

const THANKS = '/start-coffee-table-group/thanks';

export async function submitCoffeeTableGroupRequest(
	_state: FormState,
	formData: FormData,
): Promise<FormState> {
	const parsed = intake(formData, {
		schema: coffeeTablesSchema,
		thanks: THANKS,
	});
	if (!parsed.ok) return parsed.state;

	const saved = await submit('coffee-tables', parsed.data);
	if ('error' in saved) return saved.error;

	redirect(THANKS);
}
