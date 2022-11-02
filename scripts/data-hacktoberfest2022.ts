import { GraphQLClient, gql } from 'graphql-request';
import fs from 'fs';
import { join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Collect a bunch of data re: Hacktoberfest 2022
 * to run, `npx tsx scripts/data-hacktoberfest2022.ts`
 */

const vchiContributors = [
	'dominicduffin1',
	'annakimdev',
	'LincolnFleet',
	'muckitymuck',
	// 'adnerdable', user does not exist
	'sadiejay',
	'chaos986',
	'YolandaHaynes',
	'ClJarvis',
	'CodingatTiffanys',
	'davidalpert',
	'pedaars',
	'jocrah',
	'shelleymcq',
	'BogDAAAMN',
	'rmirville',
	'adiati98',
	'AlexVCS',
	'raykotab',
	'ridonky',
	'meg-gutshall',
	'carmenkolohe',
	'jdwilkin4',
	'teezzan',
	'BekahHW',
	'danieltott',
	'CodeKage25',
	'JoeKarow',
	'martin-creator',
	'stef-codes',
	'barbaralaw',
	'lsparlin',
	'SteviBee',
	'grassfinn',
	'Nerajno',
	'abuna1985',
	'jaenwawe',
	'keaglin',
	'aishwarya-mali',
	'DavidRod1865',
	'radturkin',
	'klezi10',
	'niklasfyi',
	'meggo15',
];
const vchiMentors = [
	'nickytonline',
	'AmyShackles',
	'BogDAAAMN',
	'davidalpert',
	'itmilos',
	'CuriousCurmudgeon',
	'BYUDigger',
	'rmirville',
	'AlexVCS',
	'Narigo',
	'meg-gutshall',
	'BekahHW',
	'danieltott',
	'tkshill',
	'MingJae92',
	'abuna1985',
];

const vchiMaintainers = [
	'dominicduffin1',
	'ClJarvis',
	'JesseRWeigel',
	'nickytonline',
	'jdwilkin4',
	'danieltott',
	'BekahHW',
];

const vchiMaintainerRepos = [
	'Virtual-Coffee/virtualcoffee.io',
	'ClJarvis/Hello_There',
	'nickytonline/connect-four',
	'freeCodeCamp/Developer_Quiz_Site',
	'BekahHW/postpartum-wellness-app',
	'JesseRWeigel/battlemath',
	'JesseRWeigel/voice-to-text-notes',
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

							// Only include PRs created in October 2022
							if (
								created < new Date('2022-10-01T00:00:00Z') ||
								created > new Date('2022-10-31T23:59:59Z')
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
									(label) => label.name === 'hacktoberfest-accepted',
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
		const contributions = response
			.filter(isNonError)
			.filter((user) => user.stats.totalPullRequests > 0)
			.sort((a, b) => {
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

		const results = {
			contributions,
			stats: {
				totalContributors: contributions.length,
				totalPullRequests: contributions.reduce(
					(total, contributor) => total + contributor.stats.totalPullRequests,
					0,
				),
				totalAdditions: contributions.reduce(
					(total, contributor) => total + contributor.stats.totalAdditions,
					0,
				),
				totalDeletions: contributions.reduce(
					(total, contributor) => total + contributor.stats.totalDeletions,
					0,
				),
				totalChangedFiles: contributions.reduce(
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
				'hacktoberfest2022',
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

async function getMaintainerContributions(data: string[]): Promise<any> {
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
			query ($cursor: String, $name: String!, $owner: String!) {
				repository(name: $name, owner: $owner) {
					pullRequests(
						first: 100
						orderBy: { field: CREATED_AT, direction: DESC }
						after: $cursor
					) {
						pageInfo {
							hasNextPage
							endCursor
						}
						nodes {
							author {
								login
							}
							title
							mergedAt
							url
							deletions
							additions
							changedFiles
							state
							createdAt
							bodyText
						}
					}
				}
			}
		`;
		type RepoResponse = {
			repository: {
				pullRequests: {
					pageInfo: {
						hasNextPage: boolean;
						endCursor: string;
					};
					nodes: {
						author: {
							login: string;
						};
						title: string;
						mergedAt: string | null;
						url: string;
						deletions: number;
						additions: number;
						changedFiles: number;
						state: string;
						createdAt: string;
						bodyText: string;
					}[];
				};
			};
		};

		const response = await Promise.all(
			data.map(async (repo) => {
				const [owner, name] = repo.split('/');

				const prs: RepoResponse['repository']['pullRequests']['nodes'] = [];
				let cursor: string | undefined = undefined;
				let hasNextPage = true;

				while (hasNextPage) {
					console.log(`fetching page ${cursor} for ${repo}`);
					const rs: RepoResponse = await graphQLClient.request<RepoResponse>(
						query,
						{
							owner,
							name,
							cursor,
						},
					);

					const repository = rs.repository;

					prs.push(...repository.pullRequests.nodes);

					if (repository.pullRequests.pageInfo.hasNextPage) {
						const lastRepo =
							repository.pullRequests.nodes[
								repository.pullRequests.nodes.length - 1
							];
						if (
							new Date(lastRepo.createdAt) >=
								new Date('2022-10-01T00:00:00Z') &&
							new Date(lastRepo.createdAt) <= new Date('2022-10-31T23:59:59Z')
						) {
							console.log('lastRepo', lastRepo.createdAt);
							cursor = repository.pullRequests.pageInfo.endCursor;
						} else {
							hasNextPage = false;
						}
					} else {
						hasNextPage = false;
					}
				}

				const pullRequests = prs.filter((pr) => {
					const created = new Date(pr.createdAt);

					// Only include PRs created in October 2022
					if (
						created < new Date('2022-10-01T00:00:00Z') ||
						created > new Date('2022-10-31T23:59:59Z')
					) {
						return false;
					}
					return true;
				});

				if (repo === 'Virtual-Coffee/virtualcoffee.io') {
					const memberFilePulls = pullRequests.filter((pr) => {
						return pr.bodyText.includes('#13') || pr.bodyText.includes('#643');
					});

					const nonMemberFilePulls = pullRequests.filter((pr) => {
						return !(
							pr.bodyText.includes('#13') || pr.bodyText.includes('#643')
						);
					});
					const totalMemberFilePullRequests = memberFilePulls.length;
					const totalNonMemberFilePullRequests = nonMemberFilePulls.length;

					console.log({
						totalMemberFilePullRequests,
						totalNonMemberFilePullRequests,
					});
				}

				const uniqueContributors = [
					...new Set(pullRequests.map((pr) => pr.author.login)),
				]
					.map((login) => {
						return {
							login,
							totalPrs: pullRequests.filter((pr) => pr.author.login === login)
								.length,
						};
					})
					.sort((a, b) => {
						return b.totalPrs - a.totalPrs;
					});

				const results = {
					repo,
					pullRequests,
					stats: {
						totalPullRequests: pullRequests.length,
						totalUniqueContributors: uniqueContributors.length,
						uniqueContributors,
					},
				};

				console.log(repo, results.stats);
				return results;
			}),
		);

		const results = {
			repositories: response,
			stats: {
				totalPullRequests: response.reduce((acc, repo) => {
					return acc + repo.stats.totalPullRequests;
				}, 0), // Total number of pull requests
				totalUniqueContributors: response.reduce((acc, repo) => {
					return acc + repo.stats.totalUniqueContributors;
				}, 0),
			},
		};

		fs.writeFileSync(
			join(
				process.cwd(),
				'app',
				'_generatedData',
				'hacktoberfest2022',
				'mainainerRepos.json',
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
// console.log('total', allContribs.length);
getContributions(allContribs);

getMaintainerContributions(vchiMaintainerRepos);

// getContributions(['danieltott']);
