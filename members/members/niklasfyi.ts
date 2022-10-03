import type { MemberObject } from '../types';

export const niklasfyi: MemberObject = {
	// GitHub username (required)
	github: 'niklasfyi',
	//
	// Everything below here is optional. By default, we pull most profile data from your GitHub profile. You can override that data here, as well as provide some additional account links below.
	//
	// Name - If not defined here, it will default to your display name on GitHub. If that's not defined, then your GitHub username.
	name: 'Niklas Resch',
	//
	// Main URL - If not defined here, it will default to the website displayed on your GitHub profile. If that's not defined, then a link to your GitHub profile will be displayed.
	// mainUrl: 'https://virtualcoffee.io',
	//
	// Bio - Accepts [markdown](https://spec.commonmark.org/0.30/). Please keep your bio to a reasonable length. Refer to our [members page](https://virtualcoffee.io/members/) for examples.
	bio: `Software Engineer @ LeanIX - Hobby photographer and dog owner`,
	//
	// Links - You can add one of each type, except website - you can add as many `website` accounts as you wish.
	accounts: [
		{ type: 'linkedin', username: 'niklas-💻-resch-70448455' },
		{ type: 'dev', username: 'niklasfyi' },
		// { type: 'codenewbie', username: 'yourUserName' },
		{ type: 'twitter', username: 'niklasfyi' },
		{ type: 'twitch', username: 'niklasfyi' },
		// { type: 'youtube', channelId: 'yourChannelId' }, OR { type: 'youtube', customUrl: 'https://www.youtube.com/c/yourCustomUrl' },
		{ type: 'polywork', username: 'niklasfyi' },
		// { type: 'medium', username: 'yourUserName' },
		// { type: 'hashnode', username: 'yourUserName' },
		// { type: 'website', url: 'https://virtualcoffee.io', title: 'Title of link' },
	],
};
