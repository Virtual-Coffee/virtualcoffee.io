const Cache = require('@11ty/eleventy-cache-assets');
const { GraphQLClient, gql } = require('graphql-request');
require('dotenv').config();
const { DateTime } = require('luxon');

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
	query getEvents($rangeStart: String!, $rangeEnd: String!) {
		solspace_calendar {
			events(rangeStart: $rangeStart, rangeEnd: $rangeEnd) {
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

module.exports = async function () {
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
			},
		);
		// return response.slice(0, 10);

		// console.log(eventsResponse);
		return eventsResponse.solspace_calendar.events;
	} catch (e) {
		console.error(e);
		return [];
	}
};
