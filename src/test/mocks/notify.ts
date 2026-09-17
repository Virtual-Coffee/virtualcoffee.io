import { vi } from 'vitest';

/**
 * The mocked `notifySlack`, for the public forms.
 *
 * The real module's message builders are what the tests assert against, so
 * `src/test/db/setup.ts` spreads this over the original rather than
 * replacing it.
 */
export const notifySlack = vi.fn();

export function reset() {
	notifySlack.mockReset();
}
