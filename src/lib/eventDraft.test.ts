import { describe, expect, test } from 'vitest';

import {
	draftFromEvent,
	draftFromSeries,
	emptyDraft,
	eventInputSchema,
	isZoomJoinLink,
	seriesInputSchema,
	seriesUpdateSchema,
	timeInputSchema,
	toEventInput,
	toSeriesInput,
	type Draft,
} from './eventDraft';
import type { EventDetails, Series } from './eventsCalendar';
import {
	EMPTY_DRAFT,
	type RecurrenceDraft,
	type RecurrenceForm,
} from './recurrence';

const TUESDAY = '2026-09-15';
const WEDNESDAY = '2026-09-16';

/** A Draft that saves, so a case below can break exactly one thing. */
const event: Draft = {
	title: 'Virtual Coffee',
	joinLink: 'https://meet.example/coffee',
	hostCode: '',
	eventType: 'virtual-coffee',
	description: 'Come hang out',
	date: TUESDAY,
	startTime: '09:00',
	endTime: '10:00',
	rule: null,
};

const weeklyDraft: RecurrenceDraft = { ...EMPTY_DRAFT, weekdays: ['TU', 'TH'] };

const series: Draft = { ...event, rule: weeklyDraft };

const weekly: RecurrenceForm = {
	kind: 'weekly',
	interval: 1,
	weekdays: ['TU', 'TH'],
	ends: { kind: 'never' },
};

/** What the calendar hands a form, shared by an Event and a Series. */
const fields = {
	id: 'coffee',
	etag: '"1"',
	title: 'Virtual Coffee',
	description: 'Come hang out',
	joinLink: 'https://meet.example/coffee',
	hostCode: '123456',
	eventType: 'virtual-coffee' as const,
	date: TUESDAY,
	startTime: '09:00',
	endTime: '10:00',
	htmlLink: null,
};

const eventDetails: EventDetails = { ...fields, status: 'confirmed' };

const seriesRecord: Series = {
	...fields,
	recurrence: weekly,
	recurrenceText: 'Every week on Tuesday, Thursday',
	nextEvent: null,
};

describe('toEventInput', () => {
	test('a Draft that is an Event comes back as the input a write takes', () => {
		expect(toEventInput(event)).toEqual({
			ok: true,
			input: {
				title: 'Virtual Coffee',
				description: 'Come hang out',
				joinLink: 'https://meet.example/coffee',
				hostCode: '',
				eventType: 'virtual-coffee',
				date: TUESDAY,
				startTime: '09:00',
				endTime: '10:00',
			},
		});
	});

	test.each<[string, Partial<Draft>, string, string]>([
		['no title', { title: '' }, 'Give it a title.', 'title'],
		['a title of spaces', { title: '   ' }, 'Give it a title.', 'title'],
		[
			'a description past the limit',
			{ description: 'x'.repeat(8001) },
			'The description is too long.',
			'description',
		],
		[
			'a Join Link that is not a URL',
			{ joinLink: 'zoom' },
			'The Join Link has to be a full URL.',
			'joinLink',
		],
		[
			'a Zoom Join Link with no Host Code',
			{ joinLink: 'https://us02web.zoom.us/j/12345678901' },
			'A Zoom Join Link needs its host code, or the Slack bots cannot announce it.',
			'hostCode',
		],
		[
			'a Host Code that is not 6–10 digits',
			{ hostCode: 'abc' },
			'A Zoom host code is 6–10 digits.',
			'hostCode',
		],
		['no Event Type', { eventType: '' }, 'Pick an Event Type.', 'eventType'],
		['no date', { date: '' }, 'Pick a date.', 'date'],
		[
			'a date that is not one',
			{ date: '2026-02-31' },
			'Pick a real date.',
			'date',
		],
		['a half-written time', { startTime: '9:00' }, 'Pick a time.', 'startTime'],
		[
			'a time off the clock',
			{ startTime: '25:00' },
			'Pick a real time.',
			'startTime',
		],
		[
			'an end before the start',
			{ endTime: '08:00' },
			'The end has to be after the start, on the same day.',
			'endTime',
		],
	])('refuses %s', (_what, patch, message, path) => {
		expect(toEventInput({ ...event, ...patch })).toEqual({
			ok: false,
			issue: { path, message },
		});
	});

	test('a Zoom Join Link with its Host Code is accepted, trimmed', () => {
		expect(
			toEventInput({
				...event,
				joinLink: 'https://us02web.zoom.us/j/12345678901?pwd=x',
				hostCode: ' 123456 ',
			}),
		).toMatchObject({ ok: true, input: { hostCode: '123456' } });
	});
});

describe('toSeriesInput', () => {
	test('a Draft that is a Series carries the rule the controls hold', () => {
		expect(toSeriesInput(series)).toMatchObject({
			ok: true,
			input: { title: 'Virtual Coffee', recurrence: weekly },
		});
	});

	test('a rule this form cannot edit is sent as null, to be left alone', () => {
		expect(toSeriesInput({ ...series, rule: 'custom' })).toMatchObject({
			ok: true,
			input: { recurrence: null },
		});
	});

	test.each<[string, Draft['rule']]>([
		['no days picked', { ...weeklyDraft, weekdays: [] }],
		['an end date left blank', { ...weeklyDraft, endsKind: 'until' }],
		['no rule at all', null],
	])('refuses %s', (_what, rule) => {
		expect(toSeriesInput({ ...series, rule })).toEqual({
			ok: false,
			issue: { path: 'recurrence', message: 'Say how the Series repeats.' },
		});
	});

	test('the first Event has to fall on the rule', () => {
		expect(toSeriesInput({ ...series, date: WEDNESDAY })).toEqual({
			ok: false,
			issue: {
				path: 'date',
				message: 'The first Event has to fall on a day the rule repeats on.',
			},
		});
	});

	test('a rule that has ended before its first Event is refused', () => {
		expect(
			toSeriesInput({
				...series,
				rule: {
					...weeklyDraft,
					endsKind: 'until',
					untilDate: '2026-09-01',
				},
			}),
		).toEqual({
			ok: false,
			issue: {
				path: 'recurrence',
				message: 'The rule ends before its first Event.',
			},
		});
	});

	test('the Event fields are judged too', () => {
		expect(toSeriesInput({ ...series, title: '' })).toMatchObject({
			ok: false,
			issue: { message: 'Give it a title.' },
		});
	});
});

describe('the schemas', () => {
	const input = {
		title: 'Virtual Coffee',
		description: '',
		joinLink: 'https://meet.example/coffee',
		hostCode: '',
		eventType: 'virtual-coffee',
		date: TUESDAY,
		startTime: '09:00',
		endTime: '10:00',
	};

	function message(result: { error?: { issues: { message: string }[] } }) {
		return result.error?.issues[0].message;
	}

	test('an update may leave the rule alone; a new Series may not', () => {
		expect(
			seriesUpdateSchema.safeParse({ ...input, recurrence: null }).success,
		).toBe(true);
		expect(
			message(seriesInputSchema.safeParse({ ...input, recurrence: null })),
		).toBe('Say how the Series repeats.');
	});

	// Not reachable through a Draft — the controls cannot make a rule with no
	// days — but the actions parse whatever a caller sends.
	test.each<[unknown, string]>([
		[{ ...weekly, weekdays: [] }, 'Pick at least one day.'],
		[
			{
				kind: 'monthly',
				interval: 1,
				ordinals: [],
				weekday: 'FR',
				ends: weekly.ends,
			},
			'Pick at least one week of the month.',
		],
		[{ ...weekly, ends: { kind: 'count', count: 0 } }, 'At least one Event.'],
	])('a hand-built rule is judged: %j', (recurrence, expected) => {
		expect(
			message(seriesUpdateSchema.safeParse({ ...input, recurrence })),
		).toBe(expected);
	});

	test('eventInputSchema ignores a rule it is handed', () => {
		expect(
			eventInputSchema.safeParse({ ...input, recurrence: weekly }),
		).toMatchObject({ success: true, data: { title: 'Virtual Coffee' } });
	});

	/** What `rescheduleEvent` parses: the time alone. */
	test('timeInputSchema checks a date and two times', () => {
		expect(
			message(
				timeInputSchema.safeParse({
					date: 'soon',
					startTime: '09:00',
					endTime: '10:00',
				}),
			),
		).toBe('Pick a date.');
		expect(
			message(
				timeInputSchema.safeParse({
					date: TUESDAY,
					startTime: '25:00',
					endTime: '26:00',
				}),
			),
		).toBe('Pick a real time.');
	});
});

describe('drafts from the calendar', () => {
	test('an Event round-trips into the input a write takes', () => {
		expect(toEventInput(draftFromEvent(eventDetails))).toEqual({
			ok: true,
			input: {
				title: 'Virtual Coffee',
				description: 'Come hang out',
				joinLink: 'https://meet.example/coffee',
				hostCode: '123456',
				eventType: 'virtual-coffee',
				date: TUESDAY,
				startTime: '09:00',
				endTime: '10:00',
			},
		});
	});

	test('a Series round-trips, rule and all', () => {
		expect(toSeriesInput(draftFromSeries(seriesRecord))).toMatchObject({
			ok: true,
			input: { recurrence: weekly },
		});
	});

	test('a Series whose rule this form cannot edit keeps it', () => {
		const draft = draftFromSeries({
			...seriesRecord,
			recurrence: {
				kind: 'custom',
				rrule: 'RRULE:FREQ=DAILY',
				text: 'Every day',
			},
		});
		expect(draft.rule).toBe('custom');
		expect(toSeriesInput(draft)).toMatchObject({
			ok: true,
			input: { recurrence: null },
		});
	});

	test('an Event saved before there were Event Types cannot be saved as it is', () => {
		const draft = draftFromEvent({ ...eventDetails, eventType: null });
		expect(draft.eventType).toBe('');
		expect(toEventInput(draft)).toMatchObject({
			ok: false,
			issue: { message: 'Pick an Event Type.' },
		});
	});

	test('a new form holds no rule for an Event and an empty one for a Series', () => {
		expect(emptyDraft('event').rule).toBeNull();
		expect(emptyDraft('series').rule).toEqual(EMPTY_DRAFT);
		expect(toEventInput(emptyDraft('event'))).toMatchObject({ ok: false });
		expect(toSeriesInput(emptyDraft('series'))).toMatchObject({ ok: false });
	});
});

describe('isZoomJoinLink', () => {
	test.each([
		['https://us02web.zoom.us/j/12345678901?pwd=abc', true],
		['https://zoom.us/j/123456789', true],
		['https://zoom.us/j/12345', false],
		['https://meet.google.com/abc-defg-hij', false],
		['https://zoom.example/j/1', false],
	])('%s → %s', (url, ok) => {
		expect(isZoomJoinLink(url)).toBe(ok);
	});
});
