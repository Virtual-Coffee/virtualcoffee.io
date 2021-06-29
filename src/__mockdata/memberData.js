const members = require('../_data/members/members.json');
const core = require('../_data/members/core.json');
const faker = require('faker');

const teamsDict = {};
const teamsData = require('../_data/members/teams.json');

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

module.exports = [...core, ...members].reduce((obj, username) => {
  const bio = faker.lorem.sentences(2);
  return {
    ...obj,
    [username]: {
      login: username,
      id: faker.datatype.uuid(),
      url: `https://github.com/${username}`,
      avatarUrl: faker.image.avatar(),
      name: faker.name.findName(),
      company: faker.company.companyName(),
      location: faker.address.cityName(),
      isHireable: faker.datatype.boolean(),
      bio: bio,
      bioHTML: `<div>${bio}</div>`,
      twitterUsername: faker.internet.userName(),
      websiteUrl: faker.internet.url(),
      teams: teamsDict[username.toLowerCase()] || [],
    },
  };
}, {});
