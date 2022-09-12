import { GraphQLClient, gql } from 'graphql-request';
import { getUser } from '~/auth/auth.server';
import { DateTime } from 'luxon';
import { CmsError } from '~/api/util';
import type {
	CalendarVisibility,
	Event,
	SafeEvent,
	Calendar,
	User,
	EventLoaderData,
} from './types';
import { ics } from 'calendar-link';
import { sanitizeHtml } from '~/util/sanitizeCmsData';

export function getIcsLink(event: Event) {
	return ics({
		title: event.title,
		start: event.startDateLocalized,
		end: event.endDateLocalized,
		description: event.eventCalendarDescription,
	});
}

export class CmsActions {
	client: GraphQLClient;
	constructor() {
		if (!process.env.CMS_URL || !process.env.CMS_TOKEN) {
			throw new CmsError('Missing API credentials');
		} else {
			this.client = new GraphQLClient(`${process.env.CMS_URL}/api`, {
				headers: {
					Authorization: `bearer ${process.env.CMS_TOKEN}`,
				},
			});
		}
	}

	async enhanceEvent(event: Event): Promise<Event> {
		event.eventCalendarDescription = await sanitizeHtml(
			event.eventCalendarDescription,
		);

		return { ...event, eventIcsLink: getIcsLink(event) };
	}

	async authenticate(request: Request) {
		let user = await getUser(request);
		if (!user) {
			throw new CmsError('User not found');
		}
		this.client.setHeader('Authorization', `JWT ${user.jwt}`);
	}

	async getCalendarEntryByCalendarId({ id }: { id: string | number }): Promise<{
		id: number;
		title: string;
		calendarVisibility: CalendarVisibility;
	}> {
		const query = gql`
			query GetUpcomingEvent($id: [QueryArgument]) {
				entry(calendar: $id, section: "calendars") {
					... on calendars_default_Entry {
						id
						title
						calendarVisibility
					}
				}
			}
		`;

		const response = await this.client.request(query, {
			id,
		});

		if (!response?.entry) {
			throw new CmsError(
				'There was an error fetching the calendar entry.',
				response,
			);
		}

		return response.entry;
	}

	async getCalendars(): Promise<
		{
			handle: string;
			name: string;
			icsHash: string;
		}[]
	> {
		const query = `query getCalendars {
			solspace_calendar {
				calendars {
					handle
					name
					icsHash
				}
			}
		}
		`;

		const response = await this.client.request(query);

		if (!response?.solspace_calendar?.calendars?.length) {
			throw new CmsError('There was an error fetching the event.', response);
		}

		return response.solspace_calendar.calendars;
	}

	async getAllCalendarHandles(): Promise<string[]> {
		const calendars = await this.getCalendars();

		if (!calendars?.length) {
			throw new CmsError('There was an error fetching the event.');
		}

		return calendars.map((c) => c.handle);
	}

	async getEventByUid({ uid }: { uid: string }): Promise<Event> {
		const calendarHandles = await this.getAllCalendarHandles();

		// event gets one event. if it is a recurring event, it will get the first one in the range.
		const query = gql`
			query GetUpcomingEvent(
				$rangeStart: String!
				$rangeEnd: String!
				$uid: [String]
			) {
				solspace_calendar {
					event(
						uid: $uid
						loadOccurrences: true
						rangeStart: $rangeStart
						rangeEnd: $rangeEnd
					) {
						id
						uid
						calendarId
						title
						rrule
						startDateLocalized
						endDateLocalized
						${calendarHandles.map(
							(handle) => `
						... on ${handle}_Event {
							eventVisibility
							eventJoinLink
							eventLink
							eventCalendarDescription
						}`,
						)}
					}
				}
			}
		`;

		//
		const rangeStart = DateTime.now().minus({ hours: 12 }).toISO();
		const rangeEnd = DateTime.now().plus({ hours: 12 }).toISO();

		const response = await this.client.request(query, {
			uid,
			rangeStart,
			rangeEnd,
		});

		if (!response?.solspace_calendar) {
			throw new CmsError('There was an error fetching the event.', response);
		}

		return await this.enhanceEvent(response.solspace_calendar.event);
	}

	async getEventsInRange({
		rangeStart: specifiedRangeStart,
		rangeEnd: specifiedRangeEnd,
		calendars,
		limit,
	}: {
		rangeStart?: string;
		rangeEnd?: string;
		calendars?: string[];
		limit?: number;
	}): Promise<Event[]> {
		let calendarHandles = calendars || (await this.getAllCalendarHandles());

		// event gets one event. if it is a recurring event, it will get the first one in the range.
		const query = gql`
			query GetUpcomingEvents(
				$rangeStart: String!
				$rangeEnd: String!
				$limit:Int
			) {
				solspace_calendar {
					events(
						loadOccurrences: true
						rangeStart: $rangeStart
						rangeEnd: $rangeEnd
						limit: $limit
					) {
						id
						uid
						calendarId
						title
						rrule
						startDateLocalized
						endDateLocalized
						${calendarHandles.map(
							(handle) => `
						... on ${handle}_Event {
							eventVisibility
							eventJoinLink
							eventLink
							eventCalendarDescription
						}`,
						)}
					}
				}
			}
		`;

		//
		const rangeStart =
			specifiedRangeStart || DateTime.now().set({ hour: 0 }).toISO();
		const rangeEnd =
			specifiedRangeEnd ||
			DateTime.now().set({ hour: 0 }).plus({ days: 30 }).toISO();

		const response = await this.client.request(query, {
			limit,
			rangeStart,
			rangeEnd,
		});

		if (!response?.solspace_calendar) {
			throw new CmsError('There was an error fetching events.', response);
		}

		return await Promise.all(
			response.solspace_calendar.events.map(this.enhanceEvent),
		);
	}

	async getEventJoinLink(event: Event, request: Request) {
		let returnJson: EventLoaderData | null = null;

		if (!event) {
			returnJson = {
				type: 'error',
				message: 'Event not found. Please check your event link and try again.',
			};
			return returnJson;
		}

		const safeEvent: SafeEvent = {
			id: event.id,
			uid: event.uid,
			title: event.title,
			rrule: event.rrule,
			calendarId: event.calendarId,
			startDateLocalized: event.startDateLocalized,
			endDateLocalized: event.endDateLocalized,
			eventVisibility: event.eventVisibility,
			eventCalendarDescription: event.eventCalendarDescription,
			eventLink: event.eventLink,
		};

		// check timing
		const now = DateTime.now();
		const startTime = DateTime.fromISO(event.startDateLocalized).setZone(
			'America/New_York',
		);
		const endTime = DateTime.fromISO(event.endDateLocalized).setZone(
			'America/New_York',
		);

		if (now < startTime.minus({ minutes: 10 })) {
			returnJson = {
				type: 'timing',
				message: `The event hasn't started yet!`,
				event: safeEvent,
			};
			return returnJson;
		}

		if (now > endTime.plus({ hours: 2 })) {
			returnJson = {
				type: 'timing',
				message: `This event has already ended.`,
				event: safeEvent,
			};
			return returnJson;
		}

		// check visibility

		let visibility = event.eventVisibility;

		if (!visibility || visibility === 'default') {
			// we need to get the parent calendar and check it's visibility
			const calendar: Calendar = await this.getCalendarEntryByCalendarId({
				id: event.calendarId,
			});

			if (!calendar) {
				return {
					message:
						'Calendar not found. Please check your event link and try again.',
				} as EventLoaderData;
			}

			visibility = calendar.calendarVisibility;
		}

		if (visibility === 'public') {
			if (event.eventJoinLink) {
				returnJson = {
					type: 'success',
					event: safeEvent,
				};
				return returnJson;
			}

			returnJson = {
				type: 'noLink',
				message: `This event has no link.`,
				event: safeEvent,
			};
			return returnJson;
		}

		// if it's not public, then authenticate
		let user: User = await getUser(request);

		if (user) {
			if (
				visibility === 'membersOnly' &&
				user.schema !== 'Full Members Schema'
			) {
				returnJson = {
					type: 'permissions',
					message: `This event is for members only.`,
					event: safeEvent,
				};
				return returnJson;
			}

			if (event.eventJoinLink) {
				returnJson = {
					type: 'success',
					event: safeEvent,
				};
				return returnJson;
			}

			returnJson = {
				type: 'noLink',
				message: `This event has no link.`,
				event: safeEvent,
			};
			return returnJson;
		}

		throw new CmsError('There was an error checking this event.');
	}
}
