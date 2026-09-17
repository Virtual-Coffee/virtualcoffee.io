import { vi } from 'vitest';

/**
 * The mocked `@/lib/email/transport`, for the actions that send mail.
 *
 * `src/test/db/setup.ts` registers it for the whole db project (the module
 * itself is a later layer's). A test imports `sendEmail` from here to set
 * outcomes (`@/test/outbound`) and assert calls.
 */
export const sendEmail = vi.fn();

export function reset() {
	sendEmail.mockReset();
}
