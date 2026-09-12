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
 * Every key of `schema.shape` read from the form: a required field as the
 * submitted string (blank when missing, so its own `min(1)` message fires),
 * an optional one through `formValue` so blank means "not given". Keys the
 * schema doesn't name — a file, a hidden token — are left for the action.
 */
export function formObject(
	formData: FormData,
	schema: z.ZodObject,
): Record<string, string | undefined> {
	const values: Record<string, string | undefined> = {};
	for (const [key, field] of Object.entries(schema.shape)) {
		const optional = field.safeParse(undefined).success;
		if (optional) {
			values[key] = formValue(formData, key);
		} else {
			const raw = formData.get(key);
			values[key] = typeof raw === 'string' ? raw : '';
		}
	}
	return values;
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
 * GitHub's own rule: alphanumerics and single hyphens, not at either end, at
 * most 39 characters. Checked *after* the normalisation below, so a pasted
 * `github.com/octocat/followers` or `octocat?tab=repos` is refused rather
 * than stored as a username that resolves to something else.
 */
const GITHUB_USERNAME = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;

/**
 * A GitHub username field. Accepts a pasted profile URL or an @handle as well
 * as a bare username. `required` is the message for a blank value; leave it
 * out and append `.optional()` for a field that may be skipped.
 */
export function githubUsername(required?: string) {
	const base = z.string().trim();
	return (required ? base.min(1, required) : base)
		.max(100)
		.transform((value) =>
			value
				.replace(/^https?:\/\/(www\.)?github\.com\//i, '')
				.replace(/^@/, '')
				.replace(/\/$/, ''),
		)
		.refine((value) => value === '' || GITHUB_USERNAME.test(value), {
			message: 'That doesn’t look like a GitHub username.',
		});
}
