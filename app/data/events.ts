// import { GraphQLClient gql } from 'graphql-request';
import { DateTime } from 'luxon';
import { sanitizeHtml } from '~/util/sanitizeCmsData';
import { ics } from 'calendar-link';
import axios from 'axios';

// const calendarsQuery = `query getCalendars {
// 		solspace_calendar {
// 			calendars {
// 				handle
// 			}
// 		}
// 	}`;

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
	eventStartUTC: string;
	eventEndUTC: string;
	eventCalendarLink: string;
}
export interface EventsResponse extends Array<EventItem> {}

function createEventsQuery(
	calendars: SolspaceCalendar[],
	rangeStart: string,
	rangeEnd: string,
	limit: number,
) {
	return `
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

	// const instance = axios.create({
	// 	baseURL: `${process.env.CMS_URL}/api`,
	// });

	// const graphQLClient = new GraphQLClient(`${process.env.CMS_URL}/api`, {
	// 	headers: {
	// 		Authorization: `bearer ${process.env.CMS_TOKEN}`,
	// 	},
	// });

	console.log('Fetching events', rangeStart, rangeEnd);

	try {
		console.log('requesting calendars');
		const calendarsResponse = await axios.request({
			method: 'POST',
			data: `query getCalendars {
					solspace_calendar {
						calendars {
							handle
						}
					}
				}`,

			url: `${process.env.CMS_URL}/api`,
			timeout: 4000,
			headers: {
				Authorization: `bearer ${process.env.CMS_TOKEN}`,
				'content-type': 'application/graphql',
			},
		});

		console.log(
			createEventsQuery(
				calendarsResponse.data.data.solspace_calendar.calendars,
				rangeStart,
				rangeEnd,
				limit,
			),
		);

		console.log('requesting events');
		const eventsResponse = await axios.request({
			method: 'POST',
			data: createEventsQuery(
				calendarsResponse.data.data.solspace_calendar.calendars,
				rangeStart,
				rangeEnd,
				limit,
			),
			url: `${process.env.CMS_URL}/api`,
			timeout: 4000,
			headers: {
				Authorization: `bearer ${process.env.CMS_TOKEN}`,
				'content-type': 'application/graphql',
			},
		});

		console.log(eventsResponse.data);

		// return response.slice(0, 10);
		console.log('parsing events');
		// console.log(eventsResponse);
		return await Promise.all(
			eventsResponse.data.data.solspace_calendar.events.map(
				async (event: SolspaceEventResponse) => {
					const sanitizedDescription = await sanitizeHtml(
						event.eventCalendarDescription,
					);
					const calendarLink = await ics({
						title: event.title,
						start: event.startDateLocalized,
						end: event.endDateLocalized,
						description: sanitizedDescription,
					});
					return {
						...event,
						eventStartUTC: DateTime.fromISO(event.startDateLocalized)
							.toUTC()
							.toString(),
						eventEndUTC: DateTime.fromISO(event.endDateLocalized)
							.toUTC()
							.toString(),
						eventCalendarDescription: sanitizedDescription,
						eventCalendarLink: calendarLink,
					};
				},
			),
		);
	} catch (e) {
		console.error(e);
		return [];
	}
}
