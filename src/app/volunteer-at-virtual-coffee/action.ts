'use server';

import { redirect } from 'next/navigation';

import { volunteersSchema } from '@/lib/submissions/formSchemas';
import { submit } from '@/lib/submissions/submitSubmission';
import { intake } from '@/util/forms/intake';
import type { FormState } from '@/util/forms/types';

const THANKS = '/volunteer-at-virtual-coffee/thanks';

export async function submitVolunteerSignup(
	_state: FormState,
	formData: FormData,
): Promise<FormState> {
	const parsed = intake(formData, { schema: volunteersSchema, thanks: THANKS });
	if (!parsed.ok) return parsed.state;

	const saved = await submit('volunteers', parsed.data);
	if ('error' in saved) return saved.error;

	redirect(THANKS);
}
