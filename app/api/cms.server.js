import { GraphQLClient, gql } from 'graphql-request';

export class CmsError extends Error {
	constructor(message, data) {
		super(message);
		this.data = data;
	}
}

export default class Api {
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

	login = async (email, password) => {
		const query = gql`
			mutation Authenticate($email: String!, $password: String!) {
				authenticate(email: $email, password: $password) {
					jwt
					jwtExpiresAt
					refreshToken
					refreshTokenExpiresAt
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
			console.log(error);
			throw new CmsError('Unable to log in user.');
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
