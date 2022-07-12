import { GraphQLClient, gql } from 'graphql-request';
import { authenticate } from '~/auth/auth.server';
import { DateTime } from 'luxon';

export class CmsError extends Error {
	constructor(message, data) {
		super(message);
		this.data = data;
	}
}

export class CmsAuth {
	constructor() {
		if (!process.env.CMS_URL || !process.env.CMS_TOKEN) {
			this.client = null;
		} else {
			this.client = new GraphQLClient(`${process.env.CMS_URL}/api`, {
				headers: {
					Authorization: `bearer ${process.env.CMS_TOKEN}`,
				},
			});
		}
	}

	activateUser = async ({ code, id }) => {
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
			console.log(error);
			const msg =
				error.response?.errors?.[0]?.message || 'Unable to activate user.';
			throw new CmsError(msg, {
				errors: error.response?.errors,
			});
		}
	};

	resendActivation = async ({ email }) => {
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
			const msg = error.response?.errors?.[0]?.message || 'Server error.';
			throw new CmsError(msg, {
				errors: error.response?.errors,
			});
		}
	};

	forgottenPassword = async ({ email }) => {
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
			const msg = error.response?.errors?.[0]?.message || 'Server Error.';
			throw new CmsError(msg, {
				errors: error.response?.errors,
			});
		}
	};

	setPassword = async ({ password, code, id }) => {
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
			const msg =
				error.response?.errors?.[0]?.message || 'Unable to save password.';
			throw new CmsError(msg, {
				errors: error.response?.errors,
			});
		}
	};

	refreshToken = async ({ refreshToken }) => {
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
			const msg =
				error.response?.errors?.[0]?.message ||
				'Unable to refresh user session.';
			throw new CmsError(msg, {
				errors: error.response?.errors,
			});
		}
	};

	login = async (email, password) => {
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
			const msg =
				error.response?.errors?.[0]?.message || 'Unable to log in user.';
			throw new CmsError(msg, {
				errors: error.response?.errors,
			});
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
			if (error?.response?.errors && error.response.errors.length) {
				throw new CmsError(
					`Unable to register user: ${error.response.errors
						.map((e) => e.message)
						.join(',')}`,
					{
						errors: error.response.errors,
					},
				);
			}
			throw new CmsError('Unable to register user.');
		}
	};
}

export class CmsActions {
	constructor() {
		if (!process.env.CMS_URL || !process.env.CMS_TOKEN) {
			this.client = null;
		} else {
			this.client = new GraphQLClient(`${process.env.CMS_URL}/api`, {
				headers: {
					Authorization: `bearer ${process.env.CMS_TOKEN}`,
				},
			});
		}
	}

	async authenticate(request) {
		let user = await authenticate(request);
		this.client.setHeader('Authorization', `JWT ${user.jwt}`);
	}

	async getCalendarEntryByCalendarId({ id }) {
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

	async getCalendars() {
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

	async getCalendarHandles() {
		const calendars = await this.getCalendars();

		if (!calendars?.length) {
			throw new CmsError('There was an error fetching the event.', response);
		}

		return calendars.map((c) => c.handle);
	}

	async getEventByUid({ uid }) {
		const calendarHandles = await this.getCalendarHandles();

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
