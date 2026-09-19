import { z } from 'zod';

/**
 * The fields the public forms share, message and length included, so the same
 * question is asked the same way on every one of them.
 */

/** Optional only where a form invites anonymity, as the CoC report does. */
export function name(options: { optional: true }): z.ZodOptional<z.ZodString>;
export function name(options?: { optional?: false }): z.ZodString;
export function name(options?: { optional?: boolean }) {
	const base = z.string().trim();
	return options?.optional
		? base.max(200).optional()
		: base.min(1, 'Please tell us your name.').max(200);
}

export function email() {
	return z.email('That doesn’t look like an email address.').max(320);
}

export function agree() {
	return z.literal('agree', {
		message: 'Please confirm you’ve read the Code of Conduct.',
	});
}
