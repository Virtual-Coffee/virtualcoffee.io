import type { MemberObject } from '../types';

export const toddlibby: MemberObject = {
	// GitHub username (required)
	github: 'colabottles',
	//
	// Everything below here is optional. By default, we pull most profile data from your GitHub profile. You can override that data here, as well as provide some additional account links below.
	//
	// Name - If not defined here, it will default to your display name on GitHub. If that's not defined, then your GitHub username.
	// name: 'Your Name',
	//
	// Main URL - If not defined here, it will default to the website displayed on your GitHub profile. If that's not defined, then a link to your GitHub profile will be displayed.
	// mainUrl: 'https://virtualcoffee.io',
	//
	// Bio - Accepts [markdown](https://spec.commonmark.org/0.30/). Please keep your bio to a reasonable length. Refer to our [members page](https://virtualcoffee.io/members/) for examples. Please keep your bio to a reasonable length, refer to
	// [members page](https://virtualcoffee.io/members/) for examples
	// bio: `This is _my_ **bio** and [here is a link](https://virtualcoffee.io)`,
	//
	// Links - You can add one of each type, except website - you can add as many `website` accounts as you wish.
	accounts: [
		{ type: 'linkedin', username: 'todd-libby' },
		{ type: 'dev', username: 'colabottles' },
		{ type: 'codenewbie', username: 'colabottles' },
		{ type: 'twitter', username: 'toddlibby' },
		{ type: 'twitch', username: 'toddlibby' },
		{ type: 'youtube', customUrl: 'https://www.youtube.com/c/FrontEndNerdery' },
		{ type: 'polywork', username: 'colabottles' },
		// { type: 'medium', username: 'yourUserName' },
		// { type: 'hashnode', username: 'yourUserName' },
		{ type: 'website', url: 'https://toddl.dev', title: 'Todd Libby' },
	],
};
