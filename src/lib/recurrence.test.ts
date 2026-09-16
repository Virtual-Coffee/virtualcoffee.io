import { describe, expect, test } from 'vitest';
import { DateTime } from 'luxon';

import { DISPLAY_ZONE } from '@/util/date';

import {
	describeRecurrence,
	draftFromRecurrence,
	draftToForm,
	EMPTY_DRAFT,
	endRule,
	endsBeforeStart,
	firstOccurrenceMatches,
	parseRecurrence,
	recurrenceSchema,
	serializeRecurrence,
	type RecurrenceDraft,
	type RecurrenceForm,
} from './recurrence';

// `satisfies`, not an annotation, so each keeps its own half of the union and
// a variant below can add `weekStart`.
const weekly = {
	kind: 'weekly',
	interval: 1,
	weekdays: ['TU', 'TH'],
	ends: { kind: 'never' },
} satisfies RecurrenceForm;

const firstAndThird = {
	kind: 'monthly',
	interval: 1,
	ordinals: [1, 3],
	weekday: 'FR',
	ends: { kind: 'never' },
} satisfies RecurrenceForm;

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
		['RRULE:FREQ=DAILY', 'Every day'],
		['RRULE:FREQ=MONTHLY;BYMONTHDAY=15', 'Every month on the 15th'],
		['RRULE:FREQ=YEARLY;BYMONTH=6;BYMONTHDAY=1', 'Every June on the 1st'],
		[
			'RRULE:FREQ=MONTHLY;BYDAY=1FR,3TU',
			'Every month on the 3rd Tuesday and 1st Friday',
		],
		['RRULE:FREQ=WEEKLY;BYDAY=1TU', 'Every week on the 1st Tuesday'],
		['RRULE:FREQ=MONTHLY;BYDAY=5FR', 'Every month on the 5th Friday'],
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
		expect(describeRecurrence(weekly)).toBe('Every week on Tuesday, Thursday');
		expect(describeRecurrence(firstAndThird)).toBe(
			'Every month on the 1st Friday and 3rd Friday',
		);
	});

	test('UNTIL is named as the display-zone date, not the UTC token', () => {
		expect(
			describeRecurrence({
				...weekly,
				ends: { kind: 'until', date: '2026-12-30' },
			}),
		).toBe('Every week on Tuesday, Thursday until December 30, 2026');
		expect(
			parseRecurrence(['RRULE:FREQ=DAILY;INTERVAL=2;UNTIL=20261231T045959Z']),
		).toMatchObject({
			kind: 'custom',
			text: 'Every 2 days until December 30, 2026',
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

describe('endRule', () => {
	const now = DateTime.fromISO('2026-09-13T12:00:00', { zone: DISPLAY_ZONE });
	test.each([
		[
			'RRULE:FREQ=WEEKLY;BYDAY=TU',
			'RRULE:FREQ=WEEKLY;BYDAY=TU;UNTIL=20260913T160000Z',
		],
		[
			'RRULE:FREQ=WEEKLY;BYDAY=TU;UNTIL=20271231T045959Z',
			'RRULE:FREQ=WEEKLY;BYDAY=TU;UNTIL=20260913T160000Z',
		],
		[
			'RRULE:UNTIL=20271231T045959Z;FREQ=WEEKLY;BYDAY=TU',
			'RRULE:FREQ=WEEKLY;BYDAY=TU;UNTIL=20260913T160000Z',
		],
		[
			'RRULE:FREQ=WEEKLY;COUNT=10;BYDAY=TU',
			'RRULE:FREQ=WEEKLY;BYDAY=TU;UNTIL=20260913T160000Z',
		],
		['RRULE:COUNT=10;FREQ=WEEKLY', 'RRULE:FREQ=WEEKLY;UNTIL=20260913T160000Z'],
	])('%s', (line, expected) => {
		expect(endRule(line, now)).toBe(expected);
	});
});

describe('drafts', () => {
	const rules: RecurrenceForm[] = [
		weekly,
		{ ...weekly, weekStart: 'SU' },
		{ ...weekly, interval: 3, ends: { kind: 'until', date: '2027-03-14' } },
		{ ...weekly, weekStart: 'SU', ends: { kind: 'count', count: 4 } },
		firstAndThird,
		{
			...firstAndThird,
			interval: 2,
			ends: { kind: 'until', date: '2027-01-01' },
		},
		{ ...firstAndThird, ends: { kind: 'count', count: 6 } },
	];

	test.each(rules)('a rule survives the draft it is edited as: %j', (rule) => {
		expect(draftToForm(draftFromRecurrence(rule))).toEqual(rule);
	});

	test.each(rules)('the schema accepts the draft of %j', (rule) => {
		expect(
			recurrenceSchema.safeParse(draftToForm(draftFromRecurrence(rule))),
		).toMatchObject({ success: true });
	});

	test.each<[string, Partial<RecurrenceDraft>]>([
		['no days picked', { weekdays: [] }],
		['no weeks of the month picked', { kind: 'monthly', ordinals: [] }],
		['a fractional interval', { weekdays: ['TU'], interval: '1.5' }],
		['an interval of zero', { weekdays: ['TU'], interval: '0' }],
		['an interval that is not a number', { weekdays: ['TU'], interval: 'two' }],
		[
			'an end date left blank',
			{ weekdays: ['TU'], endsKind: 'until', untilDate: '' },
		],
		['a count of zero', { weekdays: ['TU'], endsKind: 'count', count: '0' }],
	])('%s is not yet a rule', (_what, patch) => {
		expect(draftToForm({ ...EMPTY_DRAFT, ...patch })).toBeNull();
	});

	test('days and weeks of the month come back in calendar order', () => {
		expect(
			draftToForm({ ...EMPTY_DRAFT, weekdays: ['TH', 'MO', 'SA'] }),
		).toMatchObject({ weekdays: ['MO', 'TH', 'SA'] });
		expect(
			draftToForm({ ...EMPTY_DRAFT, kind: 'monthly', ordinals: [-1, 2, 1] }),
		).toMatchObject({ ordinals: [1, 2, -1] });
	});
});
