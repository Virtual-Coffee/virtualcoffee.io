import { describe, expect, test } from 'vitest';

import {
	describeRecurrence,
	endsBeforeStart,
	firstOccurrenceMatches,
	parseRecurrence,
	serializeRecurrence,
	type RecurrenceForm,
} from './recurrence';

const weekly: RecurrenceForm = {
	kind: 'weekly',
	interval: 1,
	weekdays: ['TU', 'TH'],
	ends: { kind: 'never' },
};

const firstAndThird: RecurrenceForm = {
	kind: 'monthly',
	interval: 1,
	ordinals: [1, 3],
	weekday: 'FR',
	ends: { kind: 'never' },
};

describe('parseRecurrence', () => {
	test('weekly on days', () => {
		expect(parseRecurrence(['RRULE:FREQ=WEEKLY;BYDAY=TU,TH'])).toEqual(weekly);
	});

	test('carries WKST through from a rule Google wrote', () => {
		expect(parseRecurrence(['RRULE:FREQ=WEEKLY;WKST=SU;BYDAY=TU'])).toEqual({
			...weekly,
			weekdays: ['TU'],
			weekStart: 'SU',
		});
	});

	test('every other week until a date, in the display zone', () => {
		expect(
			parseRecurrence([
				'RRULE:FREQ=WEEKLY;INTERVAL=2;BYDAY=FR;UNTIL=20261231T045959Z',
			]),
		).toEqual({
			kind: 'weekly',
			interval: 2,
			weekdays: ['FR'],
			ends: { kind: 'until', date: '2026-12-30' },
		});
	});

	test('a date-only UNTIL is that date', () => {
		expect(
			parseRecurrence(['RRULE:FREQ=WEEKLY;BYDAY=FR;UNTIL=20261231']),
		).toMatchObject({ ends: { kind: 'until', date: '2026-12-31' } });
	});

	test('monthly on the first and third Friday', () => {
		expect(parseRecurrence(['RRULE:FREQ=MONTHLY;BYDAY=1FR,3FR'])).toEqual(
			firstAndThird,
		);
	});

	test('monthly on the last Thursday, six times', () => {
		expect(parseRecurrence(['RRULE:FREQ=MONTHLY;BYDAY=-1TH;COUNT=6'])).toEqual({
			kind: 'monthly',
			interval: 1,
			ordinals: [-1],
			weekday: 'TH',
			ends: { kind: 'count', count: 6 },
		});
	});

	test('EXDATE lines are ignored; the RRULE line is what is parsed', () => {
		expect(
			parseRecurrence([
				'EXDATE;TZID=America/New_York:20260917T090000',
				'RRULE:FREQ=WEEKLY;BYDAY=TU,TH',
			]),
		).toEqual(weekly);
	});

	test.each([
		['RRULE:FREQ=DAILY', 'every day'],
		['RRULE:FREQ=MONTHLY;BYMONTHDAY=15', 'every month on the 15th'],
		['RRULE:FREQ=YEARLY;BYMONTH=6;BYMONTHDAY=1', 'every June on the 1st'],
		[
			'RRULE:FREQ=MONTHLY;BYDAY=1FR,3TU',
			'every month on the 3rd Tuesday and 1st Friday',
		],
		['RRULE:FREQ=WEEKLY;BYDAY=1TU', 'every week on the 1st Tuesday'],
		['RRULE:FREQ=MONTHLY;BYDAY=5FR', 'every month on the 5th Friday'],
	])('%s is custom, described as "%s"', (line, text) => {
		expect(parseRecurrence([line])).toEqual({
			kind: 'custom',
			rrule: line,
			text,
		});
	});

	test('no RRULE line at all', () => {
		expect(parseRecurrence(['RDATE:20260917T130000Z'])).toMatchObject({
			kind: 'custom',
			rrule: '',
		});
	});
});

describe('serializeRecurrence', () => {
	test('writes what Google writes: no INTERVAL=1, no plus signs', () => {
		expect(serializeRecurrence(weekly)).toBe('RRULE:FREQ=WEEKLY;BYDAY=TU,TH');
		expect(serializeRecurrence(firstAndThird)).toBe(
			'RRULE:FREQ=MONTHLY;BYDAY=1FR,3FR',
		);
	});

	test('UNTIL is the end of that day in the display zone, as UTC', () => {
		expect(
			serializeRecurrence({
				...weekly,
				ends: { kind: 'until', date: '2026-12-30' },
			}),
		).toBe('RRULE:FREQ=WEEKLY;BYDAY=TU,TH;UNTIL=20261231T045959Z');
		// Summer: a four-hour offset instead of five.
		expect(
			serializeRecurrence({
				...weekly,
				ends: { kind: 'until', date: '2026-07-01' },
			}),
		).toBe('RRULE:FREQ=WEEKLY;BYDAY=TU,TH;UNTIL=20260702T035959Z');
	});

	test('interval, count and week start', () => {
		expect(
			serializeRecurrence({
				kind: 'weekly',
				interval: 2,
				weekdays: ['MO'],
				ends: { kind: 'count', count: 10 },
				weekStart: 'SU',
			}),
		).toBe('RRULE:FREQ=WEEKLY;WKST=SU;INTERVAL=2;BYDAY=MO;COUNT=10');
		expect(
			serializeRecurrence({
				kind: 'monthly',
				interval: 3,
				ordinals: [-1],
				weekday: 'WE',
				ends: { kind: 'never' },
			}),
		).toBe('RRULE:FREQ=MONTHLY;INTERVAL=3;BYDAY=-1WE');
	});

	test.each<RecurrenceForm>([
		weekly,
		firstAndThird,
		{ ...weekly, interval: 3, ends: { kind: 'until', date: '2027-03-14' } },
		{ ...firstAndThird, ends: { kind: 'count', count: 4 } },
	])('round-trips %j', (form) => {
		expect(parseRecurrence([serializeRecurrence(form)])).toEqual(form);
	});
});

describe('describeRecurrence', () => {
	test('form shapes', () => {
		expect(describeRecurrence(weekly)).toBe('every week on Tuesday, Thursday');
		expect(describeRecurrence(firstAndThird)).toBe(
			'every month on the 1st Friday and 3rd Friday',
		);
	});

	test('UNTIL is named as the display-zone date, not the UTC token', () => {
		expect(
			describeRecurrence({
				...weekly,
				ends: { kind: 'until', date: '2026-12-30' },
			}),
		).toBe('every week on Tuesday, Thursday until December 30, 2026');
		expect(
			parseRecurrence(['RRULE:FREQ=DAILY;INTERVAL=2;UNTIL=20261231T045959Z']),
		).toMatchObject({
			kind: 'custom',
			text: 'every 2 days until December 30, 2026',
		});
	});

	test('custom rules keep their text', () => {
		expect(
			describeRecurrence({ kind: 'custom', rrule: 'x', text: 'every day' }),
		).toBe('every day');
	});
});

describe('firstOccurrenceMatches', () => {
	test('weekly: the date must be one of the days', () => {
		expect(firstOccurrenceMatches(weekly, '2026-09-15')).toBe(true); // Tuesday
		expect(firstOccurrenceMatches(weekly, '2026-09-16')).toBe(false); // Wednesday
	});

	test('monthly: the date must be one of the ordinals', () => {
		expect(firstOccurrenceMatches(firstAndThird, '2026-10-02')).toBe(true); // 1st Fri
		expect(firstOccurrenceMatches(firstAndThird, '2026-10-16')).toBe(true); // 3rd Fri
		expect(firstOccurrenceMatches(firstAndThird, '2026-10-09')).toBe(false); // 2nd Fri
	});

	test('the end is not consulted here', () => {
		expect(
			firstOccurrenceMatches(
				{ ...weekly, ends: { kind: 'until', date: '2020-01-01' } },
				'2026-09-15',
			),
		).toBe(true);
		expect(
			endsBeforeStart(
				{ ...weekly, ends: { kind: 'until', date: '2020-01-01' } },
				'2026-09-15',
			),
		).toBe(true);
	});

	test('a rule with no days never matches', () => {
		expect(
			firstOccurrenceMatches({ ...weekly, weekdays: [] }, '2026-09-15'),
		).toBe(false);
		expect(
			firstOccurrenceMatches({ ...firstAndThird, ordinals: [] }, '2026-10-02'),
		).toBe(false);
	});

	test('a malformed date never matches', () => {
		expect(firstOccurrenceMatches(weekly, 'yesterday')).toBe(false);
	});
});
