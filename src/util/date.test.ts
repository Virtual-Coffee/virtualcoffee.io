import { describe, expect, test } from 'vitest';
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

	test("defaults to luxon's 'fff': medium date and time with the zone", () => {
		// 'fff' is locale-formatted, so match the New York time and zone rather
		// than the exact string — en-GB writes 23:30 where en-US writes 11:30 PM.
		expect(dateForDisplay('2026-07-02T03:30:00Z')).toMatch(
			/^.*2026.*(11:30 PM|23:30) EDT$/,
		);
	});
});
