import { GraphQLClient, gql } from 'graphql-request';
import { DateTime } from 'luxon';
import { sanitizeHtml } from '~/util/sanitizeCmsData';

const calendarsQuery = gql`
	query getCalendars {
		solspace_calendar {
			calendars {
				handle
			}
		}
	}
`;

function createEventsQuery(calendars) {
	return gql`
	query getEvents($rangeStart: String!, $rangeEnd: String!, $limit: Int) {
		solspace_calendar {
			events(rangeStart: $rangeStart, rangeEnd: $rangeEnd, limit: $limit) {
				id
				title
				startDateLocalized
				endDateLocalized
				${calendars.solspace_calendar.calendars.map(
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

export async function getEvents({ limit }) {
	const graphQLClient = new GraphQLClient(`${process.env.CMS_URL}/api`, {
		headers: {
			Authorization: `bearer ${process.env.CMS_TOKEN}`,
		},
	});

	const rangeStart = DateTime.now().set({ hour: 0 }).toISO();
	const rangeEnd = DateTime.now().set({ hour: 0 }).plus({ days: 30 }).toISO();

	console.log('Fetching events', rangeStart, rangeEnd);

	try {
		const calendarsResponse = await graphQLClient.request(calendarsQuery);
		const eventsResponse = await graphQLClient.request(
			createEventsQuery(calendarsResponse),
			{
				rangeStart,
				rangeEnd,
				limit,
			},
		);
		// return response.slice(0, 10);

		// console.log(eventsResponse);
		return eventsResponse.solspace_calendar.events.map((event) => ({
			...event,
			eventCalendarDescription: sanitizeHtml(event.eventCalendarDescription),
		}));
	} catch (e) {
		console.error(e);
		return [];
	}
}
