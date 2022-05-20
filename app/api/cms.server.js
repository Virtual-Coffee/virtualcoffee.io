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
		console.log(this.client);
		const query = gql`
			mutation Authenticate($email: String!, $password: String!) {
				authenticate(email: $email, password: $password) {
					jwt
					jwtExpiresAt
					refreshToken
					refreshTokenExpiresAt
					user {
						id
						fullName
					}
				}
			}
		`;
		try {
			const response = await this.client.request(query, { email, password });
			console.log({ response });
			return response;
		} catch (error) {
			throw new CmsError('Unable to log in user.');
		}
	};
}
