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

const SLACK_EVENT_ADMIN_CHANNEL =
	process.env.TEST_SLACK_EVENT_ADMIN_CHANNEL ||
	requireEnv('SLACK_EVENT_ADMIN_CHANNEL');

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
					id
					eventSlackAnnouncementsChannelId
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
		.plus({ hours: 1 })
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
			// filter out past events
			const now = DateTime.now();
			const filteredList = eventsList.filter((event) => {
				return now < DateTime.fromISO(event.startDateLocalized);
			});

			if (filteredList.length) {
				const hourlyMessages = filteredList.map((event) => {
					const eventDate = DateTime.fromISO(event.startDateLocalized);

					const blocks: Record<string, unknown>[] = [
						{
							type: 'header',
							text: {
								type: 'plain_text',
								text: '⏰ Starting Soon:',
								emoji: true,
							},
						},
					];

					const titleBlock: Record<string, unknown> = {
						type: 'section',
						text: {
							type: 'mrkdwn',
							text: `*${
								event.title
							}*\n<!date^${eventDate.toSeconds()}^{date_long_pretty} {time}|${eventDate.toFormat(
								'EEEE, fff',
							)}>`,
						},
					};

					if (
						event.eventJoinLink &&
						event.eventJoinLink.substring(0, 4) === 'http'
					) {
						titleBlock.accessory = {
							type: 'button',
							text: {
								type: 'plain_text',
								text: 'Join Event',
								emoji: true,
							},
							value: `join_event_${event.id}`,
							url: event.eventJoinLink,
							action_id: 'button-join-event',
						};
					}

					blocks.push(titleBlock);

					if (
						event.eventJoinLink &&
						event.eventJoinLink.substring(0, 4) !== 'http'
					) {
						blocks.push({
							type: 'section',
							text: {
								type: 'mrkdwn',
								text: `*Location:* ${event.eventJoinLink}`,
							},
						});
					}

					blocks.push(
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
							type: 'divider',
						},
					);

					return {
						channel:
							event.eventSlackAnnouncementsChannelId ||
							DEFAULT_SLACK_EVENT_CHANNEL,
						text: `Starting soon: ${event.title}: ${eventDate.toFormat(
							'EEEE, fff',
						)}`,
						unfurl_links: false,
						unfurl_media: false,
						blocks,
					};
				});

				const hourlyAdminMessage = {
					channel: SLACK_EVENT_ADMIN_CHANNEL,
					text: `Starting soon: ${filteredList
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
								text: '⏰ Starting Soon:',
								emoji: true,
							},
						},
						...filteredList.reduce<Record<string, unknown>[]>((list, event) => {
							const eventDate = DateTime.fromISO(event.startDateLocalized);

							const titleBlock: Record<string, unknown> = {
								type: 'section',
								text: {
									type: 'mrkdwn',
									text: `*${
										event.title
									}*\n<!date^${eventDate.toSeconds()}^{date_long_pretty} {time}|${eventDate.toFormat(
										'EEEE, fff',
									)}>`,
								},
							};

							if (
								event.eventJoinLink &&
								event.eventJoinLink.substring(0, 4) === 'http'
							) {
								titleBlock.accessory = {
									type: 'button',
									text: {
										type: 'plain_text',
										text: 'Join Event',
										emoji: true,
									},
									value: `join_event_${event.id}`,
									url: event.eventJoinLink,
									action_id: 'button-join-event',
								};
							}

							return [
								...list,
								titleBlock,
								{
									type: 'section',
									text: {
										type: 'mrkdwn',
										text: `*Location:* ${event.eventJoinLink}`,
									},
								},
								...(event.eventZoomHostCode
									? [
											{
												type: 'section',
												text: {
													type: 'mrkdwn',
													text: `*Host Code:* ${event.eventZoomHostCode}`,
												},
											},
										]
									: []),
								{
									type: 'section',
									text: {
										type: 'mrkdwn',
										text: `*Announcement posted to:* <#${
											event.eventSlackAnnouncementsChannelId ||
											DEFAULT_SLACK_EVENT_CHANNEL
										}>`,
									},
								},
								{
									type: 'divider',
								},
							];
						}, []),
					],
				};

				await postMessage(hourlyAdminMessage);

				await Promise.all(
					hourlyMessages.map((message) => postMessage(message)),
				);
			}
		}
		return new Response(null, { status: 200 });
	} catch (e) {
		console.error(e);
		return new Response(null, { status: 500 });
	}
};

export const config: Config = {
	schedule: '50 * * * *',
};
