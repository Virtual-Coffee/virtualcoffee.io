import type { Outbound } from '@/lib/outbound';

/** `deliver()` outcomes, as a mocked sender returns them. */
export const SENT: Outbound = { ok: true, message: 'Sent.' };
export const CAPTURED: Outbound = {
	ok: true,
	message: 'Captured, not delivered (test).',
	warning: 'Captured, not delivered (test).',
};
export const NOT_SENT: Outbound = {
	ok: false,
	definitelyNotSent: true,
	message: 'The mail server rejected ada@example.test.',
};
export const MAYBE_SENT: Outbound = {
	ok: false,
	definitelyNotSent: false,
	message: 'Could not reach the mail server: Connection timed out.',
};
