module.exports = {
	// github username: required
	github: 'andreamartz',
	//
	// everything below here is optional. by default, we pull most profile data from your github profile.
	// you can override that data here, as well as provide some additional account links below
	//
	// name - if not defined here, will default to your Name on github if defined, if not, then your username
	name: 'Andrea Martz',
	//
	// mainUrl: the url your name links to on the members page. defaults to your github profile
	// mainUrl: 'https://andreamartz.dev/',
	//
	// bio - accepts markdown.
	bio: `Full-stack dev | Avid learner | Passionate about education and equity & using tech to make it happen`,
	//
	// can take  one of each type except website - you can add as many `website` accounts as you wish
	accounts: [
		{ type: 'linkedin', username: 'andreamartz' },
		// { type: 'dev', username: 'yourUserName' },
		// { type: 'codenewbie', username: 'yourUserName' },
		{ type: 'twitter', username: 'amartzcoder' },
		// { type: 'twitch', username: 'yourUserName' },
		// { type: 'youtube', channelId: 'yourChannelId' }, // or { type: 'youtube', customUrl: 'https://www.youtube.com/c/yourCustomUrl' }
		// { type: 'polywork', username: 'yourUserName' },
		// { type: 'medium', username: 'yourUserName' },
		// { type: 'hashnode', username: 'yourUserName' },
		{
			type: 'website',
			url: 'https://andreamartz.dev/',
			title: "Andrea's Portfolio",
		},
	],
};
