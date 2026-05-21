import { GraphQLClient, gql } from 'graphql-request';
import { DateTime } from 'luxon';
import { postMessage } from '../_shared/slack';
import { requireEnv } from '../_shared/env';
import type { Config } from '@netlify/functions';
import type { CalendarsResponse, EventsResponse } from '../_shared/types/cms';

const SLACK_ANNOUNCEMENTS_CHANNEL =
	process.env.TEST_SLACK_ANNOUNCEMENTS_CHANNEL ||
	requireEnv('SLACK_ANNOUNCEMENTS_CHANNEL');

const DEFAULT_SLACK_EVENT_CHANNEL = 'C017WAKN883';

const calendarsQuery = gql`
	query getCalendars {
		solspace_calendar {
			calendars {
				handle
			}
		}
	}
`;

function createEventsQuery(calendars: CalendarsResponse) {
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
					eventJoinLink
					eventZoomHostCode
					eventSlackAnnouncementsChannelId
					id
				}
				`,
				)}
			}
		}
	}
`;
}

export default async (req: Request) => {
	const graphQLClient = new GraphQLClient(`${process.env.CMS_URL}/api`, {
		headers: {
			Authorization: `bearer ${process.env.CMS_TOKEN}`,
		},
	});

	const rangeStart = DateTime.now()
		.setZone('America/New_York')
		.set({ hour: 0 })
		.toISO();
	const rangeEnd = DateTime.now()
		.setZone('America/New_York')
		.plus({ weeks: 1 })
		.toISO();

	console.log('Fetching events', rangeStart, rangeEnd);

	try {
		const calendarsResponse =
			await graphQLClient.request<CalendarsResponse>(calendarsQuery);

		const eventsResponse = await graphQLClient.request<EventsResponse>(
			createEventsQuery(calendarsResponse),
			{
				rangeStart,
				rangeEnd,
			},
		);

		const eventsList = eventsResponse.solspace_calendar.events;
		if (eventsList && eventsList.length) {
			const weeklyMessage = {
				channel: SLACK_ANNOUNCEMENTS_CHANNEL,
				text: `This weeks events are: ${eventsList
					.map((event) => {
						return `${event.title}: ${DateTime.fromISO(
							event.startDateLocalized,
						).toFormat('EEEE, fff')}`;
					})
					.join(', ')}`,
				unfurl_links: false,
				unfurl_media: false,
				blocks: [
					{
						type: 'header' as const,
						text: {
							type: 'plain_text' as const,
							text: "📆 This Week's Events Are:",
							emoji: true,
						},
					},
					...eventsList.map((event) => {
						const eventDate = DateTime.fromISO(event.startDateLocalized);
						// TODO - colate these by date
						return {
							type: 'section' as const,
							text: {
								type: 'mrkdwn' as const,
								text: `*<!date^${eventDate.toSeconds()}^{date_long_pretty} {time}|${eventDate.toFormat(
									'EEEE, fff',
								)}>* in <#${
									event.eventSlackAnnouncementsChannelId ||
									DEFAULT_SLACK_EVENT_CHANNEL
								}>\n${event.title}`,
							},
						};
					}),
					{
						type: 'context' as const,
						elements: [
							{
								type: 'mrkdwn' as const,
								text: `ℹ️ Links to join will be posted in the specified channel about 10 minutes before the event starts.`,
							},
						],
					},
					{
						type: 'divider' as const,
					},
					{
						type: 'context' as const,
						elements: [
							{
								type: 'mrkdwn' as const,
								text: `See details and more events at <https://virtualcoffee.io/events|VirtualCoffee.IO>!`,
							},
						],
					},
				],
			};

			await postMessage(weeklyMessage);
		}
		return new Response(null, { status: 200 });
	} catch (e) {
		console.error(e);
		return new Response(null, { status: 500 });
	}
};

export const config: Config = {
	schedule: '0 12 * * 1',
};
