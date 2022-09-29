import type { MemberObject } from '../types';

export const JesseRWeigel: MemberObject = {
	// GitHub username (required)
	github: 'JesseRWeigel',
	//
	// Everything below here is optional. By default, we pull most profile data from your GitHub profile. You can override that data here, as well as provide some additional account links below.
	//
	// Name - If not defined here, it will default to your display name on GitHub. If that's not defined, then your GitHub username.
	name: 'Jesse Weigel',
	//
	// Main URL - If not defined here, it will default to the website displayed on your GitHub profile. If that's not defined, then a link to your GitHub profile will be displayed.
	// mainUrl: 'https://virtualcoffee.io',
	//
	// Bio - Accepts [markdown](https://spec.commonmark.org/0.30/). Please keep your bio to a reasonable length. Refer to our [members page](https://virtualcoffee.io/members/) for examples.
	bio: `Front End Engineer working with React and React Native! ...and yes I am related to Bekah ;)`,
	//
	// Links - You can add one of each type, except website - you can add as many `website` accounts as you wish.
	accounts: [
		{ type: 'linkedin', username: 'yourlinkedinUserName' },
		{ type: 'dev', username: 'jesserweigel' },
		// { type: 'codenewbie', username: 'yourUserName' },
		{ type: 'twitter', username: 'JesseRWeigel' },
		{ type: 'twitch', username: 'jesserweigel' },
		{ type: 'youtube', channelId: 'UCUGkNhK8IEUj8A0vbyJ1Bzw' },
		{ type: 'polywork', username: 'jesseweigel' },
		// { type: 'medium', username: 'yourUserName' },
		{ type: 'hashnode', username: 'JesseRWeigel' },
		// { type: 'website', url: 'https://virtualcoffee.io', title: 'Title of link' },
	],
};
