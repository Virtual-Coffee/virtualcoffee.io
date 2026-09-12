/**
 * What an admin or volunteer server action hands back to the component that
 * called it. Success may carry a message to show; failure always does.
 */
export type ActionResult =
	{ ok: true; message?: string } | { ok: false; message: string };

/**
 * The shape for an action that emails someone.
 *
 * `emailSent` is the field the UI leans on. A maintainer decides whether to
 * retry based on it, and retrying after a successful send double-emails an
 * applicant — so 'unknown' is a real and distinct answer (a timeout, where
 * the mail may or may not have gone), never rounded to false for a tidier
 * message.
 */
export type EmailActionResult =
	| { ok: true; message?: string }
	| { ok: false; message: string; emailSent: boolean | 'unknown' };
