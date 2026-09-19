import { expect } from 'vitest';

import {
	HONEYPOT_FIELD,
	issueTimestamp,
	MAX_ELAPSED_MS,
	TIMESTAMP_FIELD,
} from '@/util/forms/spamGuard';

/**
 * A submission that passes the spam guard: rendered a few seconds ago, with
 * the honeypot left empty. Pass `spam` to fail it as a bot would, or `stale`
 * to fail it as a person who left the tab open would.
 */
export function formDataWith(
	fields: Record<string, string | File>,
	{ spam = false, stale = false }: { spam?: boolean; stale?: boolean } = {},
): FormData {
	const formData = new FormData();
	formData.set(
		TIMESTAMP_FIELD,
		issueTimestamp(Date.now() - (stale ? MAX_ELAPSED_MS + 1_000 : 5_000)),
	);
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
		spamToken: expect.any(String),
	};
}

/** The `is_error` state every form returns when its render token aged out. */
export function staleFormState() {
	return {
		is_error: true,
		message:
			'This page was open for a while, so we couldn’t accept the submission. Please press submit again.',
		spamToken: expect.any(String),
	};
}
