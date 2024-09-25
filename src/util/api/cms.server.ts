import { GraphQLClient, gql } from 'graphql-request';
import { DateTime } from 'luxon';
import { CmsError } from '@/util/api/util';
import type { Event, User, NovemberChallengeEntry } from './types';
import { ics } from 'calendar-link';

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
	user: User | null = null;
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

	// async enhanceEvent(event: Event): Promise<Event> {
	// 	event.eventCalendarDescription = await sanitizeHtml(
	// 		event.eventCalendarDescription || '',
	// 	);

	// 	return { ...event, eventIcsLink: getIcsLink(event) };
	// }

	// async authenticate(request: Request) {
	// 	let user = await getUser(request);
	// 	if (!user) {
	// 		throw new CmsError('User not found');
	// 	}
	// 	this.user = user;
	// 	this.client.setHeader('Authorization', `JWT ${user.jwt}`);
	// }

	// async getCalendarEntryByCalendarId({ id }: { id: string | number }): Promise<{
	// 	id: number;
	// 	title: string;
	// 	calendarVisibility: CalendarVisibility;
	// }> {
	// 	const query = gql`
	// 		query GetUpcomingEvent($id: [QueryArgument]) {
	// 			entry(calendar: $id, section: "calendars") {
	// 				... on calendars_default_Entry {
	// 					id
	// 					title
	// 					calendarVisibility
	// 				}
	// 			}
	// 		}
	// 	`;

	// 	const response = await this.client.request(query, {
	// 		id,
	// 	});

	// 	if (!response?.entry) {
	// 		throw new CmsError(
	// 			'There was an error fetching the calendar entry.',
	// 			response,
	// 		);
	// 	}

	// 	return response.entry;
	// }

	// async getCalendars(): Promise<
	// 	{
	// 		handle: string;
	// 		name: string;
	// 		icsHash: string;
	// 		id: number | string;
	// 	}[]
	// > {
	// 	const query = `query getCalendars {
	// 		solspace_calendar {
	// 			calendars {
	// 				handle
	// 				name
	// 				icsHash
	// 				id
	// 			}
	// 		}
	// 	}
	// 	`;

	// 	const response = await this.client.request(query);

	// 	if (!response?.solspace_calendar?.calendars?.length) {
	// 		throw new CmsError('There was an error fetching calendars.', response);
	// 	}

	// 	return response.solspace_calendar.calendars;
	// }

	// async getCalendar(handle: string): Promise<{
	// 	handle: string;
	// 	name: string;
	// 	icsHash: string;
	// 	id: number | string;
	// }> {
	// 	const query = gql`
	// 		query getCalendars($handle: [String]) {
	// 			solspace_calendar {
	// 				calendar(handle: $handle) {
	// 					handle
	// 					name
	// 					icsHash
	// 					id
	// 				}
	// 			}
	// 		}
	// 	`;

	// 	const response = await this.client.request(query, { handle });

	// 	if (!response?.solspace_calendar?.calendar) {
	// 		throw new CmsError('There was an error fetching the calendar.', response);
	// 	}

	// 	return response.solspace_calendar.calendar;
	// }

	// async getAllCalendarHandles(): Promise<string[]> {
	// 	const calendars = await this.getCalendars();

	// 	if (!calendars?.length) {
	// 		throw new CmsError('There was an error fetching the event.');
	// 	}

	// 	return calendars.map((c) => c.handle);
	// }

	// async getEventByUid({ uid }: { uid: string }): Promise<Event> {
	// 	const calendarHandles = await this.getAllCalendarHandles();

	// 	// event gets one event. if it is a recurring event, it will get the first one in the range.
	// 	const query = gql`
	// 		query GetUpcomingEvent(
	// 			$rangeStart: String!
	// 			$rangeEnd: String!
	// 			$uid: [String]
	// 		) {
	// 			solspace_calendar {
	// 				event(
	// 					uid: $uid
	// 					loadOccurrences: true
	// 					rangeStart: $rangeStart
	// 					rangeEnd: $rangeEnd
	// 				) {
	// 					id
	// 					uid
	// 					calendarId
	// 					title
	// 					rrule
	// 					startDateLocalized
	// 					endDateLocalized
	// 					${calendarHandles.map(
	// 						(handle) => `
	// 					... on ${handle}_Event {
	// 						eventVisibility
	// 						eventJoinLink
	// 						eventLink
	// 						eventCalendarDescription
	// 					}`,
	// 					)}
	// 				}
	// 			}
	// 		}
	// 	`;

	// 	//
	// 	const rangeStart = DateTime.now().minus({ hours: 12 }).toISO();
	// 	const rangeEnd = DateTime.now().plus({ hours: 12 }).toISO();

	// 	const response = await this.client.request(query, {
	// 		uid,
	// 		rangeStart,
	// 		rangeEnd,
	// 	});

	// 	if (!response?.solspace_calendar) {
	// 		throw new CmsError('There was an error fetching the event.', response);
	// 	}

	// 	return await this.enhanceEvent(response.solspace_calendar.event);
	// }

	// async getEventsInRange({
	// 	rangeStart: specifiedRangeStart,
	// 	rangeEnd: specifiedRangeEnd,
	// 	calendars,
	// 	limit,
	// }: {
	// 	rangeStart?: string;
	// 	rangeEnd?: string;
	// 	calendars?: string[];
	// 	limit?: number;
	// }): Promise<Event[]> {
	// 	let calendarHandles = calendars || (await this.getAllCalendarHandles());

	// 	// event gets one event. if it is a recurring event, it will get the first one in the range.
	// 	const query = gql`
	// 		query GetUpcomingEvents(
	// 			$rangeStart: String!
	// 			$rangeEnd: String!
	// 			$limit:Int
	// 		) {
	// 			solspace_calendar {
	// 				events(
	// 					loadOccurrences: true
	// 					rangeStart: $rangeStart
	// 					rangeEnd: $rangeEnd
	// 					limit: $limit
	// 				) {
	// 					id
	// 					uid
	// 					calendarId
	// 					title
	// 					rrule
	// 					startDateLocalized
	// 					endDateLocalized
	// 					${calendarHandles.map(
	// 						(handle) => `
	// 					... on ${handle}_Event {
	// 						eventVisibility
	// 						eventJoinLink
	// 						eventLink
	// 						eventCalendarDescription
	// 					}`,
	// 					)}
	// 				}
	// 			}
	// 		}
	// 	`;

	// 	//
	// 	const rangeStart =
	// 		specifiedRangeStart || DateTime.now().set({ hour: 0 }).toISO();
	// 	const rangeEnd =
	// 		specifiedRangeEnd ||
	// 		DateTime.now().set({ hour: 0 }).plus({ days: 30 }).toISO();

	// 	const response = await this.client.request(query, {
	// 		limit,
	// 		rangeStart,
	// 		rangeEnd,
	// 	});

	// 	if (!response?.solspace_calendar) {
	// 		throw new CmsError('There was an error fetching events.', response);
	// 	}

	// 	return await Promise.all(
	// 		response.solspace_calendar.events.map(this.enhanceEvent),
	// 	);
	// }

	// async getEventJoinLink(event: Event, request: Request) {
	// 	let returnJson: EventLoaderData | null = null;

	// 	if (!event) {
	// 		returnJson = {
	// 			type: 'error',
	// 			message: 'Event not found. Please check your event link and try again.',
	// 		};
	// 		return returnJson;
	// 	}

	// 	const safeEvent: SafeEvent = {
	// 		id: event.id,
	// 		uid: event.uid,
	// 		title: event.title,
	// 		rrule: event.rrule,
	// 		calendarId: event.calendarId,
	// 		startDateLocalized: event.startDateLocalized,
	// 		endDateLocalized: event.endDateLocalized,
	// 		eventVisibility: event.eventVisibility,
	// 		eventCalendarDescription: event.eventCalendarDescription,
	// 		eventLink: event.eventLink,
	// 	};

	// 	// check timing
	// 	const now = DateTime.now();
	// 	const startTime = DateTime.fromISO(event.startDateLocalized).setZone(
	// 		'America/New_York',
	// 	);
	// 	const endTime = DateTime.fromISO(event.endDateLocalized).setZone(
	// 		'America/New_York',
	// 	);

	// 	if (now < startTime.minus({ minutes: 10 })) {
	// 		returnJson = {
	// 			type: 'timing',
	// 			message: `The event hasn't started yet!`,
	// 			event: safeEvent,
	// 		};
	// 		return returnJson;
	// 	}

	// 	if (now > endTime.plus({ hours: 2 })) {
	// 		returnJson = {
	// 			type: 'timing',
	// 			message: `This event has already ended.`,
	// 			event: safeEvent,
	// 		};
	// 		return returnJson;
	// 	}

	// 	// check visibility

	// 	let visibility = event.eventVisibility;

	// 	if (!visibility || visibility === 'default') {
	// 		// we need to get the parent calendar and check it's visibility
	// 		const calendar: Calendar = await this.getCalendarEntryByCalendarId({
	// 			id: event.calendarId,
	// 		});

	// 		if (!calendar) {
	// 			return {
	// 				message:
	// 					'Calendar not found. Please check your event link and try again.',
	// 			} as EventLoaderData;
	// 		}

	// 		visibility = calendar.calendarVisibility;
	// 	}

	// 	if (visibility === 'public') {
	// 		if (event.eventJoinLink) {
	// 			returnJson = {
	// 				type: 'success',
	// 				event: safeEvent,
	// 			};
	// 			return returnJson;
	// 		}

	// 		returnJson = {
	// 			type: 'noLink',
	// 			message: `This event has no link.`,
	// 			event: safeEvent,
	// 		};
	// 		return returnJson;
	// 	}

	// 	// if it's not public, then authenticate
	// 	let user: User = await getUser(request);

	// 	if (user) {
	// 		if (
	// 			visibility === 'membersOnly' &&
	// 			user.schema !== 'Full Members Schema'
	// 		) {
	// 			returnJson = {
	// 				type: 'permissions',
	// 				message: `This event is for members only.`,
	// 				event: safeEvent,
	// 			};
	// 			return returnJson;
	// 		}

	// 		if (event.eventJoinLink) {
	// 			returnJson = {
	// 				type: 'success',
	// 				event: safeEvent,
	// 			};
	// 			return returnJson;
	// 		}

	// 		returnJson = {
	// 			type: 'noLink',
	// 			message: `This event has no link.`,
	// 			event: safeEvent,
	// 		};
	// 		return returnJson;
	// 	}

	// 	throw new CmsError('There was an error checking this event.');
	// }

	// async getMonthlyChallenges(): Promise<
	// 	{
	// 		title: string;
	// 		month: string;
	// 		shortDescription: string;
	// 		id: number | string;
	// 	}[]
	// > {
	// 	const query = `query getMonthlyChallenges {
	// 		entries(section: "monthlyChallenges") {
	// 			... on monthlyChallenges_default_Entry {
	// 				id
	// 				title
	// 				month
	// 				shortDescription
	// 			}
	// 		}
	// 	}
	// 	`;

	// 	const response = await this.client.request(query);

	// 	if (!response?.entries) {
	// 		throw new CmsError('There was an error fetching challenges.', response);
	// 	}

	// 	return response.entries;
	// }

	async getNovemberChallengeEntries(
		{
			authorId,
			orderBy,
			year,
		}: {
			authorId?: number | string;
			orderBy?: string;
			year?: number;
		} = {
			authorId: undefined,
			orderBy: undefined,
			year: DateTime.now().year,
		},
	) {
		if (!year) {
			year = DateTime.now().year;
		}

		const query = `query getNovemberChallengeEntries($before:String,$after:String, $authorId: [QueryArgument], $orderBy: String = "dateCreated DESC") {
			entries(
				section: "mcWritingChallengeSubmissions"
				authorId: $authorId
				orderBy: $orderBy
				before: $before
				after: $after
			) {
				... on mcWritingChallengeSubmissions_default_Entry {
					id
					shortDescriptionMarkDown
					title
					urlValue
					wordCount
					topics
					date @formatDateTime(format: "Y-m-d")
					author {
						... on User {
							id
							fullName
							userYourName
						}
					}
				}
			}
		}

		`;

		const response = await this.client.request<{
			entries: NovemberChallengeEntry[];
		}>(query, {
			authorId,
			orderBy,
			before: `${year + 1}-01-01`,
			after: `${year}-01-01`,
		});

		if (!response?.entries) {
			throw new CmsError(
				'There was an error fetching challenge entries.',
				response,
			);
		}

		return response.entries;
	}

	// async getNovemberChallengeEntry({ id }: { id?: number | string }) {
	// 	const query = `query getNovemberChallengeEntry($id: [QueryArgument]) {
	// 		entry(
	// 			id: $id
	// 		) {
	// 			... on mcWritingChallengeSubmissions_default_Entry {
	// 				id
	// 				shortDescriptionMarkDown
	// 				title
	// 				urlValue
	// 				wordCount
	// 				topics
	// 				date @formatDateTime (format: "Y-m-d")
	// 				author {
	// 					... on User {
	// 						id
	// 						userYourName
	// 					}
	// 				}
	// 			}
	// 		}
	// 	}

	// 	`;

	// 	const response = await this.client.request<{
	// 		entry: NovemberChallengeEntry;
	// 	}>(query, { id });

	// 	if (!response?.entry) {
	// 		throw new CmsError(
	// 			'There was an error fetching challenge entry.',
	// 			response,
	// 		);
	// 	}

	// 	return response.entry;
	// }

	// async saveNovemberChallengeEntry(post: {
	// 	title: string;
	// 	shortDescriptionMarkDown?: string | null;
	// 	id?: number | string | null;
	// 	urlValue: string;
	// 	wordCount: number;
	// 	topics?: string | null;
	// 	date: string;
	// }) {
	// 	invariant(this.user, 'You must be logged in to save a post.');

	// 	const query = `mutation SaveMcWritingChallengeSubmission($authorId: ID, $wordCount: Number, $urlValue: String, $topics: String, $shortDescriptionMarkDown: String, $date: DateTime, $title:String, $id:ID) {
	// 		save_mcWritingChallengeSubmissions_default_Entry(
	// 			id:$id
	// 			authorId: $authorId
	// 			wordCount: $wordCount
	// 			urlValue: $urlValue
	// 			topics: $topics
	// 			title: $title
	// 			shortDescriptionMarkDown: $shortDescriptionMarkDown
	// 			date: $date
	// 		) {
	// 			id
	// 			title
	// 			topics
	// 			shortDescriptionMarkDown
	// 			date @formatDateTime (format: "Y-m-d")
	// 			urlValue
	// 			wordCount
	// 			author {
	// 				... on User {
	// 					id
	// 					userYourName
	// 				}
	// 			}
	// 		}
	// 	}

	// 	`;

	// 	const response = await this.client.request<{
	// 		save_mcWritingChallengeSubmissions_default_Entry: NovemberChallengeEntry;
	// 	}>(query, {
	// 		...post,
	// 		authorId: this.user.user.id,
	// 	});

	// 	if (!response?.save_mcWritingChallengeSubmissions_default_Entry) {
	// 		throw new CmsError('There was an error saving entry.', response);
	// 	}

	// 	return response.save_mcWritingChallengeSubmissions_default_Entry;
	// }

	// async getUserProfile({
	// 	id,
	// 	email,
	// }: {
	// 	id?: number | string;
	// 	email?: string;
	// }) {
	// 	const query = `query getMemberProfile($email: [String], $id: [QueryArgument]) {
	// 		user(email: $email, id: $id) {
	// 			... on User {
	// 				id
	// 				email
	// 				enabled
	// 				status
	// 				trashed
	// 				userPronouns
	// 				userTwitterUserName
	// 				userGithubusername
	// 				userAllowSocialSharing
	// 				userPreferredTimeZone
	// 				userYourName
	// 			}
	// 		}
	// 	}
	// 	`;

	// 	const response = await this.client.request<{
	// 		user: UserProfile;
	// 	}>(query, { id, email });

	// 	if (typeof response.user === 'undefined') {
	// 		throw new CmsError('There was an error fetching user profile.', response);
	// 	}

	// 	if (
	// 		!response.user ||
	// 		!response.user.enabled ||
	// 		response.user.trashed ||
	// 		response.user.status !== 'active'
	// 	) {
	// 		return null;
	// 	}

	// 	return response.user;
	// }
}
