import { vi } from 'vitest';

/**
 * The mocked `connectEventsCalendar`; a test hands it the client to return.
 * Everything else in `@/lib/eventsCalendar` stays real, so
 * `src/test/db/setup.ts` spreads this over the original.
 */
export const connectEventsCalendar = vi.fn();

export function reset() {
	connectEventsCalendar.mockReset();
}
