'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { z } from 'zod';

import type { ActionResult } from '@/lib/actionResult';
import { requirePermission } from '@/lib/adminAccess';
import {
	eventInputSchema,
	seriesInputSchema,
	seriesUpdateSchema,
	timeInputSchema,
} from '@/lib/eventDraft';
import {
	CalendarConflictError,
	CalendarGoneError,
	connectEventsCalendar,
	isCalendarEventId,
	type EventsCalendar,
} from '@/lib/eventsCalendar';
import { deliver } from '@/lib/outbound';

const CONFLICT =
	'This changed in Google Calendar since you loaded it. Check the current details and try again.';
const NOT_CONFIGURED =
	'The Events Calendar is not configured: GOOGLE_SERVICE_ACCOUNT_KEY and GOOGLE_CALENDAR_ID are needed.';
const GONE = 'That no longer exists on the Events Calendar.';

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
 * Every write goes through `deliver()`: the Delivery Mode first
 * (docs/adr/0013), then the calendar, then the caches. `label` is a literal
 * naming the operation — the only thing logged, so nothing a maintainer typed
 * reaches the log; `write` returns the success message.
 */
function write(
	label: string,
	write: (calendar: EventsCalendar) => Promise<string>,
): Promise<ActionResult> {
	return deliver({
		kind: 'calendar',
		target: label,
		body: '',
		unreachable: 'the Events Calendar',
		live: async () => {
			const calendar = connectEventsCalendar();
			if (!calendar) {
				return { ok: false, definitelyNotSent: true, message: NOT_CONFIGURED };
			}
			try {
				const message = await write(calendar);
				revalidate();
				return { ok: true, message };
			} catch (error) {
				if (error instanceof CalendarConflictError) {
					return { ok: false, definitelyNotSent: true, message: CONFLICT };
				}
				if (error instanceof CalendarGoneError) {
					return { ok: false, definitelyNotSent: true, message: GONE };
				}
				throw error;
			}
		},
	});
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
	return write('create Series', async (calendar) => {
		await calendar.createSeries(parsed.data);
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
	return write('update Series', async (calendar) => {
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
	return write('end Series', async (calendar) => {
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
	return write('create Event', async (calendar) => {
		await calendar.createEvent(parsed.data);
		return `“${parsed.data.title}” is on the Events Calendar.`;
	});
}

export async function updateEvent(
	id: string,
	etag: string,
	input: unknown,
): Promise<ActionResult> {
	await requirePermission('events', 'manage');
	const missing = target(id, etag);
	if (missing) return missing;
	const parsed = eventInputSchema.safeParse(input);
	if (!parsed.success) return firstIssue(parsed.error, 'Check the Event.');
	return write('update Event', async (calendar) => {
		await calendar.updateEvent(id, etag, parsed.data);
		return `“${parsed.data.title}” is updated.`;
	});
}

export async function cancelEvent(
	id: string,
	etag: string,
): Promise<ActionResult> {
	await requirePermission('events', 'manage');
	const missing = target(id, etag);
	if (missing) return missing;
	return write('cancel Event', async (calendar) => {
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
	return write('restore Event', async (calendar) => {
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
	return write('reschedule Event', async (calendar) => {
		await calendar.rescheduleEvent(id, etag, parsed.data);
		return 'Rescheduled.';
	});
}
