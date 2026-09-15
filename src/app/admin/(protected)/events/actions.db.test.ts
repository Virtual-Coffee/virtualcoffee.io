import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { CalendarConflictError } from '@/lib/eventsCalendar';
import { NOT_FOUND } from '@/test/next';
import { signInAs } from '@/test/session';

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
const connectEventsCalendar = vi.fn();
const revalidateTag = vi.fn();
const revalidatePath = vi.fn();

vi.mock('@/lib/eventsCalendar', async (importOriginal) => ({
	...(await importOriginal<typeof import('@/lib/eventsCalendar')>()),
	connectEventsCalendar: () => connectEventsCalendar(),
}));
vi.mock('next/cache', () => ({
	revalidateTag: (...args: unknown[]) => revalidateTag(...args),
	revalidatePath: (...args: unknown[]) => revalidatePath(...args),
	// `src/data/events.ts` wraps `getEvents` at import time.
	unstable_cache: (fn: unknown) => fn,
}));

const {
	cancelEvent,
	createEvent,
	createSeries,
	endSeries,
	rescheduleEvent,
	restoreEvent,
	updateEvent,
	updateSeries,
} = await import('./actions');

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
	revalidateTag.mockReset();
	revalidatePath.mockReset();
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
	test.each([
		['an empty title', { ...series, title: '  ' }, 'Give it a title.'],
		[
			'a Join Link that is not a URL',
			{ ...series, joinLink: 'zoom' },
			'The Join Link has to be a full URL.',
		],
		[
			'a Zoom Join Link without a host code',
			{ ...series, joinLink: 'https://us02web.zoom.us/j/12345678901' },
			'A Zoom Join Link needs its host code, or the Slack bots cannot announce it.',
		],
		[
			'a host code that is not 6–10 digits',
			{ ...series, hostCode: 'abc' },
			'A Zoom host code is 6–10 digits.',
		],
		['no Event Type', { ...series, eventType: '' }, 'Pick an Event Type.'],
		[
			'an Event Type this code does not know',
			{ ...series, eventType: 'karaoke' },
			'Pick an Event Type.',
		],
		[
			'an end before the start',
			{ ...series, endTime: '08:00' },
			'The end has to be after the start, on the same day.',
		],
		[
			'a first Event off the rule',
			{ ...series, date: '2026-09-16' },
			'The first Event has to fall on a day the rule repeats on.',
		],
		[
			'a rule that ends before it starts',
			{
				...series,
				recurrence: {
					...series.recurrence,
					ends: { kind: 'until', date: '2026-09-01' },
				},
			},
			'The rule ends before its first Event.',
		],
		[
			'no days',
			{ ...series, recurrence: { ...series.recurrence, weekdays: [] } },
			'Pick at least one day.',
		],
		[
			'no rule at all',
			{ ...series, recurrence: null },
			'Say how the Series repeats.',
		],
	])('createSeries refuses %s', async (_what, input, message) => {
		await expect(createSeries(input)).resolves.toEqual({ ok: false, message });
		expect(calendar.createSeries).not.toHaveBeenCalled();
	});

	test('a Zoom Join Link with its host code is accepted', async () => {
		await expect(
			createSeries({
				...series,
				joinLink: 'https://us02web.zoom.us/j/12345678901?pwd=x',
				hostCode: ' 123456 ',
			}),
		).resolves.toMatchObject({ ok: true });
		expect(calendar.createSeries).toHaveBeenCalledWith(
			expect.objectContaining({ hostCode: '123456' }),
		);
	});

	test('updateSeries accepts a null rule and leaves it alone', async () => {
		await expect(
			updateSeries(ID, ETAG, { ...series, recurrence: null }),
		).resolves.toMatchObject({ ok: true });
		expect(calendar.updateSeries).toHaveBeenCalledWith(
			ID,
			ETAG,
			expect.objectContaining({ recurrence: null }),
		);
	});

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

	test('updateEvent validates like createEvent and ignores a rule', async () => {
		await expect(
			updateEvent(ID, ETAG, { ...series, title: '' }),
		).resolves.toEqual({
			ok: false,
			message: 'Give it a title.',
		});
		await expect(updateEvent(ID, ETAG, series)).resolves.toEqual({
			ok: true,
			message: '“Virtual Coffee” is updated.',
		});
		const { recurrence: _rule, ...event } = series;
		expect(calendar.updateEvent).toHaveBeenCalledWith(ID, ETAG, event);
	});

	test('rescheduleEvent checks the time', async () => {
		await expect(
			rescheduleEvent(ID, ETAG, {
				date: 'soon',
				startTime: '09:00',
				endTime: '10:00',
			}),
		).resolves.toEqual({ ok: false, message: 'Pick a date.' });
		await expect(
			rescheduleEvent(ID, ETAG, {
				date: '2026-09-17',
				startTime: '25:00',
				endTime: '26:00',
			}),
		).resolves.toEqual({ ok: false, message: 'Pick a real time.' });
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
			message:
				'This changed in Google Calendar since you loaded it. Check the current details and try again.',
		});
		expect(revalidateTag).not.toHaveBeenCalled();
	});

	test('any other failure propagates', async () => {
		calendar.restoreEvent.mockRejectedValue(new Error('quota'));
		await expect(restoreEvent(ID, ETAG)).rejects.toThrow('quota');
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
		await expect(cancelEvent(ID, ETAG)).resolves.toEqual({
			ok: true,
			message: `Captured (local): cancel Event ${ID} — nothing was written to the Events Calendar.`,
		});
		// The log line is the constant label; the id is only in the message.
		expect(info).toHaveBeenCalledWith('[calendar captured] cancel Event');
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
