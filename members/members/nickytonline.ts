import type { MemberObject } from '../types';

export const nickytonline: MemberObject = {
	// GitHub username (required)
	github: 'nickytonline',
	//
	// Everything below here is optional. By default, we pull most profile data from your GitHub profile. You can override that data here, as well as provide some additional account links below.
	//
	// Name - If not defined here, it will default to your display name on GitHub. If that's not defined, then your GitHub username.
	name: 'Nick Taylor',
	//
	// Main URL - If not defined here, it will default to the website displayed on your GitHub profile. If that's not defined, then a link to your GitHub profile will be displayed.
	mainUrl: 'https://iamdeveloper.com',
	//
	// Bio - Accepts [markdown](https://spec.commonmark.org/0.30/). Please keep your bio to a reasonable length. Refer to our [members page](https://virtualcoffee.io/members/) for examples.
	// bio: `This is _my_ **bio** and [here is a link](https://virtualcoffee.io)`,
	//
	// Links - You can add one of each type, except website - you can add as many `website` accounts as you wish.
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
