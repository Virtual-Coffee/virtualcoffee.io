module.exports = {
	// github username: required
	github: 'abbeyperini',
	//
	// everything below here is optional. by default, we pull most profile data from your github profile.
	// you can override that data here, as well as provide some additional account links below
	//
	// name - if not defined here, will default to your Name on github if defined, if not, then your username
	// name: 'Your Name',
	//
	// mainUrl: the url your name links to on the members page. defaults to your github profile
	mainUrl: 'https://abbeyperini.dev',
	//
	// bio - accepts markdown.
	bio: `A full-stack web developer, crafter, blogger, fiber artist, cosplayer, yoga teacher, and gamer with years of recruiting industry experience.`,
	//
	// can take  one of each type except website - you can add as many `website` accounts as you wish
	accounts: [
		{ type: 'linkedin', username: 'abigail-perini' },
		{ type: 'dev', username: 'abbeyperini' },
		// { type: 'codenewbie', username: 'yourUserName' },
		{ type: 'twitter', username: 'abbeyperini' },
		// { type: 'twitch', username: 'yourUserName' },
		// { type: 'youtube', channelId: 'yourChannelId' }, // or { type: 'youtube', customUrl: 'https://www.youtube.com/c/yourCustomUrl' }
		{ type: 'polywork', username: 'abbeyperini' },
		{ type: 'medium', username: 'abbeyperini' },
		{ type: 'hashnode', username: 'abbeyperini' },
		// { type: 'website', url: 'https://virtualcoffee.io', title: 'Title of link' },
	],
};
