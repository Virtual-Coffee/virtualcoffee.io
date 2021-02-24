const { GraphQLClient, gql } = require('graphql-request');
require('dotenv').config();
const fetch = require('node-fetch');
var fs = require('fs');
const path = require('path');

async function main() {
  let headers = new fetch.Headers({
    Accept: 'application/vnd.github.v3+json',
  });

  const token = process.env.GITHUB_TOKEN;

  if (token) {
    headers.set('Authorization', 'bearer ' + token);
  }

  const graphQLClient = new GraphQLClient('https://api.github.com/graphql', {
    headers,
  });

  const query = gql`
    query($searchQuery: String!) {
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

  const memberData = {};
  const data = JSON.parse(
    fs.readFileSync(
      path.resolve(__dirname, '../', 'src', '_data', 'members', 'members.json'),
      'utf8'
    )
  );

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
    try {
      const response = await graphQLClient.request(query, {
        searchQuery: queries[i],
      });

      response.search.nodes.forEach((user) => {
        memberData[user.login.toLowerCase()] = user;
      });
    } catch (e) {
      console.log(e.message);
      console.warn(
        `Unable to fetch data for chunk ${i}, skipping and moving on!`,
        `query: ${queries[i]}`
      );
    }
  }

  fs.writeFileSync(
    path.resolve(
      __dirname,
      '../',
      'src',
      '_data',
      'members',
      'memberData.json'
    ),
    JSON.stringify(memberData, null, 2)
  );
}

main().catch((error) => console.error(error));
