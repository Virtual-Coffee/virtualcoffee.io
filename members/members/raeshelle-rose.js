module.exports = {
	// GitHub username (required)
	github: 'raeplusplus',
	//
	// Everything below here is optional. By default, we pull most profile data from your GitHub profile. You can override that data here, as well as provide some additional account links below.
	//
	// Name - If not defined here, it will default to your display name on GitHub. If that's not defined, then your GitHub username.
	name: 'Raeshelle Rose',
	//
	// Main URL - If not defined here, it will default to the website displayed on your GitHub profile. If that's not defined, then a link to your GitHub profile will be displayed.
	mainUrl: 'https://raeshellerose.netlify.app',
	//
	// Bio - Accepts [markdown](https://spec.commonmark.org/0.30/). Please keep your bio to a reasonable length. Refer to our [members page](https://virtualcoffee.io/members/) for examples.
	bio: ` 🌹 | software engineer | game dev for environmental change & social good 🌿🌎🦋 | fantasy writer for fun`,
	//
	// Links - You can add one of each type, except website - you can add as many `website` accounts as you wish.
	accounts: [
		{ type: 'linkedin', username: 'raeshellerose' },
		{ type: 'dev', username: 'raeplusplus' },
		// { type: 'codenewbie', username: 'yourUserName' },
		{ type: 'twitter', username: 'raeplusplus' },
		{ type: 'twitch', username: 'raeplusplus' },
		// { type: 'youtube', channelId: 'yourChannelId' }, OR
		{
			type: 'youtube',
			customUrl: 'https://www.youtube.com/channel/UC-FknvQZklUcLAfSNrRbzhw',
		},
		// { type: 'polywork', username: 'yourUserName' },
		// { type: 'medium', username: 'yourUserName' },
		// { type: 'hashnode', username: 'yourUserName' },
		{
			type: 'website',
			url: 'https://raeshellerose.netlify.app',
			title: 'Portfolio',
		},
	],
};
