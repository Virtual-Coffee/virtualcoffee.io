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
