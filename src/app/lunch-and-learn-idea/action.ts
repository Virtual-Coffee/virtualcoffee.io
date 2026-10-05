'use server';

import { redirect } from 'next/navigation';

import { lunchAndLearnSchema } from '@/lib/submissions/formSchemas';
import { submit } from '@/lib/submissions/submitSubmission';
import { intake } from '@/util/forms/intake';
import type { FormState } from '@/util/forms/types';

const THANKS = '/lunch-and-learn-idea/thanks';

export async function submitLunchAndLearnIdea(
	_state: FormState,
	formData: FormData,
): Promise<FormState> {
	const parsed = intake(formData, {
		schema: lunchAndLearnSchema,
		thanks: THANKS,
	});
	if (!parsed.ok) return parsed.state;

	const saved = await submit('lunch-and-learn', parsed.data);
	if ('error' in saved) return saved.error;

	redirect(THANKS);
}
