import { builder, Handler } from '@netlify/functions';
import { GraphQLClient, gql } from 'graphql-request';
import { resolve, join } from 'path';
import requireDir from 'require-dir';
import teamsData from '../../members/teams';
import mockMemberData from '../../app/data/mocks/memberData';
import { sanitizeHtml } from '../../app/util/sanitizeCmsData';

// This file is an On-Demand Builder
// It allows us to cache third-party data for a specified amount of time
// Any deploys will clear the cache
// Read more here: https://docs.netlify.com/configure-builds/on-demand-builders/

type Website = `http${'s' | ''}://${string}`;

type Account =
	| {
			type:
				| 'linkedin'
				| 'dev'
				| 'codenewbie'
				| 'twitter'
				| 'twitch'
				| 'polywork'
				| 'medium'
				| 'hashnode'
				| 'github';
			username: string;
	  }
	| {
			type: 'youtube';
			channelId: string;
	  }
	| {
			type: 'youtube';
			customUrl: Website;
	  }
	| {
			type: 'website';
			url: Website;
			title: string;
	  };

type MemberObject = {
	github: string;
	name?: string;
	mainUrl?: Website;
	bio?: string;
	accounts?: Account[];
};

const handlerFn: Handler = async (event) => {
	const userData = await loadUserData();

	return {
		statusCode: 200,
		ttl: 60 * 24 * 265, // in seconds
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(userData),
	};
};

exports.handler = builder(handlerFn);

async function parseMarkdown(markdown: string) {
	const [unified, remarkParse, remarkRehype, rehypeSanitize, rehypeStringify] =
		await Promise.all([
			import('unified').then((mod) => mod.unified),
			// import('@jsdevtools/rehype-toc').then((mod) => mod.default),
			// import('remark-toc').then((mod) => mod.default),
			import('remark-parse').then((mod) => mod.default),
			import('remark-rehype').then((mod) => mod.default),
			import('rehype-sanitize').then((mod) => mod.default),
			import('rehype-stringify').then((mod) => mod.default),
		]);

	const file = await unified()
		.use(remarkParse)
		.use(remarkRehype)
		.use(rehypeSanitize)
		.use(rehypeStringify)
		.process(markdown);

	return String(file);
}

type GithubSearchUser = {
	login: string;
	id: string | number;
	url: Website;
	avatarUrl: string;
	name?: string;
	company?: string;
	location?: string;
	isHireable?: boolean;
	bio?: string;
	bioHTML?: string;
	twitterUsername?: string;
	websiteUrl?: Website;
};

type GithubSearchUserLookup = Record<string, GithubSearchUser>;

async function getMemberGithubData(
	data: MemberObject[],
): Promise<GithubSearchUserLookup> {
	const token = process.env.GITHUB_TOKEN;

	if (!token) {
		return mockMemberData(data);
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
			query ($searchQuery: String!) {
				search(type: USER, query: $searchQuery, first: 20) {
					nodes {
						... on User {
							login
							id
							url
							avatarUrl
							name
							company
							location
							isHireable
							bio
							bioHTML
							twitterUsername
							websiteUrl
						}
					}
				}
			}
		`;

		const queries: string[] = [];
		const githubData: GithubSearchUserLookup = {};

		let i,
			j,
			chunk = 15;
		for (i = 0, j = data.length; i < j; i += chunk) {
			queries.push(
				`${data
					.slice(i, i + chunk)
					.map((member) => {
						return `user:${member.github}`;
					})
					.join(' ')}`,
			);
		}

		for (let i = 0; i < queries.length; i++) {
			const response = await graphQLClient.request(query, {
				searchQuery: queries[i],
			});

			response.search.nodes.forEach((user: GithubSearchUser) => {
				githubData[user.login.toLowerCase()] = {
					...user,
				};
			});
		}

		return githubData;
	} catch (error) {
		if (error instanceof Error) {
			console.log(error.message);
		}
		console.log('Error loading github member data, using fake data instead');
		return mockMemberData(data);
	}
}

function loadDirectory(path: string) {
	const dict: Record<string, MemberObject> = requireDir(
		join(process.cwd(), 'members', path),
		{
			filter: function (fullPath: string) {
				return !fullPath.match(/members\/_/g);
			},
		},
	);

	return Object.keys(dict)
		.map((key) => dict[key])
		.sort(function (a, b) {
			var nameA = a.github.toLowerCase(); // ignore upper and lowercase
			var nameB = b.github.toLowerCase(); // ignore upper and lowercase
			if (nameA < nameB) {
				return -1;
			}
			if (nameA > nameB) {
				return 1;
			}

			// names must be equal
			return 0;
		});
}

// const allTeamNames = teamsData.map((team) => team.name) as const;

type TeamName = keyof typeof teamsData;
type TeamsDict = Record<string, TeamName[]>;

type TrueFixedUpUserObject = Omit<MemberObject, 'accounts'> & {
	avatarUrl?: GithubSearchUser['avatarUrl'];
	teams?: TeamName[];
	accounts: (Account & {
		Icon: string;
		url: Website;
		title: string;
	})[];
};

async function loadUserData() {
	const core = loadDirectory('core');
	const members = loadDirectory('members');

	const teamsDict = {} as TeamsDict;

	const teamNames = Object.keys(teamsData) as TeamName[];

	teamNames.forEach((teamName) => {
		teamsData[teamName].forEach((member) => {
			const lcMember = member.toLowerCase();
			if (teamsDict[lcMember]) {
				teamsDict[lcMember].push(teamName);
			} else {
				teamsDict[lcMember] = [teamName];
			}
		});
	});

	const githubData = await getMemberGithubData([...core, ...members]);

	const fixupData = async (data: MemberObject) => {
		const github = githubData[data.github.toLowerCase()];

		if (!github) {
			console.log(`no github for ${data.github}`);
			return null;
		}

		const returnObject: TrueFixedUpUserObject = {
			...data,
			accounts: [],
		};

		returnObject.avatarUrl = github.avatarUrl;

		returnObject.teams = teamsDict[data.github.toLowerCase()] || [];

		if (!returnObject.name) {
			returnObject.name = github.name || github.login;
		}

		if (!returnObject.bio) {
			returnObject.bio = await sanitizeHtml(github.bioHTML);
		} else {
			returnObject.bio = await parseMarkdown(returnObject.bio);
		}

		if (!returnObject.mainUrl) {
			if (github.websiteUrl) {
				returnObject.mainUrl =
					github.websiteUrl.slice(0, 4) !== 'http'
						? `https://${github.websiteUrl}`
						: github.websiteUrl;
			} else {
				returnObject.mainUrl = github.url;
			}
		}

		if (!data.accounts) {
			data.accounts = [{ type: 'github', username: github.login }];
		}

		if (
			github.twitterUsername &&
			!data.accounts.find((account) => account.type === 'twitter')
		) {
			data.accounts.push({
				type: 'twitter',
				username: github.twitterUsername,
			});
		}

		if (!data.accounts.find((account) => account.type === 'github')) {
			data.accounts = [
				{ type: 'github', username: github.login },
				...data.accounts,
			];
		}

		function nonNullable<T>(value: T): value is NonNullable<T> {
			return value !== null && value !== undefined;
		}

		// TODO: Dan and kirk fix this
		returnObject.accounts = data.accounts
			.map((account) => {
				switch (account.type) {
					case 'github':
						if (!account.username) {
							return null;
						}
						return {
							...account,
							Icon: 'GitHub',
							url: `https://github.com/${account.username}`,
							title: `${returnObject.name} on GitHub`,
						};

					case 'linkedin':
						if (!account.username) {
							return null;
						}
						return {
							...account,
							Icon: 'LinkedIn',
							url: `https://www.linkedin.com/in/${account.username}`,
							title: `${returnObject.name} on LinkedIn`,
						};

					case 'dev':
						if (!account.username) {
							return null;
						}
						return {
							...account,
							Icon: 'Dev',
							url: `https://dev.to/${account.username}`,
							title: `${returnObject.name} on DEV.to`,
						};

					case 'codenewbie':
						if (!account.username) {
							return null;
						}
						return {
							...account,
							Icon: 'Codenewbie',
							url: `https://community.codenewbie.org/${account.username}`,
							title: `${returnObject.name} on CodeNewbie Community`,
						};

					case 'twitter':
						if (!account.username) {
							return null;
						}
						return {
							...account,
							Icon: 'Twitter',
							url: `https://twitter.com/${account.username}`,
							title: `${returnObject.name} on Twitter`,
						};

					case 'twitch':
						if (!account.username) {
							return null;
						}
						return {
							...account,
							Icon: 'Twitch',
							url: `https://www.twitch.tv/${account.username}`,
							title: `${returnObject.name} on Twitch`,
						};

					case 'polywork':
						if (!account.username) {
							return null;
						}
						return {
							...account,
							Icon: 'Polywork',
							url: `https://polywork.com/${account.username}`,
							title: `${returnObject.name} on Polywork`,
						};

					case 'medium':
						if (!account.username) {
							return null;
						}
						return {
							...account,
							Icon: 'Medium',
							url: `https://medium.com/@${account.username}`,
							title: `${returnObject.name} on Medium`,
						};

					case 'hashnode':
						if (!account.username) {
							return null;
						}
						return {
							...account,
							Icon: 'HashNode',
							url: `https://hashnode.com/@${account.username}`,
							title: `${returnObject.name} on HashNode`,
						};

					case 'youtube':
						if ('channelId' in account && !!account.channelId) {
							return {
								...account,
								Icon: 'YouTube',
								url: `https://www.youtube.com/channel/${account.channelId}`,
								title: `${returnObject.name} on YouTube`,
							};
						}

						if ('customUrl' in account && !!account.customUrl) {
							return {
								...account,
								Icon: 'YouTube',
								url: account.customUrl,
								title: `${returnObject.name} on YouTube`,
							};
						}

						return null;

					case 'website':
						return {
							...account,
							Icon: 'Website',
							type: 'website',
							title: account.title || account.url,
						};

					default:
						return null;
				}
			})
			.filter(nonNullable);
		// .filter(Boolean)

		return returnObject;
	};

	const filteredCore = await Promise.all(core.map(fixupData));
	const filteredMembers = await Promise.all(members.map(fixupData));
	return {
		core: filteredCore.filter(Boolean),
		members: filteredMembers.filter(Boolean),
	};
}
