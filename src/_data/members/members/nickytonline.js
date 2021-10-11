module.exports = {
	// github username: required
	github: 'nickytonline',
	//
	// everything below here is optional. by default, we pull most profile data from your github profile.
	// you can override that data here, as well as provide some additional account links below
	//
	// name - if not defined here, will default to your Name on github if defined, if not, then your username
	name: 'Nick Taylor',
	//
	// mainUrl: the url your name links to on the members page. defaults to your github profile
	mainUrl: 'https://iamdeveloper.com',
	//
	// bio - accepts markdown.
	// bio: `This is _my_ **bio** and [here is a link](https://virtualcoffee.io)`,
	//
	// can take  one of each type except website - you can add as many `website` accounts as you wish
	accounts: [
		// { type: 'linkedin', username: 'yourUserName' },
		{ type: 'dev', username: 'nickytonline' },
		{ type: 'codenewbie', username: 'nickytonline' },
		{ type: 'twitter', username: 'nickytonline' },
		{ type: 'twitch', username: 'nickytonline' },
		{ type: 'youtube', customUrl: 'https://youtube.iamdeveloper.com' },
		{ type: 'polywork', username: 'nickytonline' },
		// { type: 'medium', username: 'yourUserName' },
		{ type: 'hashnode', username: 'nickytonline' },
		{
			type: 'website',
			url: 'https://iamdeveloper.com',
			title: 'Just Some Dev',
		},
	],
};
