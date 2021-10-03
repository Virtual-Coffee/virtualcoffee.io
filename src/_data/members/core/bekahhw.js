module.exports = {
  // github username: required
  github: 'bekahhw',
  //
  // everything below here is optional. by default, we pull most profile data from your github profile.
  // you can override that data here, as well as provide some additional account links below
  //
  // name - if not defined here, will default to your Name on github if defined, if not, then your username
  // name: 'Your Name',
  //
  // mainUrl: the url your name links to on the members page. defaults to your github profile
  // mainUrl: 'https://virtualcoffee.io',
  //
  // bio - accepts markdown.
  // bio: `This is _my_ **bio** and [here is a link](https://virtualcoffee.io)`,
  //
  // can take  one of each type except website - you can add as many `website` accounts as you wish
  accounts: [
    { type: 'linkedin', username: 'bekah-hawrot-weigel' },
    { type: 'dev', username: 'bekahhw' },
    { type: 'codenewbie', username: 'bekahhw' },
    { type: 'twitter', username: 'bekahhw' },
    { type: 'twitch', username: 'bekahhw' },
    // { type: 'youtube', channelId: 'yourChannelId' }, // or { type: 'youtube', customUrl: 'https://www.youtube.com/c/yourCustomUrl' }
    { type: 'polywork', username: 'bekahhw' },
    // { type: 'hashnode', username: 'yourUserName' },
    {
      type: 'website',
      url: 'https://bekahhw.github.io',
      title: `Code. Community. Feelings. It's all here`,
    },
  ],
};
