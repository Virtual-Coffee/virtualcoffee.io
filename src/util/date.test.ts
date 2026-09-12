import { Settings } from 'luxon';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { dateForDisplay } from './date';

describe('dateForDisplay', () => {
	test('renders in America/New_York, whatever zone the input carries', () => {
		// 03:30 UTC is 23:30 the previous evening in New York (EDT).
		expect(dateForDisplay('2026-07-02T03:30:00Z', 'yyyy-LL-dd HH:mm')).toBe(
			'2026-07-01 23:30',
		);
		// And 22:30 in January (EST).
		expect(dateForDisplay('2026-01-02T03:30:00Z', 'yyyy-LL-dd HH:mm')).toBe(
			'2026-01-01 22:30',
		);
	});

	test('accepts a Date as well as an ISO string', () => {
		const date = new Date('2026-07-02T03:30:00Z');
		expect(dateForDisplay(date, 'yyyy-LL-dd HH:mm')).toBe(
			dateForDisplay(date.toISOString(), 'yyyy-LL-dd HH:mm'),
		);
	});

	describe("with the default 'fff' format", () => {
		// 'fff' is locale-formatted (date order, 12/24-hour clock, zone name),
		// so pin the locale rather than inherit the runner's.
		let previousLocale: string;
		beforeAll(() => {
			previousLocale = Settings.defaultLocale;
			Settings.defaultLocale = 'en-US';
		});
		afterAll(() => {
			Settings.defaultLocale = previousLocale;
		});

		test('renders a medium date and time with the zone', () => {
			expect(dateForDisplay('2026-07-02T03:30:00Z')).toBe(
				'July 1, 2026 at 11:30 PM EDT',
			);
		});
	});
});
