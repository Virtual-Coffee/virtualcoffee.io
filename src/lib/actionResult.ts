/**
 * What an admin or volunteer server action hands back to the component that
 * called it. Success may carry a message to show; failure always does.
 */
export type ActionResult =
	{ ok: true; message?: string } | { ok: false; message: string };

/**
 * The shape for an action that emails someone. `emailSent` is the field the UI
 * leans on — see `emailFailed` for why 'unknown' is one of its values.
 */
export type EmailActionResult =
	| { ok: true; message?: string }
	| { ok: false; message: string; emailSent: boolean | 'unknown' };

/**
 * The answer for a send that did not go — or may not have.
 *
 * A maintainer decides whether to retry on `emailSent`, and retrying after a
 * successful send double-emails an applicant — so 'unknown' is a real and
 * distinct answer (a timeout, where the mail may or may not have gone), never
 * rounded to false for a tidier message. `deliver()` has already made that
 * call in `definitelyNotSent` (docs/adr/0013); this carries it through.
 */
export function emailFailed(sent: {
	message: string;
	definitelyNotSent: boolean;
}): EmailActionResult {
	return {
		ok: false,
		message: sent.message,
		emailSent: sent.definitelyNotSent ? false : 'unknown',
	};
}

/** The answer for an email that went, after which the row turned out to have moved. */
export function emailWentButRowMoved(message: string): EmailActionResult {
	return { ok: false, message, emailSent: true };
}
