import { GraphQLClient, gql } from 'graphql-request';
import fs from 'fs';
import { join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Collect a bunch of data re: Hacktoberfest 2023
 * to run, `npx tsx scripts/data-hacktoberfest2023/maintainer-repos.ts`
 */

const vchiMaintainerRepos = [
	'MichaelJolley/vscode-vs-outlining',
	'MichaelJolley/vscode-twitch-themer',
	'MichaelJolley/discord-guy-bot',
	'freeCodeCamp/Developer_Quiz_Site',
	'Terieyenike/linktree',
	'ClJarvis/Hello_There',
	'TarynMcMillan/Tiny-Troves-of-Dev-Wisdom',
	'dominicduffin1/python-turtle-art-canvas',
	'hacktoberfesthowto/howto-blog',
	'Virtual-Coffee/virtualcoffee.io',
	'Virtual-Coffee/podcast-transcripts',
	'open-sauced/docs',
	'open-sauced/intro',
	'open-sauced/guestbook',
	'open-sauced/pizza-verse',
	'cmcrawford2/memory-game',
	'tkshill/rpg-session',
];

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
								new Date('2023-10-01T00:00:00Z') &&
							new Date(lastRepo.createdAt) <= new Date('2023-10-31T23:59:59Z')
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

					// Only include PRs created in October 2023
					if (
						created < new Date('2023-10-01T00:00:00Z') ||
						created > new Date('2023-10-31T23:59:59Z')
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
				'hacktoberfest2023',
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

getMaintainerContributions(vchiMaintainerRepos);
