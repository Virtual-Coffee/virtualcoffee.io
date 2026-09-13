'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { DateTime } from 'luxon';
import { z } from 'zod';

import type { ActionResult } from '@/lib/actionResult';
import { requirePermission } from '@/lib/adminAccess';
import {
	CalendarConflictError,
	connectEventsCalendar,
	isCalendarEventId,
	type EventsCalendar,
} from '@/lib/eventsCalendar';
import { calendarDelivery, deployContext } from '@/lib/outbound';
import {
	endsBeforeStart,
	firstOccurrenceMatches,
	ORDINALS,
	WEEKDAYS,
} from '@/lib/recurrence';

const CONFLICT =
	'This changed in Google Calendar since you loaded it. Reload the page and try again.';
const NOT_CONFIGURED =
	'The Events Calendar is not configured: GOOGLE_SERVICE_ACCOUNT_KEY and GOOGLE_CALENDAR_ID are needed.';
const GONE = 'That no longer exists on the Events Calendar.';

const dateSchema = z
	.string()
	.regex(/^\d{4}-\d{2}-\d{2}$/, 'Pick a date.')
	.refine((value) => DateTime.fromISO(value).isValid, 'Pick a real date.');
const timeSchema = z.string().regex(/^\d{2}:\d{2}$/, 'Pick a time.');

const timeInputSchema = z
	.object({ date: dateSchema, startTime: timeSchema, endTime: timeSchema })
	.refine((value) => value.endTime > value.startTime, {
		message: 'The end has to be after the start, on the same day.',
		path: ['endTime'],
	});

const eventInputSchema = timeInputSchema.safeExtend({
	title: z.string().trim().min(1, 'Give it a title.').max(200),
	description: z.string().max(8000, 'The description is too long.'),
	joinLink: z.url('The Join Link has to be a full URL.').max(2000),
});

const endsSchema = z.discriminatedUnion('kind', [
	z.object({ kind: z.literal('never') }),
	z.object({ kind: z.literal('until'), date: dateSchema }),
	z.object({
		kind: z.literal('count'),
		count: z.int().min(1, 'At least one Event.').max(999),
	}),
]);

const intervalSchema = z.int().min(1).max(52);
const weekdaySchema = z.enum(WEEKDAYS);

const recurrenceSchema = z.discriminatedUnion('kind', [
	z.object({
		kind: z.literal('weekly'),
		interval: intervalSchema,
		weekdays: z.array(weekdaySchema).min(1, 'Pick at least one day.').max(7),
		ends: endsSchema,
		weekStart: weekdaySchema.optional(),
	}),
	z.object({
		kind: z.literal('monthly'),
		interval: intervalSchema,
		ordinals: z
			.array(z.literal(ORDINALS))
			.min(1, 'Pick at least one week of the month.')
			.max(5),
		weekday: weekdaySchema,
		ends: endsSchema,
	}),
]);

// A rule the form cannot edit (`custom`) is sent as null and left alone.
const seriesUpdateSchema = eventInputSchema
	.safeExtend({ recurrence: recurrenceSchema.nullable() })
	.refine(
		(value) =>
			!value.recurrence || firstOccurrenceMatches(value.recurrence, value.date),
		{
			message: 'The first Event has to fall on a day the rule repeats on.',
			path: ['date'],
		},
	)
	.refine(
		(value) =>
			!value.recurrence || !endsBeforeStart(value.recurrence, value.date),
		{ message: 'The rule ends before its first Event.', path: ['recurrence'] },
	);

const seriesInputSchema = seriesUpdateSchema.refine(
	(value) => value.recurrence !== null,
	{ message: 'Say how the Series repeats.', path: ['recurrence'] },
);

function firstIssue(error: z.ZodError, fallback: string): ActionResult {
	return { ok: false, message: error.issues[0]?.message ?? fallback };
}

const etagSchema = z.string().min(1);

function revalidate() {
	// The public pages read through `getEvents`' tag; the admin pages read
	// live, but their route cache still has to go.
	revalidateTag('events', { expire: 0 });
	revalidatePath('/events');
	revalidatePath('/');
	revalidatePath('/admin/events', 'layout');
	revalidatePath('/admin');
}

/**
 * Every write goes through here: the Delivery Mode first (docs/adr/0013),
 * then the calendar, then the caches. `describe` is the log line and the
 * captured message; `write` returns the success message.
 */
async function write(
	describe: string,
	write: (calendar: EventsCalendar) => Promise<string>,
): Promise<ActionResult> {
	if (calendarDelivery() === 'captured') {
		console.info(`[calendar captured] ${describe}`);
		return {
			ok: true,
			message: `Captured (${deployContext()}): ${describe} — nothing was written to the Events Calendar.`,
		};
	}
	const calendar = connectEventsCalendar();
	if (!calendar) return { ok: false, message: NOT_CONFIGURED };
	try {
		const message = await write(calendar);
		revalidate();
		return { ok: true, message };
	} catch (error) {
		if (error instanceof CalendarConflictError) {
			return { ok: false, message: CONFLICT };
		}
		throw error;
	}
}

function target(id: string, etag: string): ActionResult | null {
	if (!isCalendarEventId(id) || !etagSchema.safeParse(etag).success) {
		return { ok: false, message: GONE };
	}
	return null;
}

export async function createSeries(input: unknown): Promise<ActionResult> {
	await requirePermission('events', 'manage');
	const parsed = seriesInputSchema.safeParse(input);
	if (!parsed.success) return firstIssue(parsed.error, 'Check the Series.');
	const { recurrence, ...rest } = parsed.data;
	if (!recurrence) return { ok: false, message: 'Say how the Series repeats.' };
	return write(`create Series “${parsed.data.title}”`, async (calendar) => {
		await calendar.createSeries({ ...rest, recurrence });
		return `“${parsed.data.title}” is on the Events Calendar.`;
	});
}

export async function updateSeries(
	id: string,
	etag: string,
	input: unknown,
): Promise<ActionResult> {
	await requirePermission('events', 'manage');
	const missing = target(id, etag);
	if (missing) return missing;
	const parsed = seriesUpdateSchema.safeParse(input);
	if (!parsed.success) return firstIssue(parsed.error, 'Check the Series.');
	return write(`update Series ${id}`, async (calendar) => {
		await calendar.updateSeries(id, etag, parsed.data);
		return `“${parsed.data.title}” is updated, every Event of it.`;
	});
}

export async function endSeries(
	id: string,
	etag: string,
): Promise<ActionResult> {
	await requirePermission('events', 'manage');
	const missing = target(id, etag);
	if (missing) return missing;
	return write(`end Series ${id}`, async (calendar) => {
		const outcome = await calendar.endSeries(id, etag);
		return outcome === 'deleted'
			? 'The Series never ran, so it was removed from the Events Calendar.'
			: 'The Series has ended. Its past Events stay on the Events Calendar.';
	});
}

export async function createEvent(input: unknown): Promise<ActionResult> {
	await requirePermission('events', 'manage');
	const parsed = eventInputSchema.safeParse(input);
	if (!parsed.success) return firstIssue(parsed.error, 'Check the Event.');
	return write(`create Event “${parsed.data.title}”`, async (calendar) => {
		await calendar.createEvent(parsed.data);
		return `“${parsed.data.title}” is on the Events Calendar.`;
	});
}

export async function cancelEvent(
	id: string,
	etag: string,
): Promise<ActionResult> {
	await requirePermission('events', 'manage');
	const missing = target(id, etag);
	if (missing) return missing;
	return write(`cancel Event ${id}`, async (calendar) => {
		await calendar.cancelEvent(id, etag);
		return 'Cancelled. It stays listed here so it can be restored.';
	});
}

export async function restoreEvent(
	id: string,
	etag: string,
): Promise<ActionResult> {
	await requirePermission('events', 'manage');
	const missing = target(id, etag);
	if (missing) return missing;
	return write(`restore Event ${id}`, async (calendar) => {
		await calendar.restoreEvent(id, etag);
		return 'Restored.';
	});
}

export async function rescheduleEvent(
	id: string,
	etag: string,
	when: unknown,
): Promise<ActionResult> {
	await requirePermission('events', 'manage');
	const missing = target(id, etag);
	if (missing) return missing;
	const parsed = timeInputSchema.safeParse(when);
	if (!parsed.success) return firstIssue(parsed.error, 'Check the time.');
	return write(`reschedule Event ${id}`, async (calendar) => {
		await calendar.rescheduleEvent(id, etag, parsed.data);
		return 'Rescheduled.';
	});
}
