import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { CalendarConflictError, CalendarGoneError } from '@/lib/eventsCalendar';
import { connectEventsCalendar } from '@/test/mocks/eventsCalendar';
import { revalidatePath, revalidateTag } from '@/test/mocks/nextCache';
import { NOT_FOUND } from '@/test/next';
import { signInAs } from '@/test/session';

import {
	cancelEvent,
	createEvent,
	createSeries,
	endSeries,
	rescheduleEvent,
	restoreEvent,
	updateEvent,
	updateSeries,
} from './actions';

const calendar = {
	createSeries: vi.fn(),
	updateSeries: vi.fn(),
	endSeries: vi.fn(),
	createEvent: vi.fn(),
	updateEvent: vi.fn(),
	cancelEvent: vi.fn(),
	restoreEvent: vi.fn(),
	rescheduleEvent: vi.fn(),
};

const series = {
	title: 'Virtual Coffee',
	description: 'Come hang out',
	joinLink: 'https://meet.example/coffee',
	hostCode: '',
	eventType: 'virtual-coffee',
	date: '2026-09-15', // a Tuesday
	startTime: '09:00',
	endTime: '10:00',
	recurrence: {
		kind: 'weekly',
		interval: 1,
		weekdays: ['TU', 'TH'],
		ends: { kind: 'never' },
	},
};

const ID = 'coffee_20260915T130000Z';
const ETAG = '"1"';

beforeEach(async () => {
	await signInAs('event_organizer');
	vi.stubEnv('CALENDAR_LIVE_OUTSIDE_PRODUCTION', 'true');
	connectEventsCalendar.mockReturnValue(calendar);
	for (const fn of Object.values(calendar)) fn.mockReset();
});
afterEach(() => vi.unstubAllEnvs());

describe('access', () => {
	test.each([
		['createSeries', () => createSeries(series)],
		['updateSeries', () => updateSeries(ID, ETAG, series)],
		['endSeries', () => endSeries(ID, ETAG)],
		['createEvent', () => createEvent(series)],
		['updateEvent', () => updateEvent(ID, ETAG, series)],
		['cancelEvent', () => cancelEvent(ID, ETAG)],
		['restoreEvent', () => restoreEvent(ID, ETAG)],
		['rescheduleEvent', () => rescheduleEvent(ID, ETAG, series)],
	])('%s needs events:manage', async (_name, call) => {
		await signInAs('waitlist_reviewer');
		await expect(call()).rejects.toMatchObject(NOT_FOUND);
		expect(connectEventsCalendar).not.toHaveBeenCalled();
	});
});

describe('validation', () => {
	// The Draft rules and their messages are `src/lib/eventDraft.test.ts`'s;
	// what matters here is that every action parses before it writes.
	test.each<[keyof typeof calendar, () => Promise<unknown>, string]>([
		[
			'createSeries',
			() => createSeries({ ...series, title: '  ' }),
			'Give it a title.',
		],
		[
			'updateSeries',
			() => updateSeries(ID, ETAG, { ...series, date: '2026-09-16' }),
			'The first Event has to fall on a day the rule repeats on.',
		],
		[
			'createEvent',
			() => createEvent({ ...series, eventType: '' }),
			'Pick an Event Type.',
		],
		[
			'updateEvent',
			() => updateEvent(ID, ETAG, { ...series, joinLink: 'zoom' }),
			'The Join Link has to be a full URL.',
		],
		[
			'rescheduleEvent',
			() =>
				rescheduleEvent(ID, ETAG, {
					date: 'soon',
					startTime: '09:00',
					endTime: '10:00',
				}),
			'Pick a date.',
		],
	])(
		'%s refuses an invalid input and writes nothing',
		async (name, call, message) => {
			await expect(call()).resolves.toEqual({ ok: false, message });
			expect(calendar[name]).not.toHaveBeenCalled();
		},
	);

	test('a malformed id or a blank etag is "no longer exists"', async () => {
		await expect(cancelEvent('a/b', ETAG)).resolves.toEqual({
			ok: false,
			message: 'That no longer exists on the Events Calendar.',
		});
		await expect(cancelEvent(ID, '')).resolves.toEqual({
			ok: false,
			message: 'That no longer exists on the Events Calendar.',
		});
		await expect(updateEvent(ID, '', series)).resolves.toEqual({
			ok: false,
			message: 'That no longer exists on the Events Calendar.',
		});
		expect(calendar.cancelEvent).not.toHaveBeenCalled();
		expect(calendar.updateEvent).not.toHaveBeenCalled();
	});
});

describe('writing', () => {
	test('a write goes to the calendar and then revalidates', async () => {
		calendar.createSeries.mockResolvedValue('new-id');
		await expect(createSeries(series)).resolves.toEqual({
			ok: true,
			message: '“Virtual Coffee” is on the Events Calendar.',
		});
		expect(calendar.createSeries).toHaveBeenCalledWith(series);
		expect(revalidateTag).toHaveBeenCalledWith('events', { expire: 0 });
		expect(revalidatePath.mock.calls).toEqual([
			['/events'],
			['/'],
			['/admin/events', 'layout'],
			['/admin'],
		]);
	});

	test('updateSeries passes a null rule through, to be left alone', async () => {
		await expect(
			updateSeries(ID, ETAG, { ...series, recurrence: null }),
		).resolves.toMatchObject({ ok: true });
		expect(calendar.updateSeries).toHaveBeenCalledWith(
			ID,
			ETAG,
			expect.objectContaining({ recurrence: null }),
		);
	});

	test('updateEvent writes the Event without the rule it was handed', async () => {
		await expect(updateEvent(ID, ETAG, series)).resolves.toEqual({
			ok: true,
			message: '“Virtual Coffee” is updated.',
		});
		const { recurrence: _rule, ...event } = series;
		expect(calendar.updateEvent).toHaveBeenCalledWith(ID, ETAG, event);
	});

	test('endSeries reports which of the two things happened', async () => {
		calendar.endSeries.mockResolvedValue('deleted');
		await expect(endSeries(ID, ETAG)).resolves.toMatchObject({
			ok: true,
			message: expect.stringContaining('never ran'),
		});
		calendar.endSeries.mockResolvedValue('ended');
		await expect(endSeries(ID, ETAG)).resolves.toMatchObject({
			ok: true,
			message: expect.stringContaining('has ended'),
		});
	});

	test('a conflict is a message, not a crash, and nothing revalidates', async () => {
		calendar.cancelEvent.mockRejectedValue(new CalendarConflictError());
		await expect(cancelEvent(ID, ETAG)).resolves.toEqual({
			ok: false,
			definitelyNotSent: true,
			message:
				'This changed in Google Calendar since you loaded it. Check the current details and try again.',
		});
		expect(revalidateTag).not.toHaveBeenCalled();
	});

	test('an id the calendar no longer has is a message, not a crash', async () => {
		calendar.updateEvent.mockRejectedValue(new CalendarGoneError());
		await expect(updateEvent(ID, ETAG, series)).resolves.toEqual({
			ok: false,
			definitelyNotSent: true,
			message: 'That no longer exists on the Events Calendar.',
		});
		expect(revalidateTag).not.toHaveBeenCalled();
	});

	test('any other failure is a message too, and nothing revalidates', async () => {
		calendar.restoreEvent.mockRejectedValue(new Error('quota'));
		await expect(restoreEvent(ID, ETAG)).resolves.toEqual({
			ok: false,
			definitelyNotSent: true,
			message: 'Could not reach the Events Calendar: quota',
		});
		expect(revalidateTag).not.toHaveBeenCalled();
	});

	test('an unconfigured calendar says so', async () => {
		connectEventsCalendar.mockReturnValue(null);
		await expect(cancelEvent(ID, ETAG)).resolves.toMatchObject({
			ok: false,
			message: expect.stringContaining('not configured'),
		});
	});
});

describe('Delivery Mode', () => {
	test('outside production a write is captured: reported, never sent', async () => {
		vi.stubEnv('CALENDAR_LIVE_OUTSIDE_PRODUCTION', undefined);
		const info = vi.spyOn(console, 'info').mockImplementation(() => {});
		await expect(cancelEvent(ID, ETAG)).resolves.toMatchObject({
			ok: true,
			warning: 'Captured, not written to the Events Calendar (local).',
		});
		// The log line is the constant label: nothing a maintainer typed, no id.
		expect(info).toHaveBeenCalledWith('[calendar captured] local cancel Event');
		expect(connectEventsCalendar).not.toHaveBeenCalled();
		expect(revalidateTag).not.toHaveBeenCalled();
		info.mockRestore();
	});

	test('validation still runs first, so a captured write is a real one', async () => {
		vi.stubEnv('CALENDAR_LIVE_OUTSIDE_PRODUCTION', undefined);
		await expect(createEvent({ ...series, title: '' })).resolves.toEqual({
			ok: false,
			message: 'Give it a title.',
		});
	});
});
