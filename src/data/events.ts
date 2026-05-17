'use server';

import { unstable_cache } from 'next/cache';
import { DateTime } from 'luxon';
import { sanitizeHtml } from '@/util/sanitizeCmsData';
import { ics, google, outlook } from 'calendar-link';

export interface EventItem {
  id: string;
  title: string;
  startDateLocalized: string;
  endDateLocalized: string;
  eventCalendarDescription: string;
  eventCalendarLinks: {
    google: string;
    outlook: string;
    ics: string;
  };
}
export type EventsResponse = Array<EventItem>;

interface GoogleCalendarEvent {
  id: string;
  summary?: string;
  description?: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  status?: string;
}

interface GoogleCalendarResponse {
  items: GoogleCalendarEvent[];
}

async function fetchCalendarEvents(
  calendarId: string,
  apiKey: string,
  rangeStart: string,
  rangeEnd: string,
  limit: number,
): Promise<GoogleCalendarEvent[]> {
  const params = new URLSearchParams({
    key: apiKey,
    timeMin: rangeStart,
    timeMax: rangeEnd,
    maxResults: String(limit),
    singleEvents: 'true',
    orderBy: 'startTime',
  });

  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?${params}`;
  const res = await fetch(url, { next: { revalidate: 43200 } });

  if (!res.ok) {
    console.error(`Failed to fetch calendar ${calendarId}: ${res.status} ${res.statusText}`);
    return [];
  }

  const data: GoogleCalendarResponse = await res.json();
  return data.items ?? [];
}

export const getEvents = unstable_cache(
  async ({ limit }: { limit: number }): Promise<EventsResponse> => {
    const rangeStart = DateTime.now().toUTC().set({ hour: 0 }).toISO()!;
    const rangeEnd = DateTime.now()
      .toUTC()
      .set({ hour: 0 })
      .plus({ days: 30 })
      .toISO()!;

    const apiKey = process.env.GOOGLE_CALENDAR;
    const calendarIds = process.env.GOOGLE_CALENDAR_IDS;

    if (!apiKey || !calendarIds) {
      const fakeData = await import('./mocks/events');
      return fakeData.createEventsData({ limit, rangeEnd, rangeStart });
    }

    const ids = calendarIds.split(',').map((id) => id.trim()).filter(Boolean);

    try {
      const allEventsNested = await Promise.all(
        ids.map((calendarId) =>
          fetchCalendarEvents(calendarId, apiKey, rangeStart, rangeEnd, limit),
        ),
      );

      const allEvents = allEventsNested
        .flat()
        .filter((e) => e.status !== 'cancelled')
        .sort((a, b) => {
          const aStart = a.start.dateTime ?? a.start.date ?? '';
          const bStart = b.start.dateTime ?? b.start.date ?? '';
          return aStart.localeCompare(bStart);
        })
        .slice(0, limit);

      return await Promise.all(
        allEvents.map(async (event) => {
          const startDate = event.start.dateTime ?? event.start.date ?? '';
          const endDate = event.end.dateTime ?? event.end.date ?? '';
          const title = event.summary ?? 'Virtual Coffee Event';
          const rawDescription = event.description ?? '';

          const sanitizedDescription = await sanitizeHtml(rawDescription);

          const calendarLinkGoogle = google({
            title,
            start: startDate,
            end: endDate,
            description: sanitizedDescription,
          });
          const calendarLinkOutlook = outlook({
            title,
            start: startDate,
            end: endDate,
            description: sanitizedDescription,
          });
          const calendarLinkIcs = ics({
            title,
            start: startDate,
            end: endDate,
            description: sanitizedDescription,
          });

          return {
            id: event.id,
            title,
            startDateLocalized: startDate,
            endDateLocalized: endDate,
            eventCalendarDescription: sanitizedDescription,
            eventCalendarLinks: {
              google: calendarLinkGoogle,
              outlook: calendarLinkOutlook,
              ics: calendarLinkIcs,
            },
          };
        }),
      );
    } catch (e) {
      console.error(e);
      return [];
    }
  },
  [],
  { revalidate: 43200, tags: ['events'] },
);
