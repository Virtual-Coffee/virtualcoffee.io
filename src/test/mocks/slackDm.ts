import { vi } from 'vitest';

/**
 * The mocked `sendSlackDm`, for the actions that DM a granted member.
 *
 * `grantDmMessage` stays real, so `src/test/db/setup.ts` spreads this over
 * the original rather than replacing it.
 */
export const sendSlackDm = vi.fn();

export function reset() {
	sendSlackDm.mockReset();
}
