import { GraphQLClient, gql } from 'graphql-request';
import fs from 'fs';
import { join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Collect a bunch of data re: Hacktoberfest 2023
 * to run, `npx tsx scripts/data-hacktoberfest2023/contributors.ts`
 */

const vchiContributors = [
	'liathirsh',
	'pedaars',
	'harshleey',
	'raaynaldo',
	'rolandolopez',
	'JoeKarow',
	'funbunch',
	'aliaquintero',
	'EvaGraceSmith',
	'davidgsalgado',
	'Terieyenike',
	'iotalex',
	'Satoshi-Sh',
	'srgupta',
	'brennakh',
	'christina-ml',
	'IntelliJinceTech',
	'01001101CK',
	'ARodriguezHacks',
	'charlieintech',
	'Justin-Quinn51',
	'jenieg',
	'meg-gutshall',
	'david-001',
	'piotrszymaniec',
	'anshumanSathua',
	'radturkin',
	'tgmiller5',
	'tkshill',
	'5hraddha',
	'AlexVCS',
	'dominicduffin1',
	'MarieReRe',
	'ClJarvis',
	'adiati98',
	'aishwarya-mali',
	'michaeljolley',
	'BekahHW',
	'danieltott',
	'Arol15',
	'CBID2',
	'asaki222',
	'derekjj',
	'pkcnj',
	'abuna1985',
	'zo0o0ot',
];
const vchiMentors = [
	'BekahHW',
	'shiftyp',
	'michaeljolley',
	'jdwilkin4',
	'meg-gutshall',
	'aishwarya-mali',
	'adiati98',
	'MarieReRe',
	'wheeleruniverse',
	'jamescurran',
	'danieltott',
	'tkshill',
	'davidalpert',
	'derekjj',
];

const vchiMaintainers = [
	'BekahHW',
	'michaeljolley',
	'jdwilkin4',
	'cmcrawford2',
	'Terieyenike',
	'ClJarvis',
	'TarynMcMillan',
	'dominicduffin1',
	'tkshill',
	'zo0o0ot',
	'danieltott',
];

async function getContributions(data: string[]): Promise<any> {
	const token = process.env.GITHUB_TOKEN;

	if (!token) {
		return null;
	}

	let headers = {
		Accept: 'application/vnd.github.v3+json',
		Authorization: 'bearer ' + token,
	};

	try {
		console.log('Fetching member data...');

		const graphQLClient = new GraphQLClient('https://api.github.com/graphql', {
			headers,
		});

		const query = gql`
			query ($login: String!, $cursor: String) {
				user(login: $login) {
					login
					name
					pullRequests(
						first: 20
						orderBy: { field: CREATED_AT, direction: DESC }
						after: $cursor
					) {
						pageInfo {
							hasNextPage
							endCursor
						}
						nodes {
							title
							mergedAt
							labels(first: 100) {
								nodes {
									name
								}
							}
							url
							baseRepository {
								name
								nameWithOwner
								url
								repositoryTopics(first: 100) {
									nodes {
										topic {
											name
										}
									}
								}
							}
							deletions
							additions
							changedFiles
							state
							createdAt
						}
					}
				}
			}
		`;
		type UserResponse = {
			user: {
				login: string;
				name: string;
				pullRequests: {
					pageInfo: {
						hasNextPage: boolean;
						endCursor: string;
					};
					nodes: {
						title: string;
						mergedAt: string | null;
						labels: {
							nodes: {
								name: string;
							}[];
						};
						url: string;
						baseRepository: {
							name: string;
							nameWithOwner: string;
							url: string;
							repositoryTopics: { nodes: { topic: { name: string } }[] };
						};
						deletions: number;
						additions: number;
						changedFiles: number;
						state: string;
						createdAt: string;
					}[];
				};
			};
		};

		type UserObject = {
			login: string;
			name: string;
			pullRequests: Omit<
				UserResponse['user']['pullRequests']['nodes'][number],
				'labels'
			>[];
			stats: {
				totalPullRequests: number;
				totalAdditions: number;
				totalDeletions: number;
				totalChangedFiles: number;
				totalUniqueRepos: number;
				uniqueRepos: string[];
			};
		};

		type UserErrorObject = { login: string; error: string };
		// 2022-10-27T18:44:05Z
		// 2022-10-17T13:30:31Z

		const response = await Promise.all(
			data.map(async (login): Promise<UserObject | UserErrorObject> => {
				try {
					const { user } = await graphQLClient.request<UserResponse>(query, {
						login,
					});

					const pullRequests = user.pullRequests.nodes
						.filter((pr) => {
							const created = new Date(pr.createdAt);

							// Only include PRs created in October 2023
							if (
								created < new Date('2023-10-01T00:00:00Z') ||
								created > new Date('2023-10-31T23:59:59Z')
							) {
								return false;
							}

							// Only include PRs that are merged or have hacktoberfest-accepted label
							if (
								pr.state === 'MERGED' &&
								pr.baseRepository.repositoryTopics.nodes.some(
									(topic) => topic.topic.name === 'hacktoberfest',
								)
							) {
								return true;
							} else if (
								pr.labels.nodes.find(
									(label) =>
										label.name.toLowerCase() === 'hacktoberfest-accepted',
								)
							) {
								return true;
							}

							return false;
						})
						.map(({ labels: _, ...pr }) => {
							return pr;
						});

					if (pullRequests.length >= 20) {
						console.log('Need to fetch more for ' + login);
					}

					const uniqueRepos = new Set(
						pullRequests.map((pr) => pr.baseRepository.nameWithOwner),
					);
					return {
						login,
						name: user.name,
						pullRequests,
						stats: {
							totalPullRequests: pullRequests.length,
							totalAdditions: pullRequests.reduce(
								(total, pr) => total + pr.additions,
								0,
							),
							totalDeletions: pullRequests.reduce(
								(total, pr) => total + pr.deletions,
								0,
							),
							totalChangedFiles: pullRequests.reduce(
								(total, pr) => total + pr.changedFiles,
								0,
							),
							totalUniqueRepos: uniqueRepos.size,
							uniqueRepos: Array.from(uniqueRepos),
						},
					};
				} catch (error) {
					console.log(error);
					if (error instanceof Error) {
						return { login, error: error.message };
					}
					return { login, error: 'Unknown error' };
				}
			}),
		);

		function isNonError(
			user: UserObject | UserErrorObject,
		): user is UserObject {
			if ('error' in user) {
				console.log('error', user);
				return false;
			} else {
				return true;
			}
		}
		const contributions = response.filter(isNonError).sort((a, b) => {
			return b.stats.totalPullRequests - a.stats.totalPullRequests;
		});

		contributions.forEach((user) => {
			console.log(
				user.login,
				user.stats.totalPullRequests,
				user.stats.totalChangedFiles,
			);
		});

		const uniqueRepos = Array.from(
			new Set(
				contributions.flatMap((contributor) => contributor.stats.uniqueRepos),
			),
		).sort((a, b) => {
			return a.toLowerCase().localeCompare(b.toLowerCase());
		});

		const contributorsWithPRs = contributions.filter(
			(contributor) => contributor.stats.totalPullRequests > 0,
		);

		const results = {
			contributions,
			stats: {
				totalContributors: contributorsWithPRs.length,
				totalPullRequests: contributorsWithPRs.reduce(
					(total, contributor) => total + contributor.stats.totalPullRequests,
					0,
				),
				totalAdditions: contributorsWithPRs.reduce(
					(total, contributor) => total + contributor.stats.totalAdditions,
					0,
				),
				totalDeletions: contributorsWithPRs.reduce(
					(total, contributor) => total + contributor.stats.totalDeletions,
					0,
				),
				totalChangedFiles: contributorsWithPRs.reduce(
					(total, contributor) => total + contributor.stats.totalChangedFiles,
					0,
				),
				uniqueRepos,
				totalUniqueRepos: uniqueRepos.length,
			},
		};

		fs.writeFileSync(
			join(
				process.cwd(),
				'app',
				'_generatedData',
				'hacktoberfest2023',
				'contributors.json',
			),
			JSON.stringify(results, null, 2),
		);

		// return githubData;
	} catch (error) {
		if (error instanceof Error) {
			console.log(error.message);
		}
		console.log('Error loading github member data, using fake data instead');
		return null;
	}
}

const allContribs = Array.from(
	new Set([...vchiContributors, ...vchiMaintainers, ...vchiMentors]),
);

getContributions(allContribs);
