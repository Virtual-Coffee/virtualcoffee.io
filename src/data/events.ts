'use server';

import { GraphQLClient, gql } from 'graphql-request';
import { DateTime } from 'luxon';
import { sanitizeHtml } from '@/util/sanitizeCmsData';
import { ics } from 'calendar-link';

const calendarsQuery = gql`
	query getCalendars {
		solspace_calendar {
			calendars {
				handle
			}
		}
	}
`;

/**
 * Defining the interface for the SolspaceCalendar object.
 * @link https://docs.solspace.com/craft/calendar/v3/developer/graphql.html#calendar-interface
 */
interface SolspaceCalendar {
	id: number;
	uid: string;
	name: string;
	handle: string;
	description: string;
	color: string;
	lighterColor: string;
	darkerColor: string;
	icsHash: string;
	allowRepeatingEvents: boolean;
}
interface SolspaceEventResponse {
	id: number | string;
	title: string;
	startDateLocalized: string;
	endDateLocalized: string;
	eventCalendarDescription: string;
}
export interface EventItem extends SolspaceEventResponse {
	eventCalendarLink: string;
}
export interface EventsResponse extends Array<EventItem> {}

function createEventsQuery(
	calendars: Pick<SolspaceCalendar, 'handle'>[],
	rangeStart: string,
	rangeEnd: string,
	limit: number,
) {
	return gql`
	query getEvents {
		solspace_calendar {
			events(rangeStart: "${rangeStart}", rangeEnd: "${rangeEnd}", limit: ${limit}) {
				id
				title
				startDateLocalized
				endDateLocalized
				${calendars.map(
					({ handle }) => `
				... on ${handle}_Event {
					eventCalendarDescription
					id
				}
				`,
				)}
			}
		}
	}
`;
}

export async function getEvents({
	limit,
}: {
	limit: number;
}): Promise<EventsResponse> {
	const rangeStart = DateTime.now().toUTC().set({ hour: 0 }).toISO();
	const rangeEnd = DateTime.now()
		.toUTC()
		.set({ hour: 0 })
		.plus({ days: 30 })
		.toISO();

	if (!(process.env.CMS_URL && process.env.CMS_TOKEN)) {
		const fakeData = await import('./mocks/events');
		return fakeData.createEventsData({ limit, rangeEnd, rangeStart });
	}

	const graphQLClient = new GraphQLClient(`${process.env.CMS_URL}/api`, {
		headers: {
			Authorization: `bearer ${process.env.CMS_TOKEN}`,
		},
	});

	try {
		const {
			solspace_calendar: { calendars },
		} = await graphQLClient.request<{
			solspace_calendar: { calendars: Pick<SolspaceCalendar, 'handle'>[] };
		}>(calendarsQuery);

		const {
			solspace_calendar: { events },
		} = await graphQLClient.request<{
			solspace_calendar: { events: EventsResponse };
		}>(createEventsQuery(calendars, rangeStart, rangeEnd, limit));

		return await Promise.all(
			events.map(async (event) => {
				const sanitizedDescription = await sanitizeHtml(
					event.eventCalendarDescription,
				);
				const calendarLink = ics({
					title: event.title,
					start: event.startDateLocalized,
					end: event.endDateLocalized,
					description: sanitizedDescription,
				});
				return {
					...event,
					eventCalendarDescription: sanitizedDescription,
					eventCalendarLink: calendarLink,
				};
			}),
		);
	} catch (e) {
		console.error(e);
		return [];
	}
}
