module.exports = {
	// github username: required
	github: 'colabottles',
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
	// bio - accepts markdown. Please keep your bio to a reasonable length, refer to
	// [members page](https://virtualcoffee.io/members/) for examples
	// bio: `This is _my_ **bio** and [here is a link](https://virtualcoffee.io)`,
	//
	// can take  one of each type except website - you can add as many `website` accounts as you wish
	accounts: [
		{ type: 'linkedin', username: 'todd-libby' },
		{ type: 'dev', username: 'colabottles' },
		{ type: 'codenewbie', username: 'colabottles' },
		{ type: 'twitter', username: 'toddlibby' },
		{ type: 'twitch', username: 'toddlibby' },
		{ type: 'youtube', channelId: 'FrontEndNerdery' }, // or { type: 'youtube', customUrl: 'https://www.youtube.com/c/FrontEndNerdery' }
		{ type: 'polywork', username: 'colabottles' },
		// { type: 'medium', username: 'yourUserName' },
		// { type: 'hashnode', username: 'yourUserName' },
		{ type: 'website', url: 'https://toddl.dev', title: 'Todd Libby' },
	],
};
