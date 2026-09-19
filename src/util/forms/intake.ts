import { redirect } from 'next/navigation';
import { z } from 'zod';

import { formObject, invalidFields, staleForm } from './parse';
import { checkSpam } from './spamGuard';
import type { FormState } from './types';

/**
 * The spam guard and the schema parse every public form opens with: a bot sees
 * the thank-you page and nothing is written, a stale token comes back asking
 * the person to submit again. Why those two are treated differently, and what
 * the guard is and is not for, is in spamGuard.ts.
 */
export function intake<S extends z.ZodObject>(
	formData: FormData,
	options: { schema: S; thanks: string },
):
	| { ok: true; data: z.infer<S> }
	| { ok: false; state: NonNullable<FormState> } {
	const guard = checkSpam(formData);
	if (guard === 'stale') return { ok: false, state: staleForm() };
	if (guard !== 'ok') redirect(options.thanks);

	const parsed = options.schema.safeParse(formObject(formData, options.schema));
	if (!parsed.success) return { ok: false, state: invalidFields(parsed.error) };

	return { ok: true, data: parsed.data };
}
