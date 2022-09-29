import type { MemberObject } from '../types';

export const abbeyperini: MemberObject = {
	// GitHub username (required)
	github: 'abbeyperini',
	//
	// Everything below here is optional. By default, we pull most profile data from your GitHub profile. You can override that data here, as well as provide some additional account links below.
	//
	// Name - If not defined here, it will default to your display name on GitHub. If that's not defined, then your GitHub username.
	// name: 'Your Name',
	//
	// Main URL - If not defined here, it will default to the website displayed on your GitHub profile. If that's not defined, then a link to your GitHub profile will be displayed.
	mainUrl: 'https://abbeyperini.dev',
	//
	// Bio - Accepts [markdown](https://spec.commonmark.org/0.30/). Please keep your bio to a reasonable length. Refer to our [members page](https://virtualcoffee.io/members/) for examples.
	bio: `A full-stack web developer, crafter, blogger, fiber artist, cosplayer, yoga teacher, and gamer with years of recruiting industry experience.`,
	//
	// Links - You can add one of each type, except website - you can add as many `website` accounts as you wish.
	accounts: [
		{ type: 'linkedin', username: 'abigail-perini' },
		{ type: 'dev', username: 'abbeyperini' },
		// { type: 'codenewbie', username: 'yourUserName' },
		{ type: 'twitter', username: 'abbeyperini' },
		// { type: 'twitch', username: 'yourUserName' },
		// { type: 'youtube', channelId: 'yourChannelId' }, OR { type: 'youtube', customUrl: 'https://www.youtube.com/c/yourCustomUrl' },
		{ type: 'polywork', username: 'abbeyperini' },
		{ type: 'medium', username: 'abbeyperini' },
		{ type: 'hashnode', username: 'abbeyperini' },
		// { type: 'website', url: 'https://virtualcoffee.io', title: 'Title of link' },
	],
};
