import { GraphQLClient, gql } from 'graphql-request';
import { unstable_cache } from 'next/cache';
import mockData from './mocks/sponsors';
import ImgixClient from '@imgix/js-core';

const client = new ImgixClient({
	domain: 'virtualcoffee.imgix.net',
	// secureURLToken: '<SECURE TOKEN>',
});

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
		websiteUrl: 'https://levelupfinancialplanning.com?vc',
		name: 'LevelUP Financial planning',
		descriptionHTML: `We&apos;re grateful to be sponorsored by LevelUP Financial planning, who understands the importance of finding balance between having an awesome life today, and being confident and excited about your future possibilities. If you want to take your financial confidence to the next level, check out <span class="text-link">levelupfinancialplanning.com</span>.`,
		avatar_height: 557,
		avatar_width: 720,
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

const emptySponsorsResponse = {
	logoSponsors: [],
	supporters: [],
};

async function getSponsorsInternal() {
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

	let response: undefined | typeof mockData;

	if (token) {
		try {
			// do some expensive operation here, this is simplified for brevity
			response = await graphQLClient.request(query);
		} catch (error) {
			console.log(error);
			console.log('Error loading github sponsors, using fake data instead');
		}
	}

	if (!response || !response?.organization?.sponsorsListing?.tiers) {
		// If the GITHUB_TOKEN user doesn't have the right permissions, this will be empty
		if (process.env.CONTEXT === 'production') {
			return emptySponsorsResponse;
		} else {
			response = mockData;
		}
	}

	const tiers = response.organization.sponsorsListing.tiers.nodes.map(
		(tier) => {
			const sponsors = response.organization.sponsorshipsAsMaintainer.nodes
				.filter((sponsor) => {
					return sponsor.tier?.id === tier.id;
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

export const getSponsors = unstable_cache(
	getSponsorsInternal,
	['sponsors'],
	{ revalidate: 86400, tags: ['sponsors'] },
);

export type SponsorsResponse = Awaited<ReturnType<typeof getSponsors>>;
