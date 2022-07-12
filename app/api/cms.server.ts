import { GraphQLClient, gql } from 'graphql-request';
import { authenticate } from '~/auth/auth.server';
import { DateTime } from 'luxon';

export class CmsError extends Error {
	data: any;
	constructor(message: string, data?: any) {
		super(message);
		this.data = data;
	}
}

export class CmsAuth {
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

	handleRequestError(error: any, errorMessage: string = 'There was an error') {
		console.log(error);
		// @ts-ignore
		const msg =
			// @ts-ignore
			error.response?.errors?.[0]?.message || errorMessage;
		throw new CmsError(msg, {
			// @ts-ignore
			errors: error.response?.errors,
		});
	}

	activateUser = async ({ code, id }: { code: string; id: string }) => {
		const query = gql`
			mutation ActivateUser($code: String!, $id: String!) {
				activateUser(code: $code, id: $id)
			}
		`;
		try {
			const response = await this.client.request(query, { code, id });
			console.log({ response });
			return response;
		} catch (error) {
			this.handleRequestError(error, 'Unable to activate user.');
		}
	};

	resendActivation = async ({ email }: { email: string }) => {
		const query = gql`
			mutation ResendActivation($email: String!) {
				resendActivation(email: $email)
			}
		`;
		try {
			const response = await this.client.request(query, { email });
			console.log({ response });
			return response;
		} catch (error) {
			this.handleRequestError(error);
		}
	};

	forgottenPassword = async ({ email }: { email: string }) => {
		const query = gql`
			mutation ForgottenPassword($email: String!) {
				forgottenPassword(email: $email)
			}
		`;
		try {
			const response = await this.client.request(query, { email });
			console.log({ response });
			return response;
		} catch (error) {
			this.handleRequestError(error);
		}
	};

	setPassword = async ({
		password,
		code,
		id,
	}: {
		password: string;
		code: string;
		id: string;
	}) => {
		const query = gql`
			mutation SetPassword($password: String!, $code: String!, $id: String!) {
				setPassword(password: $password, code: $code, id: $id)
			}
		`;
		try {
			const response = await this.client.request(query, { code, id, password });
			console.log({ response });
			return response;
		} catch (error) {
			this.handleRequestError(error, 'Unable to save password.');
		}
	};

	refreshToken = async ({ refreshToken }: { refreshToken: string }) => {
		const query = gql`
			mutation RefreshToken($refreshToken: String!) {
				refreshToken(refreshToken: $refreshToken) {
					jwt
					jwtExpiresAt
					refreshToken
					refreshTokenExpiresAt
					schema
					user {
						id
						email
						enabled
						status
						... on User {
							userYourName
						}
					}
				}
			}
		`;
		try {
			const response = await this.client.request(query, { refreshToken });
			console.log({ response });
			return response;
		} catch (error) {
			this.handleRequestError(error, 'Unable to refresh user session.');
		}
	};

	login = async (email: string, password: string) => {
		const query = gql`
			mutation Authenticate($email: String!, $password: String!) {
				authenticate(email: $email, password: $password) {
					jwt
					jwtExpiresAt
					refreshToken
					refreshTokenExpiresAt
					schema
					user {
						id
						email
						enabled
						status
						... on User {
							userYourName
						}
					}
				}
			}
		`;
		try {
			const response = await this.client.request(query, { email, password });
			console.log({ response });
			return response;
		} catch (error) {
			this.handleRequestError(error, 'Unable to log in user.');
		}
	};

	register = async ({
		email,
		password,
		userYourName,
		userPronouns,
		userGithubusername,
		userLinks,
		userHowDidYouHearAboutUs,
		userWhereAreYouInYourCodingJourney,
		userCodeInterests,
		userHopingVirtualCoffee,
	}: {
		email: string;
		password: string;
		userYourName: string;
		userPronouns?: string;
		userGithubusername?: string;
		userLinks?: string;
		userHowDidYouHearAboutUs?: string;
		userWhereAreYouInYourCodingJourney?: string;
		userCodeInterests?: string;
		userHopingVirtualCoffee?: string;
	}) => {
		const query = gql`
			mutation Register(
				$email: String!
				$password: String!
				$userYourName: String!
				$userPronouns: String
				$userGithubusername: String
				$userHowDidYouHearAboutUs: String
				$userWhereAreYouInYourCodingJourney: String
				$userCodeInterests: String
				$userHopingVirtualCoffee: String
			) {
				registerPendingMembers(
					email: $email
					password: $password
					userYourName: $userYourName
					userPronouns: $userPronouns
					userGithubusername: $userGithubusername
					userHowDidYouHearAboutUs: $userHowDidYouHearAboutUs
					userWhereAreYouInYourCodingJourney: $userWhereAreYouInYourCodingJourney
					userCodeInterests: $userCodeInterests
					userHopingVirtualCoffee: $userHopingVirtualCoffee
				) {
					jwt
					jwtExpiresAt
					refreshToken
					refreshTokenExpiresAt
					user {
						id
						email
						status
						enabled
						... on User {
							userYourName
						}
					}
				}
			}
		`;
		try {
			const response = await this.client.request(query, {
				email,
				password,
				userYourName,
				userPronouns,
				userGithubusername,
				userLinks,
				userHowDidYouHearAboutUs,
				userWhereAreYouInYourCodingJourney,
				userCodeInterests,
				userHopingVirtualCoffee,
			});
			console.log({ response });
			return response;
		} catch (error) {
			// @ts-ignore
			if (error?.response?.errors && error.response.errors.length) {
				throw new CmsError(
					// @ts-ignore
					`Unable to register user: ${error.response.errors
						// @ts-ignore
						.map((e) => e.message)
						.join(',')}`,
					{
						// @ts-ignore
						errors: error.response.errors,
					},
				);
			}
			throw new CmsError('Unable to register user.');
		}
	};
}

export type CalendarVisibility = 'membersOnly' | 'pendingMembers' | 'public';
export type EventVisibility = CalendarVisibility | 'default';

export type Event = {
	id: string;
	uid: string;
	title: string;
	rrule?: string;
	calendarId: string | number;
	startDateLocalized: string;
	endDateLocalized: string;
	eventVisibility?: EventVisibility;
	eventJoinLink?: string;
	eventLink?: string;
	eventCalendarDescription?: string;
};

export type SafeEvent = Omit<Event, 'eventJoinLink' | 'eventLink'>;

export type Calendar = {
	id: number;
	title: string;
	calendarVisibility: CalendarVisibility;
};

export type User = {
	jwt: string;
	jwtExpiresAt: number;
	refreshToken: string;
	refreshTokenExpiresAt: number;
	schema: 'Pending Members Schema' | 'Full Members Schema';
	user: {
		id: string | number;
		email: string;
		enabled: boolean;
		status: string;
		userYourName?: string;
	};
};

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

	async authenticate(request: Request) {
		let user = await authenticate(request);
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

	async getEventByUid({ uid }: { uid: string }): Promise<{
		id: string;
		uid: string;
		calendarId: string;
		title: string;
		rrule?: string;
		startDateLocalized: string;
		endDateLocalized: string;
		eventVisibility: EventVisibility;
		eventJoinLink?: string;
		eventLink?: string;
		eventCalendarDescription?: string;
	}> {
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

		console.log(
			JSON.stringify({
				uid,
				rangeStart,
				rangeEnd,
			}),
		);

		const response = await this.client.request(query, {
			uid,
			rangeStart,
			rangeEnd,
		});

		if (!response?.solspace_calendar) {
			throw new CmsError('There was an error fetching the event.', response);
		}

		return response.solspace_calendar.event;
	}
}
