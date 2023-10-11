import { builder, type Handler } from '@netlify/functions';
import { GraphQLClient, gql } from 'graphql-request';
import mockData from '../../app/data/mocks/sponsors';
import ImgixClient from '@imgix/js-core';

const client = new ImgixClient({
	domain: 'virtualcoffee.imgix.net',
	// secureURLToken: '<SECURE TOKEN>',
});

// This file is an On-Demand Builder
// It allows us to cache third-party data for a specified amount of time
// Any deploys will clear the cache
// Read more here: https://docs.netlify.com/configure-builds/on-demand-builders/

const handlerFn: Handler = async (event) => {
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

type SponsorEntity =
	(typeof mockData.organization.sponsorshipsAsMaintainer.nodes)[number]['sponsorEntity'] & {
		avatar_width?: number;
		avatar_height?: number;
	};

const sponsorOverrides: Record<string, Partial<SponsorEntity>> = {
	MDEyOk9yZ2FuaXphdGlvbjU3NTY4NTk4: {
		websiteUrl: 'https://opensauced.pizza',
		name: 'OpenSauced',
		descriptionHTML: 'Find the best engineers in open-source.',
		avatar_width: 1280,
		avatar_height: 720,
		avatarUrl_80: client.buildURL('/assets/sponsors/open-sauced.png', {
			w: 80,
		}),
		avatarUrl_160: client.buildURL('/assets/sponsors/open-sauced.png', {
			w: 160,
		}),
		avatarUrl_240: client.buildURL('/assets/sponsors/open-sauced.png', {
			w: 240,
		}),
		avatarUrl_480: client.buildURL('/assets/sponsors/open-sauced.png', {
			w: 480,
		}),
		avatarUrl_720: client.buildURL('/assets/sponsors/open-sauced.png', {
			w: 720,
		}),
	},
	MDQ6VXNlcjY2Mjc0MzIy: {
		websiteUrl: 'https://levelupfinancialplanning.com',
		name: 'LevelUP Financial planning',
		descriptionHTML: `We're grateful to be sponorsored by LevelUP Financial planning, who understands the importance of finding balance between having an awesome life today, and being confident and excited about your future possibilities. If you want to take your financial confidence to the next level, check out levelupfinancialplanning.com.`,
		avatar_width: 557,
		avatar_height: 720,
		avatarUrl_80:
			'https://virtualcoffeeio-cms.imgix.net/podcast/levelUP.png?ixlib=js-3.8.0&auto=compress%2Cformat&w=80',
		avatarUrl_160:
			'https://virtualcoffeeio-cms.imgix.net/podcast/levelUP.png?ixlib=js-3.8.0&auto=compress%2Cformat&w=160',
		avatarUrl_240:
			'https://virtualcoffeeio-cms.imgix.net/podcast/levelUP.png?ixlib=js-3.8.0&auto=compress%2Cformat&w=240',
		avatarUrl_480:
			'https://virtualcoffeeio-cms.imgix.net/podcast/levelUP.png?ixlib=js-3.8.0&auto=compress%2Cformat&w=480',
		avatarUrl_720:
			'https://virtualcoffeeio-cms.imgix.net/podcast/levelUP.png?ixlib=js-3.8.0&auto=compress%2Cformat&w=720',
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

	console.log(JSON.stringify(tiers, null, 2));

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
