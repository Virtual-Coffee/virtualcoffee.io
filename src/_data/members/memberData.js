const { GraphQLClient, gql } = require('graphql-request');
require('dotenv').config();
var fs = require('fs');
const path = require('path');
const { AssetCache } = require('@11ty/eleventy-cache-assets');
const mockMemberData = require('../../__mockdata/memberData');

module.exports = async function () {
  let headers = {
    Accept: 'application/vnd.github.v3+json',
  };

  const token = process.env.GITHUB_TOKEN;

  if (token) {
    headers.Authorization = 'bearer ' + token;
  } else {
    return mockMemberData;
  }

  try {
    // // Pass in your unique custom cache key
    // // (normally this would be tied to your API URL)
    let asset = new AssetCache('vc_members_1.3');

    // // check if the cache is fresh within the last day
    // if (asset.isCacheValid('0d')) {
    //   // return cached data.
    //   return asset.getCachedValue(); // a promise
    // }

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

    const teamsDict = {};
    const teamsData = JSON.parse(
      fs.readFileSync(path.resolve(__dirname, 'teams.json'), 'utf8')
    );

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

    const memberData = {
      members: fs
        .readdirSync(path.resolve(__dirname, 'members'))
        .map(function (filename) {
          return require(path.resolve(__dirname, 'members', filename));
        }),
      core: fs
        .readdirSync(path.resolve(__dirname, 'core'))
        .map(function (filename) {
          return require(path.resolve(__dirname, 'core', filename));
        })
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
        }),
    };

    const data = [...memberData.core, ...memberData.members];

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
          .join(' ')}`
      );
    }

    for (let i = 0; i < queries.length; i++) {
      const response = await graphQLClient.request(query, {
        searchQuery: queries[i],
      });

      response.search.nodes.forEach((user) => {
        githubData[user.login.toLowerCase()] = {
          ...user,
          teams: teamsDict[user.login.toLowerCase()] || [],
        };
      });
    }

    const fixupData = (data) => {
      const github = githubData[data.github];

      data.avatarUrl = github.avatarUrl;

      if (!data.name) {
        data.name = github.name || github.login;
      }

      if (!data.bio) {
        data.bio = github.bioHTML;
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
              return {
                ...account,
                url: `https://github.com/${account.username}`,
                title: `${data.name} on GitHub`,
              };

            case 'linkedin':
              return {
                ...account,
                url: `https://www.linkedin.com/in/${account.username}`,
                title: `${data.name} on LinkedIn`,
              };

            case 'dev':
              return {
                ...account,
                url: `https://dev.to/${account.username}`,
                title: `${data.name} on DEV.to`,
              };

            case 'codenewbie':
              return {
                ...account,
                url: `https://community.codenewbie.org/${account.username}`,
                title: `${data.name} on CodeNewbie Community`,
              };

            case 'twitter':
              return {
                ...account,
                url: `https://twitter.com/${account.username}`,
                title: `${data.name} on Twitter`,
              };

            case 'twitch':
              return {
                ...account,
                url: `https://www.twitch.tv/${account.username}`,
                title: `${data.name} on Twitch`,
              };

            case 'youtube':
              return {
                ...account,
                url: `https://www.youtube.com/channel/${account.channelId}`,
                title: `${data.name} on YouTube`,
              };

            default:
              return {
                ...account,
                type: 'website',
                title: account.title || account.url,
              };
          }
        })
        .filter((account) => !!account.url);

      return data;
    };

    memberData.core = memberData.core.map(fixupData);
    memberData.members = memberData.members.map(fixupData);

    await asset.save(memberData, 'json');
    console.log(memberData);
    return memberData;
  } catch (error) {
    console.log(error.message);
    console.log('Error loading github member data, using fake data instead');
    return mockMemberData;
  }
};
