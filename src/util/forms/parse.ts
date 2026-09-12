import { z } from 'zod';

import { reissueTimestamp } from './spamGuard';
import type { FormState } from './types';

/**
 * A trimmed string field, or undefined when it was absent, a file, or blank —
 * so an optional zod field sees "not given" rather than an empty string.
 */
export function formValue(formData: FormData, key: string): string | undefined {
	const raw = formData.get(key);
	if (typeof raw !== 'string') return undefined;
	const trimmed = raw.trim();
	return trimmed.length > 0 ? trimmed : undefined;
}

/**
 * Field name -> first error, the shape `FormState.fieldErrors` carries so
 * inputs can be marked individually. The first issue per field wins, because
 * a `min(1)` and a `max(200)` on the same field never both need saying.
 */
export function fieldErrorsFrom(error: z.ZodError): Record<string, string> {
	const fieldErrors: Record<string, string> = {};
	for (const issue of error.issues) {
		const key = String(issue.path[0] ?? '');
		fieldErrors[key] ??= issue.message;
	}
	return fieldErrors;
}

/**
 * The state every failed submission hands back. Carries a fresh spam-guard
 * token because the form stays mounted across the error and would otherwise
 * resubmit the one it was rendered with.
 */
export function formError(message: string): NonNullable<FormState> {
	return { is_error: true, message, spamToken: reissueTimestamp() };
}

/** Validation failed: mark the fields, keep everything the person typed. */
export function invalidFields(
	errors: z.ZodError | Record<string, string>,
): NonNullable<FormState> {
	return {
		...formError('Please check the highlighted fields.'),
		fieldErrors:
			errors instanceof z.ZodError ? fieldErrorsFrom(errors) : errors,
	};
}

/** The render token aged out: a person, not a bot, so ask them to try again. */
export function staleForm(): NonNullable<FormState> {
	return formError(
		'This page was open for a while, so we couldn’t accept the submission. Please press submit again.',
	);
}

/**
 * A GitHub username field. Accepts a pasted profile URL or an @handle as well
 * as a bare username. `required` is the message for a blank value; leave it
 * out and append `.optional()` for a field that may be skipped.
 */
export function githubUsername(required?: string) {
	const base = z.string().trim();
	return (required ? base.min(1, required) : base).max(100).transform((value) =>
		value
			.replace(/^https?:\/\/(www\.)?github\.com\//i, '')
			.replace(/^@/, '')
			.replace(/\/$/, ''),
	);
}
