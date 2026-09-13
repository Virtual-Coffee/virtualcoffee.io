import { unstable_cache } from 'next/cache';
import { calendar, auth, type calendar_v3 } from '@googleapis/calendar';
import { DateTime } from 'luxon';
import { DISPLAY_ZONE } from '@/util/date';
import { sanitizeHtml } from '@/util/sanitizeCmsData';
import { assertMocksAllowed, mocksAllowed } from './mocks';
import { ics, google, outlook } from 'calendar-link';

export interface EventItem {
	/** Google event id. Instances of a recurring event get unique ids. */
	id: string;
	title: string;
	/** ISO 8601 with offset (from `start.dateTime`). */
	start: string;
	/** ISO 8601 with offset (from `end.dateTime`). */
	end: string;
	/** Sanitized HTML. */
	description: string;
	/** Link to the event on Google Calendar. */
	htmlLink?: string;
	calendarLinks: {
		google: string;
		outlook: string;
		ics: string;
	};
}
export type EventsResponse = Array<EventItem>;

// Read and write: the same client serves /admin/events (docs/adr/0014).
const SCOPES = ['https://www.googleapis.com/auth/calendar.events'];

/**
 * Builds an authenticated Calendar client from `GOOGLE_SERVICE_ACCOUNT_KEY`,
 * which holds the raw contents of a service account key file. Both failure
 * modes — unparseable JSON and a key missing the fields the auth call needs —
 * throw here with the fix in the message, because the alternative is an opaque
 * auth error much later in the request.
 */
export function createCalendarClient(): calendar_v3.Calendar {
	let credentials: { client_email?: string; private_key?: string };
	try {
		credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY ?? '');
	} catch {
		throw new Error(
			'GOOGLE_SERVICE_ACCOUNT_KEY is not valid JSON. Paste the contents of the service account key file.',
		);
	}
	if (!credentials.client_email || !credentials.private_key) {
		throw new Error(
			'GOOGLE_SERVICE_ACCOUNT_KEY is missing `client_email` or `private_key`.',
		);
	}

	return calendar({
		version: 'v3',
		auth: new auth.GoogleAuth({
			credentials: {
				client_email: credentials.client_email,
				private_key: credentials.private_key,
			},
			scopes: SCOPES,
		}),
	});
}

/**
 * Google returns descriptions as HTML: text is already entity-encoded
 * (`&#39;`, `&quot;`, `&amp;`) whether or not it contains tags, so it must not
 * be escaped again. Tag-free descriptions use newlines for paragraph breaks,
 * which would collapse into a single line, so turn those into `<br />`.
 * `sanitizeHtml` handles anything unsafe either way.
 */
export function normalizeDescription(raw: string): string {
	if (/<[a-z][\s\S]*>/i.test(raw)) return raw;
	return raw.replace(/\r?\n/g, '<br />');
}

/** A calendar entry with everything the events UI renders. */
export type DisplayableEvent = calendar_v3.Schema$Event & {
	id: string;
	summary: string;
	start: { dateTime: string };
	end: { dateTime: string };
};

/**
 * Whether an entry can be shown at all. Cancelled entries and anything without
 * an id are out; so are all-day events (only `start.date`, but the UI always
 * shows a clock time) and untitled ones, which would render as an empty heading.
 */
export function isDisplayableEvent(
	event: calendar_v3.Schema$Event,
): event is DisplayableEvent {
	return (
		event.status !== 'cancelled' &&
		typeof event.id === 'string' &&
		typeof event.summary === 'string' &&
		event.summary.trim() !== '' &&
		typeof event.start?.dateTime === 'string' &&
		typeof event.end?.dateTime === 'string'
	);
}

/** The one call `listDisplayableEvents` makes, so tests can hand it a stub. */
export interface CalendarEventsClient {
	events: {
		list(
			params: calendar_v3.Params$Resource$Events$List,
		): Promise<{ data: calendar_v3.Schema$Events }>;
	};
}

/**
 * The first `limit` displayable events in the window, in start order.
 * Recurring events are expanded into their individual instances. Pages are
 * followed until `limit` is met or the window runs out: Google may return a
 * page shorter than `maxResults` even when more events match, and the filter
 * runs after the fetch, so a single page of `limit` is not enough.
 */
export async function listDisplayableEvents(
	client: CalendarEventsClient,
	{
		calendarId,
		timeMin,
		timeMax,
		limit,
	}: { calendarId: string; timeMin: string; timeMax: string; limit: number },
): Promise<DisplayableEvent[]> {
	const events: DisplayableEvent[] = [];
	let pageToken: string | undefined;

	do {
		const { data } = await client.events.list({
			calendarId,
			timeMin,
			timeMax,
			singleEvents: true,
			orderBy: 'startTime',
			timeZone: DISPLAY_ZONE,
			pageToken,
		});
		events.push(...(data.items ?? []).filter(isDisplayableEvent));
		pageToken = data.nextPageToken ?? undefined;
	} while (pageToken && events.length < limit);

	return events.slice(0, limit);
}

/**
 * Upcoming events for the next 30 days, in start order, filtered by
 * `isDisplayableEvent`. Without Google credentials this returns mock data, and
 * a failed fetch rethrows wherever mocks are disallowed (production) so a
 * broken build fails loudly instead of shipping an empty events page.
 */
export const getEvents = unstable_cache(
	async ({ limit }: { limit: number }): Promise<EventsResponse> => {
		// `timeMax` is an exclusive upper bound on an event's start time, so the
		// window has to run from local midnight in the zone the UI renders in.
		// Truncating in UTC instead would cut off the final local day.
		const now = DateTime.now().setZone(DISPLAY_ZONE);
		if (!now.isValid) {
			throw new Error(`Invalid time zone: ${DISPLAY_ZONE}`);
		}
		const displayRangeStart = now.startOf('day');
		const rangeStart = displayRangeStart.toUTC().toISO();
		// Calendar days, so the window survives the DST change.
		const rangeEnd = displayRangeStart.plus({ days: 30 }).toUTC().toISO();

		if (!(
			process.env.GOOGLE_SERVICE_ACCOUNT_KEY && process.env.GOOGLE_CALENDAR_ID
		)) {
			assertMocksAllowed('calendar events');
			const fakeData = await import('./mocks/events');
			return fakeData.createEventsData({ limit, rangeEnd, rangeStart });
		}

		try {
			const items = await listDisplayableEvents(createCalendarClient(), {
				calendarId: process.env.GOOGLE_CALENDAR_ID,
				timeMin: rangeStart,
				timeMax: rangeEnd,
				limit,
			});

			return await Promise.all(
				items.map(async (event) => {
					const title = event.summary;
					const start = event.start.dateTime;
					const end = event.end.dateTime;
					const description = await sanitizeHtml(
						normalizeDescription(event.description ?? ''),
					);
					const linkDetails = { title, start, end, description };

					return {
						id: event.id,
						title,
						start,
						end,
						description,
						htmlLink: event.htmlLink ?? undefined,
						calendarLinks: {
							google: google(linkDetails),
							outlook: outlook(linkDetails),
							ics: ics(linkDetails),
						},
					};
				}),
			);
		} catch (e) {
			console.error(e);
			// A production build that can't reach Google Calendar should fail rather
			// than silently render an empty events list.
			if (!mocksAllowed()) throw e;
			return [];
		}
	},
	[],
	{ revalidate: 43200, tags: ['events'] },
);
