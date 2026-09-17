import { beforeEach, vi } from 'vitest';

/**
 * The mocked `sendSlackDm`, for the actions that DM a granted member.
 *
 * `grantDmMessage` stays real, so the file spreads this over the original:
 *
 * ```ts
 * vi.mock('@/lib/slack/dm', async (importOriginal) => ({
 * 	...(await importOriginal<typeof import('@/lib/slack/dm')>()),
 * 	...(await import('@/test/mocks/slackDm')),
 * }));
 * ```
 */
export const sendSlackDm = vi.fn();

beforeEach(() => {
	sendSlackDm.mockReset();
});
