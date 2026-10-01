import * as Sentry from '@sentry/nextjs';

import { maskAddress } from '@/lib/maskAddress';

/**
 * Send a failure the code has already handled to Sentry, for the ones a
 * maintainer has to act on: a rejected credential, a lost audit line, a write
 * that failed under a user. Tagged `reported: handled`, which is also what
 * makes `beforeSend` strip the frames' local variables (docs/adr/0015).
 *
 * What goes is a copy carrying only the scrubbed message and the stack: an
 * email address is masked, a failed query keeps its SQL but not its params,
 * and a Postgres error keeps only `code`, `constraint` and `table`.
 */
export function reportHandled(
	error: unknown,
	{ area, tags }: { area: string; tags?: Record<string, string> },
): void {
	const codes = errorCodes(error);
	Sentry.captureException(scrub(error), {
		level: 'error',
		tags: { reported: 'handled', area, ...tags },
		...(codes && { contexts: { error: codes } }),
	});
}

const EMAIL = /[^\s@<>"'(),;:]+@[^\s@<>"'(),;:]+/g;

function maskEmails(text: string): string {
	return text.replace(EMAIL, maskAddress);
}

/** drizzle's `Failed query: <sql>\nparams: <values>` — the values are form input. */
function withoutParams(error: Error): string {
	if (error.name !== 'DrizzleQueryError' || !('query' in error)) {
		return error.message;
	}
	return `Failed query: ${String(error.query)}`;
}

function scrub(error: unknown, depth = 0): Error {
	if (!(error instanceof Error)) {
		return new Error(
			typeof error === 'string'
				? maskEmails(error)
				: 'A non-Error value was thrown.',
		);
	}

	const message = maskEmails(withoutParams(error));
	const copy = new Error(message);
	copy.name = error.name;
	copy.stack = error.stack
		? maskEmails(error.stack.replace(error.message, message))
		: undefined;
	if (error.cause !== undefined && depth < 5) {
		copy.cause = scrub(error.cause, depth + 1);
	}
	return copy;
}

/** The first `code` in the cause chain, with a Postgres error's constraint and table. */
function errorCodes(
	error: unknown,
	depth = 0,
): Record<string, string> | undefined {
	if (typeof error !== 'object' || error === null || depth > 5) return;
	const { code, constraint, table, cause } = error as Record<string, unknown>;
	if (typeof code === 'string' || typeof code === 'number') {
		return Object.fromEntries(
			Object.entries({ code, constraint, table })
				.filter(
					([, value]) => typeof value === 'string' || typeof value === 'number',
				)
				.map(([key, value]) => [key, String(value)]),
		);
	}
	return errorCodes(cause, depth + 1);
}
