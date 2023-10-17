import type { MemberObject } from '../types';
// import { profileMasks } from '../flare';

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
	// flare - If you want to add a flare to your profile, you can do so here.
	// Uncomment the `import { profileMasks } from '../flare';` line at the top of this file to use the profileMasks.
	// So far  all we have is a profile mask, which makes your profile picture a different shape from the default square.
	// Leave this out if you prefer the default square.
	// You can choose from the following profile masks:
	// profileMasks.octogon, profileMasks.hexagon, profileMasks.triangle,
	// profileMasks.circle, profileMasks.rabbet, profileMasks.star
	// you can also use a custom string. the profileMask values are [css clipPath values](https://developer.mozilla.org/en-US/docs/Web/CSS/clip-path)
	flare: {
		// example:
		// profileMask: profileMasks.triangle,
	},
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
	badges: ['Hacktoberfest2022'],
};
