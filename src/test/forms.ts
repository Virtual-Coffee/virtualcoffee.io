import {
	HONEYPOT_FIELD,
	issueTimestamp,
	TIMESTAMP_FIELD,
} from '@/util/forms/spamGuard';

/**
 * A submission that passes the spam guard: rendered a few seconds ago, with
 * the honeypot left empty. Pass `spam` to fail it instead.
 */
export function formDataWith(
	fields: Record<string, string | File>,
	{ spam = false }: { spam?: boolean } = {},
): FormData {
	const formData = new FormData();
	formData.set(TIMESTAMP_FIELD, issueTimestamp(Date.now() - 5_000));
	formData.set(HONEYPOT_FIELD, spam ? 'https://spam.example' : '');
	for (const [key, value] of Object.entries(fields)) {
		formData.set(key, value);
	}
	return formData;
}

/** The `is_error` state every form returns for a failed validation. */
export function fieldErrors(fields: Record<string, unknown>) {
	return {
		is_error: true,
		message: 'Please check the highlighted fields.',
		fieldErrors: fields,
	};
}
