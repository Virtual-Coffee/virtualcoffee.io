import type { calendar_v3 } from '@googleapis/calendar';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { fakeCalendarClient } from '@/test/calendar';

import type { SeriesInput } from './eventDraft';
import {
	CalendarConflictError,
	CalendarGoneError,
	eventsCalendar,
	isCalendarEventId,
} from './eventsCalendar';

const NOW = '2026-09-14T12:00:00-04:00'; // a Monday, Eastern

const series: calendar_v3.Schema$Event = {
	id: 'coffee',
	etag: '"1"',
	status: 'confirmed',
	summary: 'Virtual Coffee',
	description: 'Come hang out',
	location: 'https://zoom.example/j/1',
	extendedProperties: {
		private: {
			hostCode: ' 123456 ',
			eventType: 'virtual-coffee',
			joinLink: 'old',
		},
	},
	start: {
		dateTime: '2026-01-06T09:00:00-05:00',
		timeZone: 'America/New_York',
	},
	end: { dateTime: '2026-01-06T10:00:00-05:00', timeZone: 'America/New_York' },
	recurrence: ['RRULE:FREQ=WEEKLY;BYDAY=TU,TH'],
	htmlLink: 'https://calendar.google.com/x',
};

const instance = (
	id: string,
	day: string,
	extra: calendar_v3.Schema$Event = {},
) => ({
	id: `${id}_${day.replace(/-/g, '')}T130000Z`,
	etag: `"${id}-${day}"`,
	status: 'confirmed',
	summary: series.summary,
	location: series.location,
	recurringEventId: id,
	originalStartTime: { dateTime: `${day}T09:00:00-04:00` },
	start: { dateTime: `${day}T09:00:00-04:00` },
	end: { dateTime: `${day}T10:00:00-04:00` },
	...extra,
});

const oneOff: calendar_v3.Schema$Event = {
	id: 'talk',
	etag: '"t1"',
	status: 'confirmed',
	summary: 'Lunch & Learn: Testing',
	description: 'Bring questions',
	location: 'https://zoom.example/j/3',
	extendedProperties: { private: { hostCode: '111111' } },
	start: { dateTime: '2026-11-04T12:00:00-05:00' },
	end: { dateTime: '2026-11-04T13:00:00-05:00' },
	htmlLink: 'https://calendar.google.com/talk',
};

function fakeClient(canned: Parameters<typeof fakeCalendarClient>[0]) {
	const { client, calls } = fakeCalendarClient(canned);
	return { client, calls, cal: eventsCalendar(client, 'cal@test') };
}

beforeEach(() => {
	vi.useFakeTimers();
	vi.setSystemTime(new Date(NOW));
});
afterEach(() => vi.useRealTimers());

describe('listSeries', () => {
	test('reads recurring parents from now on, with each next Event', async () => {
		const { cal, calls } = fakeClient({
			list: [
				{
					items: [
						series,
						{ ...series, id: 'oneoff', recurrence: undefined },
						{ ...series, id: 'gone', status: 'cancelled' },
					],
				},
			],
			instances: {
				coffee: {
					items: [
						instance('coffee', '2026-09-15', { status: 'cancelled' }),
						instance('coffee', '2026-09-17'),
					],
				},
			},
		});
		const result = await cal.listSeries();
		expect(calls[0]).toMatchObject({
			method: 'list',
			params: {
				calendarId: 'cal@test',
				singleEvents: false,
				timeMin: expect.any(String),
			},
		});
		expect(calls[1]).toMatchObject({
			method: 'instances',
			params: { eventId: 'coffee', maxResults: 1 },
		});
		expect(result).toEqual([
			{
				id: 'coffee',
				etag: '"1"',
				title: 'Virtual Coffee',
				description: 'Come hang out',
				joinLink: 'https://zoom.example/j/1',
				hostCode: '123456',
				eventType: 'virtual-coffee',
				recurrence: {
					kind: 'weekly',
					interval: 1,
					weekdays: ['TU', 'TH'],
					ends: { kind: 'never' },
				},
				recurrenceText: 'Every week on Tuesday, Thursday',
				date: '2026-01-06',
				startTime: '09:00',
				endTime: '10:00',
				nextEvent: {
					start: '2026-09-17T09:00:00-04:00',
					end: '2026-09-17T10:00:00-04:00',
				},
				htmlLink: 'https://calendar.google.com/x',
			},
		]);
	});

	test('follows pages', async () => {
		const { cal, calls } = fakeClient({
			list: [
				{ items: [series], nextPageToken: 'p2' },
				{
					items: [{ ...series, id: 'second', summary: 'Accountabilibuddies' }],
				},
			],
		});
		const result = await cal.listSeries();
		expect(result.map((entry) => entry.title)).toEqual([
			'Accountabilibuddies',
			'Virtual Coffee',
		]);
		expect(calls.filter((call) => call.method === 'list')[1]).toMatchObject({
			params: { pageToken: 'p2' },
		});
	});
});

describe('getSeries', () => {
	test('opens a legacy HTML description as Markdown', async () => {
		const { cal } = fakeClient({
			get: {
				coffee: {
					...series,
					description: '<p>Come <em>hang out</em></p><p>Bring coffee</p>',
				},
			},
		});
		await expect(cal.getSeries('coffee')).resolves.toMatchObject({
			description: 'Come *hang out*\n\nBring coffee',
		});
	});

	test('leaves a Markdown description as it is', async () => {
		const { cal } = fakeClient({
			get: { coffee: { ...series, description: 'Come *hang out*' } },
		});
		await expect(cal.getSeries('coffee')).resolves.toMatchObject({
			description: 'Come *hang out*',
		});
	});

	test.each([
		['no key', {}],
		['a key this code does not know', { eventType: 'karaoke' }],
	])('an Event Type with %s is none', async (_label, extra) => {
		const { cal } = fakeClient({
			get: {
				coffee: {
					...series,
					extendedProperties: { private: { hostCode: '1', ...extra } },
				},
			},
		});
		await expect(cal.getSeries('coffee')).resolves.toMatchObject({
			eventType: null,
		});
	});

	test('an id Google has never seen is nothing, not a throw', async () => {
		const { cal } = fakeClient({ get: { coffee: series } });
		await expect(cal.getSeries('gone')).resolves.toBeNull();
	});
});

describe('getEvent', () => {
	test('reads a one-off with everything its form edits', async () => {
		const { cal } = fakeClient({ get: { talk: oneOff } });
		await expect(cal.getEvent('talk')).resolves.toEqual({
			id: 'talk',
			etag: '"t1"',
			title: 'Lunch & Learn: Testing',
			description: 'Bring questions',
			joinLink: 'https://zoom.example/j/3',
			hostCode: '111111',
			eventType: null,
			date: '2026-11-04',
			startTime: '12:00',
			endTime: '13:00',
			status: 'confirmed',
			htmlLink: 'https://calendar.google.com/talk',
		});
	});

	test('a Cancelled one-off is still an Event', async () => {
		const { cal } = fakeClient({
			get: { talk: { ...oneOff, status: 'cancelled' } },
		});
		await expect(cal.getEvent('talk')).resolves.toMatchObject({
			status: 'cancelled',
		});
	});

	test('a Series, or an Event of one, names its Series instead', async () => {
		const { cal } = fakeClient({
			get: {
				coffee: series,
				coffee_20260915T130000Z: instance('coffee', '2026-09-15'),
			},
		});
		await expect(cal.getEvent('coffee')).resolves.toEqual({
			seriesId: 'coffee',
		});
		await expect(cal.getEvent('coffee_20260915T130000Z')).resolves.toEqual({
			seriesId: 'coffee',
		});
	});

	test("Google's tombstone for a slot no Series generates is nothing", async () => {
		const { cal } = fakeClient({
			get: {
				old_20260921T130000Z: {
					...oneOff,
					id: 'old_20260921T130000Z',
					status: 'cancelled',
				},
			},
		});
		await expect(cal.getEvent('old_20260921T130000Z')).resolves.toBeNull();
	});

	test('an id Google has never seen is nothing, not a throw', async () => {
		const { cal } = fakeClient({ get: { talk: oneOff } });
		await expect(cal.getEvent('gone')).resolves.toBeNull();
	});
});

describe('listUpcomingOneOffs', () => {
	test('lists one-offs from today on without expanding Series', async () => {
		const { cal, calls } = fakeClient({
			list: [
				{
					items: [
						series,
						{ ...oneOff, status: 'cancelled' },
						// A modified Event of a Series shows up unexpanded too.
						instance('coffee', '2026-09-22', {
							start: { dateTime: '2026-09-22T11:00:00-04:00' },
							end: { dateTime: '2026-09-22T12:00:00-04:00' },
						}),
						{ ...oneOff, id: 'later', etag: '"l"', summary: 'Retro' },
					],
				},
			],
		});
		const result = await cal.listUpcomingOneOffs();
		expect(calls).toEqual([
			expect.objectContaining({
				method: 'list',
				params: expect.objectContaining({
					singleEvents: false,
					showDeleted: true,
					timeMin: '2026-09-14T00:00:00.000-04:00',
				}),
			}),
		]);
		expect(calls[0].params).not.toHaveProperty('timeMax');
		expect(result).toMatchObject([
			{ id: 'talk', status: 'cancelled', seriesId: null },
			{ id: 'later', title: 'Retro', status: 'confirmed', seriesId: null },
		]);
	});
});

describe('listUpcomingEvents', () => {
	test('expands instances over the window, cancelled ones included', async () => {
		const { cal, calls } = fakeClient({
			list: [
				{
					items: [
						instance('coffee', '2026-09-15'),
						instance('coffee', '2026-09-17', {
							status: 'cancelled',
							summary: undefined,
							location: undefined,
							start: undefined,
							end: undefined,
						}),
						instance('coffee', '2026-09-22', {
							start: { dateTime: '2026-09-22T11:00:00-04:00' },
							end: { dateTime: '2026-09-22T12:00:00-04:00' },
						}),
						{
							id: 'allday',
							etag: '"a"',
							start: { date: '2026-09-20' },
							end: { date: '2026-09-21' },
						},
						// Google's placeholder for a slot an Ended or split Series no
						// longer generates: an instance-shaped id, no Series behind it.
						{
							id: 'old_20260921T130000Z',
							etag: '"t"',
							status: 'cancelled',
							summary: 'CANCELLED',
							created: '0000-12-31T00:00:00.000Z',
							start: { dateTime: '2026-09-21T09:00:00-04:00', timeZone: 'UTC' },
							end: { dateTime: '2026-09-21T10:00:00-04:00', timeZone: 'UTC' },
						},
						{
							id: 'oneoff',
							etag: '"o"',
							status: 'cancelled',
							summary: 'Retro',
							start: { dateTime: '2026-09-23T15:00:00-04:00' },
							end: { dateTime: '2026-09-23T16:00:00-04:00' },
						},
					],
				},
			],
			get: { coffee: series },
		});
		const result = await cal.listUpcomingEvents({ days: 30 });
		expect(calls[0]).toMatchObject({
			method: 'list',
			params: {
				singleEvents: true,
				showDeleted: true,
				orderBy: 'startTime',
				timeZone: 'America/New_York',
				timeMin: '2026-09-14T00:00:00.000-04:00',
				timeMax: '2026-10-14T00:00:00.000-04:00',
			},
		});
		expect(result).toMatchObject([
			{
				id: 'coffee_20260915T130000Z',
				status: 'confirmed',
				rescheduled: false,
			},
			{
				id: 'coffee_20260917T130000Z',
				status: 'cancelled',
				title: 'Virtual Coffee',
				joinLink: 'https://zoom.example/j/1',
				start: '2026-09-17T09:00:00-04:00',
				end: '2026-09-17T10:00:00.000-04:00',
				seriesId: 'coffee',
			},
			{ id: 'coffee_20260922T130000Z', status: 'confirmed', rescheduled: true },
			{ id: 'oneoff', status: 'cancelled', title: 'Retro', seriesId: null },
		]);
		expect(result.map((event) => event.id)).not.toContain(
			'old_20260921T130000Z',
		);
		// The bare cancelled row was filled from its Series, fetched once.
		expect(calls.filter((call) => call.method === 'get')).toHaveLength(1);
	});
});

describe('listSeriesEvents', () => {
	test("pages one Series' next months, cancelled ones included", async () => {
		const { cal, calls } = fakeClient({
			instances: {
				coffee: [
					{
						items: [
							instance('coffee', '2026-09-15'),
							instance('coffee', '2026-11-26', {
								status: 'cancelled',
								summary: undefined,
								location: undefined,
								start: undefined,
								end: undefined,
							}),
						],
						nextPageToken: 'p2',
					},
					{
						items: [
							instance('coffee', '2026-12-24', {
								start: { dateTime: '2026-12-23T09:00:00-05:00' },
								end: { dateTime: '2026-12-23T10:00:00-05:00' },
							}),
						],
					},
				],
			},
			get: { coffee: series },
		});
		const result = await cal.listSeriesEvents('coffee', { months: 12 });
		expect(calls.filter((call) => call.method === 'instances')).toMatchObject([
			{
				params: {
					eventId: 'coffee',
					showDeleted: true,
					timeZone: 'America/New_York',
					timeMin: '2026-09-14T12:00:00.000-04:00',
					timeMax: '2027-09-14T12:00:00.000-04:00',
					maxResults: 250,
					pageToken: undefined,
				},
			},
			{ params: { eventId: 'coffee', pageToken: 'p2' } },
		]);
		expect(result).toMatchObject([
			{
				id: 'coffee_20260915T130000Z',
				status: 'confirmed',
				rescheduled: false,
				originalStart: '2026-09-15T09:00:00-04:00',
			},
			{
				id: 'coffee_20261126T130000Z',
				status: 'cancelled',
				title: 'Virtual Coffee',
				start: '2026-11-26T09:00:00-04:00',
				end: '2026-11-26T10:00:00.000-04:00',
				seriesId: 'coffee',
			},
			{
				id: 'coffee_20261224T130000Z',
				status: 'confirmed',
				rescheduled: true,
				start: '2026-12-23T09:00:00-05:00',
				originalStart: '2026-12-24T09:00:00-04:00',
			},
		]);
	});
});

describe('writes', () => {
	const input: SeriesInput = {
		title: 'Feelings Friday',
		description: 'Talk it out',
		joinLink: 'https://zoom.example/j/2',
		hostCode: '654321',
		eventType: 'community-event',
		date: '2026-09-18',
		startTime: '12:00',
		endTime: '13:00',
		recurrence: {
			kind: 'monthly',
			interval: 1,
			ordinals: [1, 3],
			weekday: 'FR',
			ends: { kind: 'never' },
		},
	};

	test('createSeries inserts with the rule and display-zone times', async () => {
		const { cal, calls } = fakeClient({});
		await expect(cal.createSeries(input)).resolves.toBe('new-id');
		expect(calls[0]).toEqual({
			method: 'insert',
			params: {
				calendarId: 'cal@test',
				sendUpdates: 'none',
				requestBody: {
					summary: 'Feelings Friday',
					description: 'Talk it out',
					location: 'https://zoom.example/j/2',
					start: {
						dateTime: '2026-09-18T12:00:00.000-04:00',
						timeZone: 'America/New_York',
					},
					end: {
						dateTime: '2026-09-18T13:00:00.000-04:00',
						timeZone: 'America/New_York',
					},
					extendedProperties: {
						private: { hostCode: '654321', eventType: 'community-event' },
					},
					recurrence: ['RRULE:FREQ=MONTHLY;BYDAY=1FR,3FR'],
				},
			},
		});
	});

	test('no Host Code on create writes an empty one beside the type', async () => {
		const { cal, calls } = fakeClient({});
		await cal.createEvent({ ...input, hostCode: '' });
		expect(
			(calls[0].params as calendar_v3.Params$Resource$Events$Insert)
				.requestBody,
		).toMatchObject({
			extendedProperties: {
				private: { hostCode: '', eventType: 'community-event' },
			},
		});
	});

	test('updateSeries patches with If-Match and keeps the EXDATE lines', async () => {
		const { cal, calls } = fakeClient({
			get: {
				coffee: {
					...series,
					recurrence: [
						'EXDATE;TZID=America/New_York:20260917T090000',
						'RRULE:FREQ=WEEKLY;BYDAY=TU,TH',
					],
				},
			},
		});
		await cal.updateSeries('coffee', '"1"', input);
		expect(calls[1]).toMatchObject({
			method: 'patch',
			params: {
				eventId: 'coffee',
				sendUpdates: 'none',
				requestBody: {
					summary: 'Feelings Friday',
					// The map is replaced whole, so the legacy key rides along.
					extendedProperties: {
						private: {
							hostCode: '654321',
							eventType: 'community-event',
							joinLink: 'old',
						},
					},
					recurrence: [
						'EXDATE;TZID=America/New_York:20260917T090000',
						'RRULE:FREQ=MONTHLY;BYDAY=1FR,3FR',
					],
				},
			},
			options: { headers: { 'If-Match': '"1"' } },
		});
	});

	test('clearing the Host Code on update writes an empty one', async () => {
		const { cal, calls } = fakeClient({ get: { coffee: series } });
		await cal.updateSeries('coffee', '"1"', { ...input, hostCode: '' });
		expect(calls[1]).toMatchObject({
			params: {
				requestBody: {
					extendedProperties: {
						private: {
							hostCode: '',
							eventType: 'community-event',
							joinLink: 'old',
						},
					},
				},
			},
		});
	});

	test('a null recurrence leaves a custom rule as it is', async () => {
		const { cal, calls } = fakeClient({
			get: { coffee: { ...series, recurrence: ['RRULE:FREQ=DAILY'] } },
		});
		await cal.updateSeries('coffee', '"1"', { ...input, recurrence: null });
		expect(calls[1]).toMatchObject({ method: 'patch' });
		expect(
			(calls[1].params as calendar_v3.Params$Resource$Events$Patch).requestBody,
		).not.toHaveProperty('recurrence');
	});

	test('an etag that moved on is a conflict before anything is written', async () => {
		const { cal, calls } = fakeClient({
			get: { coffee: { ...series, etag: '"2"' } },
		});
		await expect(
			cal.updateSeries('coffee', '"1"', input),
		).rejects.toBeInstanceOf(CalendarConflictError);
		expect(calls.map((call) => call.method)).toEqual(['get']);
	});

	test.each([
		[{ status: 412 }],
		[{ code: 412 }],
		[{ response: { status: 412 } }],
	])('Google answering 412 (%j) is a conflict', async (shape) => {
		const { cal } = fakeClient({
			patchError: Object.assign(new Error('Precondition Failed'), shape),
		});
		await expect(cal.cancelEvent('x', '"1"')).rejects.toBeInstanceOf(
			CalendarConflictError,
		);
	});

	test.each([
		[{ status: 404 }],
		[{ code: 404 }],
		[{ response: { status: 404 } }],
	])('Google answering 404 (%j) is gone', async (shape) => {
		const { cal } = fakeClient({
			patchError: Object.assign(new Error('Not Found'), shape),
		});
		await expect(cal.cancelEvent('x', '"1"')).rejects.toBeInstanceOf(
			CalendarGoneError,
		);
	});

	test('a write against an id Google does not have is gone', async () => {
		const { cal, calls } = fakeClient({ get: { coffee: series } });
		await expect(cal.updateEvent('gone', '"1"', input)).rejects.toBeInstanceOf(
			CalendarGoneError,
		);
		expect(calls.map((call) => call.method)).toEqual(['get']);
	});

	test('any other failure propagates as itself', async () => {
		const boom = Object.assign(new Error('Forbidden'), { status: 403 });
		const { cal } = fakeClient({ patchError: boom });
		await expect(cal.cancelEvent('x', '"1"')).rejects.toBe(boom);
	});

	test('endSeries sets UNTIL now on a Series that has run', async () => {
		const { cal, calls } = fakeClient({
			get: {
				coffee: {
					...series,
					recurrence: ['RRULE:FREQ=WEEKLY;BYDAY=TU,TH;COUNT=50'],
				},
			},
			instances: { coffee: { items: [instance('coffee', '2026-09-10')] } },
		});
		await expect(cal.endSeries('coffee', '"1"')).resolves.toBe('ended');
		expect(calls[1]).toMatchObject({
			method: 'instances',
			params: { eventId: 'coffee', timeMax: expect.any(String), maxResults: 1 },
		});
		expect(calls[2]).toMatchObject({
			method: 'patch',
			params: {
				requestBody: {
					recurrence: ['RRULE:FREQ=WEEKLY;BYDAY=TU,TH;UNTIL=20260914T160000Z'],
				},
			},
			options: { headers: { 'If-Match': '"1"' } },
		});
	});

	test('endSeries deletes a Series that never ran', async () => {
		const { cal, calls } = fakeClient({ get: { coffee: series } });
		await expect(cal.endSeries('coffee', '"1"')).resolves.toBe('deleted');
		expect(calls[2]).toEqual({
			method: 'delete',
			params: {
				calendarId: 'cal@test',
				eventId: 'coffee',
				sendUpdates: 'none',
			},
			options: { headers: { 'If-Match': '"1"' } },
		});
	});

	test('updateEvent patches the whole one-off with If-Match', async () => {
		const { cal, calls } = fakeClient({ get: { talk: oneOff } });
		const { recurrence: _rule, ...event } = input;
		await cal.updateEvent('talk', '"t1"', { ...event, hostCode: '' });
		expect(calls[1]).toMatchObject({
			method: 'patch',
			params: {
				eventId: 'talk',
				sendUpdates: 'none',
				requestBody: {
					summary: 'Feelings Friday',
					description: 'Talk it out',
					location: 'https://zoom.example/j/2',
					start: { dateTime: '2026-09-18T12:00:00.000-04:00' },
					end: { dateTime: '2026-09-18T13:00:00.000-04:00' },
					extendedProperties: {
						private: { hostCode: '', eventType: 'community-event' },
					},
				},
			},
			options: { headers: { 'If-Match': '"t1"' } },
		});
		expect(calls[1].params).not.toHaveProperty('requestBody.recurrence');
	});

	test('cancel and reschedule patch one Event', async () => {
		const { cal, calls } = fakeClient({});
		await cal.cancelEvent('e1', '"a"');
		await cal.rescheduleEvent('e1', '"c"', {
			date: '2026-09-16',
			startTime: '10:30',
			endTime: '11:30',
		});
		expect(calls).toMatchObject([
			{
				params: { eventId: 'e1', requestBody: { status: 'cancelled' } },
				options: { headers: { 'If-Match': '"a"' } },
			},
			{
				params: {
					eventId: 'e1',
					requestBody: {
						start: {
							dateTime: '2026-09-16T10:30:00.000-04:00',
							timeZone: 'America/New_York',
						},
						end: {
							dateTime: '2026-09-16T11:30:00.000-04:00',
							timeZone: 'America/New_York',
						},
					},
				},
				options: { headers: { 'If-Match': '"c"' } },
			},
		]);
	});

	test('restore takes back a Cancel', async () => {
		const id = 'coffee_20260917T130000Z';
		const { cal, calls } = fakeClient({
			get: { [id]: instance('coffee', '2026-09-17', { status: 'cancelled' }) },
		});
		await cal.restoreEvent(id, '"coffee-2026-09-17"');
		expect(calls.filter((call) => call.method === 'patch')).toMatchObject([
			{
				params: { eventId: id, requestBody: { status: 'confirmed' } },
				options: { headers: { 'If-Match': '"coffee-2026-09-17"' } },
			},
		]);
		expect(calls.filter((call) => call.method === 'get')).toHaveLength(1);
	});

	test("restore takes back a Reschedule, with the Series' duration", async () => {
		const id = 'coffee_20260922T130000Z';
		const { cal, calls } = fakeClient({
			get: {
				[id]: instance('coffee', '2026-09-22', {
					start: { dateTime: '2026-09-23T11:00:00-04:00' },
					end: { dateTime: '2026-09-23T12:30:00-04:00' },
				}),
				coffee: series,
			},
		});
		await cal.restoreEvent(id, '"coffee-2026-09-22"');
		expect(calls.filter((call) => call.method === 'patch')).toMatchObject([
			{
				params: {
					eventId: id,
					requestBody: {
						status: 'confirmed',
						start: {
							dateTime: '2026-09-22T09:00:00.000-04:00',
							timeZone: 'America/New_York',
						},
						end: {
							dateTime: '2026-09-22T10:00:00.000-04:00',
							timeZone: 'America/New_York',
						},
					},
				},
				options: { headers: { 'If-Match': '"coffee-2026-09-22"' } },
			},
		]);
	});

	test('restore of an Event that moved on is a conflict', async () => {
		const { cal } = fakeClient({ get: { e1: { id: 'e1', etag: '"new"' } } });
		await expect(cal.restoreEvent('e1', '"old"')).rejects.toBeInstanceOf(
			CalendarConflictError,
		);
	});
});

describe('isCalendarEventId', () => {
	test.each([
		['abc12', true],
		['coffee_20260915T130000Z', true],
		['_6cq3ad9j6oq3ab9l60o3gb9k@google.com', true],
		['ab', false],
		['a/b/c', false],
		['has space', false],
	])('%s → %s', (value, ok) => {
		expect(isCalendarEventId(value)).toBe(ok);
	});
});
