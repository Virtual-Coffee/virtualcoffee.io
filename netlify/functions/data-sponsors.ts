import { builder, Handler } from '@netlify/functions';
import { GraphQLClient, gql } from 'graphql-request';
import mockData from '../../app/data/mocks/sponsors';

// This file is an On-Demand Builder
// It allows us to cache third-party data for a specified amount of time
// Any deploys will clear the cache
// Read more here: https://docs.netlify.com/configure-builds/on-demand-builders/

const handlerFn: Handler = async (event) => {
	// todo: DOES THIS WORK with builder????
	if (event.httpMethod !== 'GET') {
		return {
			statusCode: 405,
			ttl: 0, // in seconds
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				error: 'Method not allowed.',
			}),
		};
	}

	const sponsorData = await getSponsors();

	return {
		statusCode: 200,
		ttl: 60 * 24, // in seconds
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(sponsorData),
	};
};

export const handler = builder(handlerFn);

// todo: does this work???
// export { handler };

type SponsorEntity =
	typeof mockData.organization.sponsorshipsAsMaintainer.nodes[number]['sponsorEntity'];

type SponsorEntity =
	typeof mockData.organization.sponsorshipsAsMaintainer.nodes[number]['sponsorEntity'];

const sponsorOverrides: Record<string, Partial<SponsorEntity>>: Record<string, Partial<SponsorEntity>> = {
	MDEyOk9yZ2FuaXphdGlvbjcxNDc2MTY2: {
		avatarUrl_80: '/assets/images/sponsors/whimser.png',
		avatarUrl_160: '/assets/images/sponsors/whimser.png',
		avatarUrl_240: '/assets/images/sponsors/whimser.png',
		avatarUrl_480: '/assets/images/sponsors/whimser.png',
		avatarUrl_720: '/assets/images/sponsors/whimser.png',
	},
};

const query = gql`
	{
		organization(login: "Virtual-Coffee") {
			sponsorshipsAsMaintainer(first: 100) {
				nodes {
					sponsorEntity {
						... on Organization {
							name
							login
							id
							avatarUrl_80: avatarUrl(size: 80)
							avatarUrl_160: avatarUrl(size: 160)
							avatarUrl_240: avatarUrl(size: 240)
							avatarUrl_480: avatarUrl(size: 480)
							avatarUrl_720: avatarUrl(size: 720)
							url
							description
							descriptionHTML
							websiteUrl
						}
						... on User {
							name
							login
							id
							avatarUrl_80: avatarUrl(size: 80)
							avatarUrl_160: avatarUrl(size: 160)
							avatarUrl_240: avatarUrl(size: 240)
							avatarUrl_480: avatarUrl(size: 480)
							avatarUrl_720: avatarUrl(size: 720)
							url
							websiteUrl
						}
					}
					tier {
						id
					}
					tierSelectedAt
				}
			}
			sponsorsListing {
				tiers(first: 100) {
					nodes {
						id
						name
						monthlyPriceInDollars
						monthlyPriceInCents
						isOneTime
						isCustomAmount
					}
				}
			}
		}
	}
`;

async function getSponsors() {
	// async function main() {

	let headers: HeadersInit = {
		Accept: 'application/vnd.github.v3+json',
	};

	const token = process.env.GITHUB_TOKEN;

	if (token) {
		headers.Authorization = 'bearer ' + token;
	}

	const graphQLClient = new GraphQLClient('https://api.github.com/graphql', {
		headers,
	});

	let response: typeof mockData;

	if (!token) {
		response = mockData;
	} else {
		try {
			// do some expensive operation here, this is simplified for brevity
			response = await graphQLClient.request(query);
		} catch (error) {
			console.log(error);
			console.log('Error loading github sponsors, using fake data instead');

			response = mockData;
		}
	}

	const tiers = response.organization.sponsorsListing.tiers.nodes.map(
		(tier) => {
			const sponsors = response.organization.sponsorshipsAsMaintainer.nodes
				.filter((sponsor) => {
					return sponsor.tier.id === tier.id;
				})
				.map((sponsor) => ({
					...sponsor.sponsorEntity,
					...(sponsorOverrides[sponsor.sponsorEntity.id] || {}),
				}));

			return {
				...tier,
				sponsors,
			};
		},
	);

	const returnVal = {
		logoSponsors: tiers
			.filter(
				(tier) =>
					!tier.isOneTime &&
					tier.monthlyPriceInDollars >= 100 &&
					tier.sponsors.length > 0,
			)
			.sort((a, b) => b.monthlyPriceInDollars - a.monthlyPriceInDollars),
		supporters: tiers
			.filter(
				(tier) =>
					(tier.isOneTime || tier.monthlyPriceInDollars < 100) &&
					tier.sponsors.length > 0,
			)
			.sort((a, b) => b.monthlyPriceInDollars - a.monthlyPriceInDollars),
	};

	return returnVal;
}

export type SponsorsResponse = Awaited<ReturnType<typeof getSponsors>>;
