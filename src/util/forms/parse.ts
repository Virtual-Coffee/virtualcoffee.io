import type { z } from 'zod';

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
