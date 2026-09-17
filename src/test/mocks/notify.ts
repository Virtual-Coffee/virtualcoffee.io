import { beforeEach, vi } from 'vitest';

/**
 * The mocked `notifySlack`, for the public forms.
 *
 * The real module's message builders are what the tests assert against, so
 * the file spreads this over the original rather than replacing it:
 *
 * ```ts
 * vi.mock('@/lib/slack/notify', async (importOriginal) => ({
 * 	...(await importOriginal<typeof import('@/lib/slack/notify')>()),
 * 	...(await import('@/test/mocks/notify')),
 * }));
 * ```
 */
export const notifySlack = vi.fn();

beforeEach(() => {
	notifySlack.mockReset();
});
