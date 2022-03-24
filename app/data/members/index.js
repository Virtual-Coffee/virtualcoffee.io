const { GraphQLClient, gql } = require('graphql-request');
const { resolve } = require('path');
const requireDir = require('require-dir');
const teamsData = require('./teams.json');
const mockMemberData = require('../mocks/memberData');
const { sanitizeHtml } = require('../../util/sanitizeCmsData');
const { parseMarkdown } = require('../../util/markdown');
// import teams from './teams.json';

async function getMemberGithubData(data) {
	let headers = {
		Accept: 'application/vnd.github.v3+json',
	};

	const token = process.env.GITHUB_TOKEN;

	if (token) {
		headers.Authorization = 'bearer ' + token;
	} else {
		return mockMemberData(data);
	}

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

		const queries = [];
		const githubData = {};

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

			response.search.nodes.forEach((user) => {
				githubData[user.login.toLowerCase()] = {
					...user,
				};
			});
		}

		return githubData;
	} catch (error) {
		console.log(error.message);
		console.log('Error loading github member data, using fake data instead');
		return mockMemberData(data);
	}
}

function loadDirectory(path) {
	const dict = requireDir(resolve('app', 'data', 'members', path), {
		filter: function (fullPath) {
			return !fullPath.match(/members\/_/g);
		},
	});

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

module.exports = {
	loadUserData: async function () {
		const core = loadDirectory('core');
		const members = loadDirectory('members');

		const teamsDict = {};

		teamsData.forEach((team) => {
			team.members.forEach((member) => {
				const lcMember = member.toLowerCase();
				if (teamsDict[lcMember]) {
					teamsDict[lcMember].push(team.name);
				} else {
					teamsDict[lcMember] = [team.name];
				}
			});
		});

		const githubData = await getMemberGithubData([...core, ...members]);

		const fixupData = async (data) => {
			const github = githubData[data.github.toLowerCase()];

			if (!github) {
				console.log(`no github for ${data.github}`);
				return null;
			}

			data.avatarUrl = github.avatarUrl;

			data.teams = teamsDict[data.github.toLowerCase()] || [];

			if (!data.name) {
				data.name = github.name || github.login;
			}

			if (!data.bio) {
				data.bio = sanitizeHtml(github.bioHTML);
			} else {
				data.bio = await parseMarkdown(data.bio);
			}

			if (!data.mainUrl) {
				if (github.websiteUrl) {
					data.mainUrl =
						github.websiteUrl.slice(0, 4) !== 'http'
							? `https://${github.websiteUrl}`
							: github.websiteUrl;
				} else {
					data.mainUrl = github.url;
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

			data.accounts = data.accounts
				.map((account) => {
					switch (account.type) {
						case 'github':
							if (!account.username) {
								return {};
							}
							return {
								...account,
								Icon: 'GitHub',
								url: `https://github.com/${account.username}`,
								title: `${data.name} on GitHub`,
							};

						case 'linkedin':
							if (!account.username) {
								return {};
							}
							return {
								...account,
								Icon: 'LinkedIn',
								url: `https://www.linkedin.com/in/${account.username}`,
								title: `${data.name} on LinkedIn`,
							};

						case 'dev':
							if (!account.username) {
								return {};
							}
							return {
								...account,
								Icon: 'Dev',
								url: `https://dev.to/${account.username}`,
								title: `${data.name} on DEV.to`,
							};

						case 'codenewbie':
							if (!account.username) {
								return {};
							}
							return {
								...account,
								Icon: 'Codenewbie',
								url: `https://community.codenewbie.org/${account.username}`,
								title: `${data.name} on CodeNewbie Community`,
							};

						case 'twitter':
							if (!account.username) {
								return {};
							}
							return {
								...account,
								Icon: 'Twitter',
								url: `https://twitter.com/${account.username}`,
								title: `${data.name} on Twitter`,
							};

						case 'twitch':
							if (!account.username) {
								return {};
							}
							return {
								...account,
								Icon: 'Twitch',
								url: `https://www.twitch.tv/${account.username}`,
								title: `${data.name} on Twitch`,
							};

						case 'polywork':
							if (!account.username) {
								return {};
							}
							return {
								...account,
								Icon: 'Polywork',
								url: `https://polywork.com/${account.username}`,
								title: `${data.name} on Polywork`,
							};

						case 'medium':
							if (!account.username) {
								return {};
							}
							return {
								...account,
								Icon: 'Medium',
								url: `https://medium.com/@${account.username}`,
								title: `${data.name} on Medium`,
							};

						case 'hashnode':
							if (!account.username) {
								return {};
							}
							return {
								...account,
								Icon: 'HashNode',
								url: `https://hashnode.com/@${account.username}`,
								title: `${data.name} on HashNode`,
							};

						case 'youtube':
							if (!account.channelId && !account.customUrl) {
								return {};
							}
							return {
								...account,
								Icon: 'YouTube',
								url: account.customUrl
									? account.customUrl
									: `https://www.youtube.com/channel/${account.channelId}`,
								title: `${data.name} on YouTube`,
							};

						default:
							return {
								...account,
								Icon: 'Website',
								type: 'website',
								title: account.title || account.url,
							};
					}
				})
				.filter((account) => !!account.url);

			return data;
		};

		const filteredCore = await Promise.all(core.map(fixupData));
		const filteredMembers = await Promise.all(members.map(fixupData));
		return {
			core: filteredCore.filter(Boolean),
			members: filteredMembers.filter(Boolean),
		};
	},
};
