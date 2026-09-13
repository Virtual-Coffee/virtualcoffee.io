/** `sendEmail()` outcomes, as the mocked transport returns them. */
export const SENT = { ok: true };
export const NOT_SENT = {
	ok: false,
	definitelyNotSent: true,
	message: 'The mail server rejected ada@example.test.',
};
export const MAYBE_SENT = {
	ok: false,
	definitelyNotSent: false,
	message: 'Connection timed out.',
};
/** Sent as far as the pipeline is concerned, but on a non-production deploy (docs/adr/0013). */
export const CAPTURED = {
	ok: true,
	warning:
		'Captured, not delivered (deploy-preview): nothing leaves this deploy.',
};
