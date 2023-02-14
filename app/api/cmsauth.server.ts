import { GraphQLClient, gql } from 'graphql-request';
import { CmsError } from '~/api/util';

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
			return response;
		} catch (error) {
			this.handleRequestError(error, 'Unable to refresh user session.');
		}
	};

	async login(email: string, password: string) {
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
			return response;
		} catch (error) {
			this.handleRequestError(error, 'Unable to log in user.');
		}
	}

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
		userPronouns?: string | null;
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

	registerExistingUser = async ({
		email,
		password,
		userYourName,
		userPronouns,
		userGithubusername,
		userSlackId,
	}: {
		email: string;
		password: string;
		userYourName: string;
		userPronouns?: string | null;
		userGithubusername?: string;
		userSlackId?: string;
	}) => {
		const query = gql`
			mutation Register(
				$email: String!
				$password: String!
				$userYourName: String!
				$userPronouns: String
				$userGithubusername: String
				$userSlackId: String
			) {
				registerFullMembers(
					email: $email
					password: $password
					userYourName: $userYourName
					userPronouns: $userPronouns
					userGithubusername: $userGithubusername
					userSlackId: $userSlackId
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
				userSlackId,
			});
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
