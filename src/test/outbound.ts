import type { Outbound } from '@/lib/outbound';

/** `deliver()` outcomes, as a mocked sender returns them. */
export const SENT = { ok: true, message: 'Sent.' } satisfies Outbound;
export const CAPTURED = {
	ok: true,
	message: 'Captured, not delivered (test).',
	warning: 'Captured, not delivered (test).',
} satisfies Outbound;
export const NOT_SENT = {
	ok: false,
	definitelyNotSent: true,
	message: 'The mail server rejected ada@example.test.',
} satisfies Outbound;
export const MAYBE_SENT = {
	ok: false,
	definitelyNotSent: false,
	message: 'Could not reach the mail server: Connection timed out.',
} satisfies Outbound;
