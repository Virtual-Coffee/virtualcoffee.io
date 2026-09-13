/**
 * /admin/events' view of the Events Calendar: Series and upcoming Events with
 * the etag each write must present, and the writes themselves. Google Calendar
 * is the system of record (docs/adr/0014), so nothing here is stored — every
 * read is a live API call and every write is conditional on the etag the
 * maintainer loaded.
 */
import type { calendar_v3 } from '@googleapis/calendar';
import { DateTime } from 'luxon';

import { createCalendarClient } from '@/data/events';
import { DISPLAY_ZONE } from '@/util/date';
import { looksLikeHtml } from '@/util/descriptionFormat';
import { htmlToMarkdown } from '@/util/markdown.server';
import {
	describeRecurrence,
	parseRecurrence,
	serializeRecurrence,
	type Recurrence,
	type RecurrenceForm,
} from '@/lib/recurrence';

/** A writer must present the etag it read; Google answers 412 if it moved on. */
export type WriteOptions = { headers: { 'If-Match': string } };

/** The calls this module makes, so tests can hand it a fake. */
export interface CalendarClient {
	events: {
		list(
			params: calendar_v3.Params$Resource$Events$List,
		): Promise<{ data: calendar_v3.Schema$Events }>;
		get(
			params: calendar_v3.Params$Resource$Events$Get,
		): Promise<{ data: calendar_v3.Schema$Event }>;
		instances(
			params: calendar_v3.Params$Resource$Events$Instances,
		): Promise<{ data: calendar_v3.Schema$Events }>;
		insert(
			params: calendar_v3.Params$Resource$Events$Insert,
		): Promise<{ data: calendar_v3.Schema$Event }>;
		patch(
			params: calendar_v3.Params$Resource$Events$Patch,
			options: WriteOptions,
		): Promise<{ data: calendar_v3.Schema$Event }>;
		delete(
			params: calendar_v3.Params$Resource$Events$Delete,
			options: WriteOptions,
		): Promise<unknown>;
	};
}

export type Series = {
	id: string;
	etag: string;
	title: string;
	/** Markdown; a legacy HTML description is converted on the way in. */
	description: string;
	joinLink: string;
	/** `extendedProperties.private.hostCode`; '' when there is none. */
	hostCode: string;
	recurrence: Recurrence;
	recurrenceText: string;
	/** The first Event, in the display zone. */
	date: string;
	startTime: string;
	endTime: string;
	nextEvent: { start: string; end: string } | null;
	htmlLink: string | null;
};

export type AdminEvent = {
	id: string;
	etag: string;
	title: string;
	start: string;
	end: string;
	status: 'confirmed' | 'cancelled';
	seriesId: string | null;
	/** An Event of a Series that no longer sits where the rule put it. */
	rescheduled: boolean;
	/** Where the rule put an Event of a Series, whether or not it still sits there. */
	originalStart: string | null;
	joinLink: string;
	htmlLink: string | null;
};

export type SeriesInput = {
	title: string;
	description: string;
	joinLink: string;
	hostCode: string;
	date: string;
	startTime: string;
	endTime: string;
	recurrence: RecurrenceForm;
};

/** An update may leave a rule the form cannot edit (`custom`) as it is. */
export type SeriesUpdate = Omit<SeriesInput, 'recurrence'> & {
	recurrence: RecurrenceForm | null;
};

export type EventInput = Omit<SeriesInput, 'recurrence'>;

export type TimeInput = Pick<SeriesInput, 'date' | 'startTime' | 'endTime'>;

/** The etag the maintainer loaded is no longer the calendar's. */
export class CalendarConflictError extends Error {
	constructor() {
		super('The event changed in Google Calendar since it was loaded.');
		this.name = 'CalendarConflictError';
	}
}

/**
 * Google event ids are base32hex; an instance id appends `_` and the original
 * start. Imported events can carry other characters, so this only keeps a
 * URL segment from becoming an API call with a path in it.
 */
export function isCalendarEventId(value: string): boolean {
	return /^[A-Za-z0-9_@.-]{5,1024}$/.test(value);
}

/**
 * The same test the bots apply (`src/zoom/join-link.ts` in vc-bots): a Zoom
 * join URL is what makes a Host Code mandatory, because the bots refuse to
 * announce a Zoom Event without one.
 */
export function isZoomJoinLink(url: string): boolean {
	return /zoom\.us\/j\/(\d{9,11})(?:[/?#]|$)/.test(url);
}

/** The Host Code as the bots read it: trimmed, empty is none. */
function hostCodeOf(event: calendar_v3.Schema$Event): string {
	return event.extendedProperties?.private?.hostCode?.trim() ?? '';
}

/**
 * Private properties are per calendar copy and the Google UI cannot edit
 * them, so the admin page owns `hostCode` (docs/adr/0014). The map is
 * replaced whole on a patch, so whatever else is there is carried over.
 */
function withHostCode(
	existing: calendar_v3.Schema$Event | null,
	hostCode: string,
): Pick<calendar_v3.Schema$Event, 'extendedProperties'> {
	const current = existing?.extendedProperties?.private ?? {};
	if (!existing && !hostCode) return {};
	return { extendedProperties: { private: { ...current, hostCode } } };
}

function isConflict(error: unknown): boolean {
	if (typeof error !== 'object' || error === null) return false;
	const { status, code, response } = error as {
		status?: number;
		code?: string | number;
		response?: { status?: number };
	};
	return status === 412 || code === 412 || response?.status === 412;
}

/** luxon types `toISO()` as nullable for an invalid DateTime; ours never are. */
function iso(at: DateTime): string {
	const value = at.toISO();
	if (!value) throw new Error(`Invalid DateTime: ${at.invalidReason}`);
	return value;
}

function toEventDateTime(
	date: string,
	time: string,
): calendar_v3.Schema$EventDateTime {
	const at = DateTime.fromISO(`${date}T${time}`, { zone: DISPLAY_ZONE });
	if (!at.isValid) throw new Error(`Not a date and time: ${date} ${time}`);
	return { dateTime: at.toISO(), timeZone: DISPLAY_ZONE };
}

function fromEventDateTime(
	value: calendar_v3.Schema$EventDateTime | undefined,
) {
	const at = DateTime.fromISO(value?.dateTime ?? '', { zone: DISPLAY_ZONE });
	return at.isValid
		? { date: at.toISODate(), time: at.toFormat('HH:mm'), iso: at.toISO() }
		: null;
}

/** `RRULE` lines aside, a `recurrence` array carries EXDATE/RDATE lines to keep. */
function withRule(lines: readonly string[] | null | undefined, rule: string) {
	return [...(lines ?? []).filter((line) => !line.startsWith('RRULE:')), rule];
}

/** The rule with its end replaced by `UNTIL=<now>`, whatever shape it has. */
function endedRule(line: string, now: DateTime): string {
	const stripped = line
		.replace(/;UNTIL=[^;]*/g, '')
		.replace(/;COUNT=[^;]*/g, '')
		.replace(/RRULE:UNTIL=[^;]*;?/, 'RRULE:')
		.replace(/RRULE:COUNT=[^;]*;?/, 'RRULE:');
	return `${stripped};UNTIL=${now.toUTC().toFormat("yyyyLLdd'T'HHmmss'Z'")}`;
}

/**
 * Google's placeholder for a slot a Series no longer generates (an Ended or
 * split Series): an instance-shaped id with no Series behind it. Not an Event
 * anyone Cancelled, so not a row. ADR 0014.
 */
function isTombstone(event: calendar_v3.Schema$Event) {
	return (
		event.status === 'cancelled' &&
		!event.recurringEventId &&
		/_\d{8}T\d{6}Z$/.test(event.id ?? '')
	);
}

/** Whether an Event of a Series sits somewhere other than where the rule put it. */
function moved(originalStart: string | null, start: string): boolean {
	return (
		originalStart !== null &&
		DateTime.fromISO(originalStart).toMillis() !==
			DateTime.fromISO(start).toMillis()
	);
}

/** How long a Series' Events run, from the Series itself. */
function duration(series: calendar_v3.Schema$Event) {
	return DateTime.fromISO(series.end?.dateTime ?? '').diff(
		DateTime.fromISO(series.start?.dateTime ?? ''),
	);
}

function timed(event: calendar_v3.Schema$Event) {
	return typeof event.start?.dateTime === 'string' &&
		typeof event.end?.dateTime === 'string'
		? { start: event.start.dateTime, end: event.end.dateTime }
		: null;
}

export function eventsCalendar(client: CalendarClient, calendarId: string) {
	async function listAll(
		params: Omit<calendar_v3.Params$Resource$Events$List, 'calendarId'>,
	) {
		const items: calendar_v3.Schema$Event[] = [];
		let pageToken: string | undefined;
		do {
			const { data } = await client.events.list({
				calendarId,
				maxResults: 250,
				...params,
				pageToken,
			});
			items.push(...(data.items ?? []));
			pageToken = data.nextPageToken ?? undefined;
		} while (pageToken);
		return items;
	}

	async function nextEvent(seriesId: string, now: DateTime) {
		const { data } = await client.events.instances({
			calendarId,
			eventId: seriesId,
			timeMin: iso(now),
			maxResults: 1,
		});
		const first = (data.items ?? []).find(
			(item) => item.status !== 'cancelled',
		);
		return first ? timed(first) : null;
	}

	async function toSeries(
		event: calendar_v3.Schema$Event,
		next: Series['nextEvent'],
	): Promise<Series | null> {
		const start = fromEventDateTime(event.start);
		const end = fromEventDateTime(event.end);
		if (!event.id || !event.etag || !start || !end || !start.date) return null;
		const recurrence = parseRecurrence(event.recurrence ?? []);
		const description = event.description ?? '';
		return {
			id: event.id,
			etag: event.etag,
			title: event.summary ?? '',
			description: looksLikeHtml(description)
				? await htmlToMarkdown(description)
				: description,
			joinLink: event.location ?? '',
			hostCode: hostCodeOf(event),
			recurrence,
			recurrenceText: describeRecurrence(recurrence),
			date: start.date,
			startTime: start.time,
			endTime: end.time,
			nextEvent: next,
			htmlLink: event.htmlLink ?? null,
		};
	}

	/**
	 * Every Series with an Event still to come. `timeMin` on a non-expanded
	 * list is against the Series' last Event, so ended ones drop out here.
	 */
	async function listSeries(): Promise<Series[]> {
		const now = DateTime.now().setZone(DISPLAY_ZONE);
		const parents = (
			await listAll({ singleEvents: false, timeMin: iso(now) })
		).filter(
			(event) =>
				event.status !== 'cancelled' && (event.recurrence ?? []).length > 0,
		);
		const series = await Promise.all(
			parents.map(async (event) =>
				toSeries(event, await nextEvent(event.id ?? '', now)),
			),
		);
		return series
			.filter((entry): entry is Series => entry !== null)
			.sort((a, b) => a.title.localeCompare(b.title));
	}

	async function getSeries(id: string): Promise<Series | null> {
		const { data } = await client.events.get({ calendarId, eventId: id });
		if (data.status === 'cancelled' || !(data.recurrence ?? []).length) {
			return null;
		}
		return toSeries(
			data,
			await nextEvent(id, DateTime.now().setZone(DISPLAY_ZONE)),
		);
	}

	/**
	 * Google's items as Events, cancelled ones included. A cancelled Event of a
	 * Series is only guaranteed its id, its Series and its original start; the
	 * rest is filled from the Series, fetched once per Series.
	 */
	async function toAdminEvents(
		items: calendar_v3.Schema$Event[],
	): Promise<AdminEvent[]> {
		const parents = new Map<string, Promise<calendar_v3.Schema$Event>>();
		const parent = (id: string) => {
			let pending = parents.get(id);
			if (!pending) {
				pending = client.events
					.get({ calendarId, eventId: id })
					.then((response) => response.data);
				parents.set(id, pending);
			}
			return pending;
		};

		const events = await Promise.all(
			items.map(async (item): Promise<AdminEvent | null> => {
				if (!item.id || !item.etag || isTombstone(item)) return null;
				const cancelled = item.status === 'cancelled';
				const seriesId = item.recurringEventId ?? null;
				const originalStart = item.originalStartTime?.dateTime ?? null;
				const from =
					cancelled && seriesId && (!item.summary || !timed(item))
						? await parent(seriesId)
						: null;
				const when =
					timed(item) ??
					(originalStart && from
						? {
								start: originalStart,
								end: iso(
									DateTime.fromISO(originalStart, { setZone: true }).plus(
										duration(from),
									),
								),
							}
						: null);
				if (!when) return null;
				return {
					id: item.id,
					etag: item.etag,
					title: item.summary ?? from?.summary ?? '',
					start: when.start,
					end: when.end,
					status: cancelled ? 'cancelled' : 'confirmed',
					seriesId,
					rescheduled: !cancelled && moved(originalStart, when.start),
					originalStart,
					joinLink: item.location ?? from?.location ?? '',
					htmlLink: item.htmlLink ?? null,
				};
			}),
		);
		return events
			.filter((entry): entry is AdminEvent => entry !== null)
			.sort((a, b) => a.start.localeCompare(b.start));
	}

	/** The next `days` of Events in start order, cancelled ones included. */
	async function listUpcomingEvents({
		days,
	}: {
		days: number;
	}): Promise<AdminEvent[]> {
		const now = DateTime.now().setZone(DISPLAY_ZONE);
		return toAdminEvents(
			await listAll({
				singleEvents: true,
				showDeleted: true,
				orderBy: 'startTime',
				timeZone: DISPLAY_ZONE,
				timeMin: iso(now.startOf('day')),
				timeMax: iso(now.startOf('day').plus({ days })),
			}),
		);
	}

	/**
	 * The next `months` of one Series' Events, cancelled ones included, for the
	 * Series page. Bounded because a Series that never ends never runs out of
	 * pages; Google returns at most 250 an instances call.
	 */
	async function listSeriesEvents(
		seriesId: string,
		{ months }: { months: number },
	): Promise<AdminEvent[]> {
		const now = DateTime.now().setZone(DISPLAY_ZONE);
		const items: calendar_v3.Schema$Event[] = [];
		let pageToken: string | undefined;
		do {
			const { data } = await client.events.instances({
				calendarId,
				eventId: seriesId,
				showDeleted: true,
				timeZone: DISPLAY_ZONE,
				timeMin: iso(now),
				timeMax: iso(now.plus({ months })),
				maxResults: 250,
				pageToken,
			});
			items.push(...(data.items ?? []));
			pageToken = data.nextPageToken ?? undefined;
		} while (pageToken);
		return toAdminEvents(items);
	}

	function body(input: EventInput | SeriesInput): calendar_v3.Schema$Event {
		return {
			summary: input.title,
			description: input.description,
			location: input.joinLink,
			start: toEventDateTime(input.date, input.startTime),
			end: toEventDateTime(input.date, input.endTime),
		};
	}

	async function patch(
		eventId: string,
		etag: string,
		requestBody: calendar_v3.Schema$Event,
	) {
		try {
			return await client.events.patch(
				{ calendarId, eventId, sendUpdates: 'none', requestBody },
				{ headers: { 'If-Match': etag } },
			);
		} catch (error) {
			if (isConflict(error)) throw new CalendarConflictError();
			throw error;
		}
	}

	/** The event as it is now, or a conflict if it is not what was loaded. */
	async function current(eventId: string, etag: string) {
		const { data } = await client.events.get({ calendarId, eventId });
		if (data.etag !== etag) throw new CalendarConflictError();
		return data;
	}

	async function createSeries(input: SeriesInput): Promise<string> {
		const { data } = await client.events.insert({
			calendarId,
			sendUpdates: 'none',
			requestBody: {
				...body(input),
				...withHostCode(null, input.hostCode),
				recurrence: [serializeRecurrence(input.recurrence)],
			},
		});
		return data.id ?? '';
	}

	/** Every Event of the Series, past ones included; Google keeps exceptions. */
	async function updateSeries(
		id: string,
		etag: string,
		input: SeriesUpdate,
	): Promise<void> {
		const existing = await current(id, etag);
		await patch(id, etag, {
			...body(input),
			...withHostCode(existing, input.hostCode),
			...(input.recurrence
				? {
						recurrence: withRule(
							existing.recurrence,
							serializeRecurrence(input.recurrence),
						),
					}
				: {}),
		});
	}

	/**
	 * No further Events. A Series that has already run keeps its past Events
	 * and gets `UNTIL` now; one that never ran is deleted outright.
	 */
	async function endSeries(
		id: string,
		etag: string,
	): Promise<'ended' | 'deleted'> {
		const now = DateTime.now().setZone(DISPLAY_ZONE);
		const existing = await current(id, etag);
		const { data: past } = await client.events.instances({
			calendarId,
			eventId: id,
			timeMax: iso(now),
			maxResults: 1,
		});
		if (!(past.items ?? []).length) {
			try {
				await client.events.delete(
					{ calendarId, eventId: id, sendUpdates: 'none' },
					{ headers: { 'If-Match': etag } },
				);
			} catch (error) {
				if (isConflict(error)) throw new CalendarConflictError();
				throw error;
			}
			return 'deleted';
		}
		const rule = (existing.recurrence ?? []).find((line) =>
			line.startsWith('RRULE:'),
		);
		if (!rule) throw new Error(`Series ${id} has no RRULE line`);
		await patch(id, etag, {
			recurrence: withRule(existing.recurrence, endedRule(rule, now)),
		});
		return 'ended';
	}

	async function createEvent(input: EventInput): Promise<string> {
		const { data } = await client.events.insert({
			calendarId,
			sendUpdates: 'none',
			requestBody: { ...body(input), ...withHostCode(null, input.hostCode) },
		});
		return data.id ?? '';
	}

	async function cancelEvent(id: string, etag: string): Promise<void> {
		await patch(id, etag, { status: 'cancelled' });
	}

	/**
	 * Takes back a Cancel and a Reschedule alike: the Event happens, at the
	 * time its Series' rule gives it (with the Series' duration — a Reschedule
	 * may have changed that too).
	 */
	async function restoreEvent(id: string, etag: string): Promise<void> {
		const existing = await current(id, etag);
		const originalStart = existing.originalStartTime?.dateTime ?? null;
		const start = existing.start?.dateTime;
		if (
			!originalStart ||
			!start ||
			!existing.recurringEventId ||
			!moved(originalStart, start)
		) {
			await patch(id, etag, { status: 'confirmed' });
			return;
		}
		const { data: series } = await client.events.get({
			calendarId,
			eventId: existing.recurringEventId,
		});
		const at = DateTime.fromISO(originalStart, { setZone: true });
		await patch(id, etag, {
			status: 'confirmed',
			start: { dateTime: iso(at), timeZone: DISPLAY_ZONE },
			end: { dateTime: iso(at.plus(duration(series))), timeZone: DISPLAY_ZONE },
		});
	}

	async function rescheduleEvent(
		id: string,
		etag: string,
		when: TimeInput,
	): Promise<void> {
		await patch(id, etag, {
			start: toEventDateTime(when.date, when.startTime),
			end: toEventDateTime(when.date, when.endTime),
		});
	}

	return {
		listSeries,
		getSeries,
		listUpcomingEvents,
		listSeriesEvents,
		createSeries,
		updateSeries,
		endSeries,
		createEvent,
		cancelEvent,
		restoreEvent,
		rescheduleEvent,
	};
}

export type EventsCalendar = ReturnType<typeof eventsCalendar>;

/** The real calendar, or null when the env vars that name it are missing. */
export function connectEventsCalendar(): EventsCalendar | null {
	const calendarId = process.env.GOOGLE_CALENDAR_ID;
	if (!process.env.GOOGLE_SERVICE_ACCOUNT_KEY || !calendarId) return null;
	return eventsCalendar(createCalendarClient(), calendarId);
}
