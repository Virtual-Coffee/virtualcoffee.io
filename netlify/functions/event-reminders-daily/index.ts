import { GraphQLClient, gql } from 'graphql-request';
import { DateTime } from 'luxon';
import { postMessage } from '../_shared/slack';
import slackify from 'slackify-html';
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

	const rangeStart = DateTime.now().setZone('America/New_York').toISO();
	const rangeEnd = DateTime.now()
		.setZone('America/New_York')
		.plus({ days: 1 })
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
			const dayCheck = new Date();
			if (dayCheck.getDay() === 1) {
				// don't run this one on monday, since the weekly one runs on monday
				return;
			}

			const dailyMessage = {
				channel: SLACK_ANNOUNCEMENTS_CHANNEL,
				text: `Today's events are: ${eventsList
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
							text: "📆 Today's Events Are:",
							emoji: true,
						},
					},
					...eventsList.reduce<Record<string, unknown>[]>((list, event) => {
						const eventDate = DateTime.fromISO(event.startDateLocalized);
						return [
							...list,
							{
								type: 'section',
								text: {
									type: 'mrkdwn',
									text: `*${
										event.title
									}*\n<!date^${eventDate.toSeconds()}^{date_long_pretty} {time}|${eventDate.toFormat(
										'EEEE, fff',
									)}>`,
								},
							},
							{
								type: 'context',
								elements: [
									{
										type: 'mrkdwn',
										text: slackify(event.eventCalendarDescription),
									},
								],
							},
							{
								type: 'context',
								elements: [
									{
										type: 'mrkdwn',
										text: `ℹ️ Link to join will be posted in <#${
											event.eventSlackAnnouncementsChannelId ||
											DEFAULT_SLACK_EVENT_CHANNEL
										}> about 10 minutes before the event starts.`,
									},
								],
							},
							{
								type: 'divider',
							},
						];
					}, []),
				],
			};

			await postMessage(dailyMessage);
		}

		return new Response(null, { status: 200 });
	} catch (e) {
		console.error(e);
		return new Response(null, { status: 500 });
	}
};

export const config: Config = {
	schedule: '0 12 * * *',
};
