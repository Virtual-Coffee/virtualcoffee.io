const { GraphQLClient, gql } = require('graphql-request');
require('dotenv').config();
const fetch = require('node-fetch');
var fs = require('fs');
const path = require('path');
const { AssetCache } = require('@11ty/eleventy-cache-assets');
const mockMemberData = require('../../__mockdata/memberData');

module.exports = async function () {
  let headers = new fetch.Headers({
    Accept: 'application/vnd.github.v3+json',
  });

  const token = process.env.GITHUB_TOKEN;

  if (token) {
    headers.set('Authorization', 'bearer ' + token);
  } else {
    return mockMemberData;
  }

  try {
    // // Pass in your unique custom cache key
    // // (normally this would be tied to your API URL)
    let asset = new AssetCache('vc_members_1.3');

    // // check if the cache is fresh within the last day
    if (asset.isCacheValid('1d')) {
      // return cached data.
      return asset.getCachedValue(); // a promise
    }

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

    const memberData = {};
    const membersdata = JSON.parse(
      fs.readFileSync(path.resolve(__dirname, 'members.json'), 'utf8')
    );

    const coredata = JSON.parse(
      fs.readFileSync(path.resolve(__dirname, 'core.json'), 'utf8')
    );

    const data = [...coredata, ...membersdata];

    const queries = [];

    let i,
      j,
      chunk = 15;
    for (i = 0, j = data.length; i < j; i += chunk) {
      queries.push(
        `${data
          .slice(i, i + chunk)
          .map((username) => `user:${username}`)
          .join(' ')}`
      );
    }

    for (let i = 0; i < queries.length; i++) {
      const response = await graphQLClient.request(query, {
        searchQuery: queries[i],
      });

      response.search.nodes.forEach((user) => {
        memberData[user.login.toLowerCase()] = {
          ...user,
          teams: teamsDict[user.login.toLowerCase()] || [],
        };
      });
    }

    await asset.save(memberData, 'json');

    return memberData;
  } catch (error) {
    console.log('Error loading github member data, using fake data instead');
    return mockMemberData;
  }
};
