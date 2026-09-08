'use server';

import { unstable_cache } from 'next/cache';
import { calendar, auth, type calendar_v3 } from '@googleapis/calendar';
import { DateTime } from 'luxon';
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

const SCOPES = ['https://www.googleapis.com/auth/calendar.events.readonly'];
// Matches the zone that `dateForDisplay` renders in (src/util/date.ts).
const DISPLAY_ZONE = 'America/New_York';

/**
 * Builds an authenticated Calendar client from `GOOGLE_SERVICE_ACCOUNT_KEY`,
 * which holds the raw contents of a service account key file. Both failure
 * modes — unparseable JSON and a key missing the fields the auth call needs —
 * throw here with the fix in the message, because the alternative is an opaque
 * auth error much later in the request.
 */
function createCalendarClient(): calendar_v3.Calendar {
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
function normalizeDescription(raw: string): string {
	if (/<[a-z][\s\S]*>/i.test(raw)) return raw;
	return raw.replace(/\r?\n/g, '<br />');
}

/**
 * Upcoming events for the next 30 days, in start order. Recurring events are
 * expanded into their individual instances; cancelled entries and all-day
 * events are dropped, the latter because the UI always shows a clock time.
 * Without Google credentials this returns mock data, and a failed fetch
 * rethrows wherever mocks are disallowed (production) so a broken build fails
 * loudly instead of shipping an empty events page.
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
			const client = createCalendarClient();
			const { data } = await client.events.list({
				calendarId: process.env.GOOGLE_CALENDAR_ID,
				timeMin: rangeStart,
				timeMax: rangeEnd,
				// Expand recurring events into individual instances (required for orderBy: startTime).
				singleEvents: true,
				orderBy: 'startTime',
				maxResults: limit,
				timeZone: DISPLAY_ZONE,
			});

			const items = (data.items ?? []).filter(
				(
					event,
				): event is calendar_v3.Schema$Event & {
					id: string;
					start: { dateTime: string };
					end: { dateTime: string };
				} =>
					event.status !== 'cancelled' &&
					typeof event.id === 'string' &&
					// All-day events only have `start.date`; the UI shows clock times, so skip them.
					typeof event.start?.dateTime === 'string' &&
					typeof event.end?.dateTime === 'string',
			);

			return await Promise.all(
				items.map(async (event) => {
					const title = event.summary ?? '';
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
