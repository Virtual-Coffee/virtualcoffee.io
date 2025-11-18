import type { MemberObject } from '../types';
// import { profileMasks } from '../flare';

// Change _EXAMPLE to `yourGitHubUserName` and add your info below
export const willrosenberg: MemberObject = {
	// GitHub username (required)
	github: 'will-rosenberg',
	//
	// Everything below here is optional. By default, we pull most profile data from your GitHub profile. You can override that data here, as well as provide some additional account links below.
	//
	// Name - If not defined here, it will default to your display name on GitHub. If that's not defined, then your GitHub username.
	// name: 'Your Name',
	// Emoji - If you want an emoji to appear next to your name, you can add it here. Please only use standard unicode emojis - maintainers will reject PRs otherwise.
	// emoji: '👩‍💻',
	//
	// Main URL - If not defined here, it will default to the website displayed on your GitHub profile. If that's not defined, then a link to your GitHub profile will be displayed.
	// mainUrl: 'https://virtualcoffee.io',
	//
	// Bio - Accepts [markdown](https://spec.commonmark.org/0.30/). Please keep your bio to a reasonable length. Refer to our [members page](https://virtualcoffee.io/members/) for examples.
	bio: `Accent coach & full-stack engineer. Founded [Simple American Accent](https://instagram.com/SimpleAmericanAccent) in 2018. 20+ paid users of my [full-stack American accent web app](https://williamrosenberg.com). React, Node, Postgres.`,
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
		profileMask: profileMasks.circle,
	},
	//
	// Links - You can add one of each type, except website - you can add as many `website` accounts as you wish.
	accounts: [
		{ type: 'linkedin', username: 'will-rosenberg' },
		// { type: 'dev', username: 'yourUserName' },
		// { type: 'codenewbie', username: 'yourUserName' },
		// { type: 'twitter', username: 'yourUserName' },
		// { type: 'twitch', username: 'yourUserName' },
		// { type: 'youtube', channelId: 'yourChannelId' }, OR { type: 'youtube', customUrl: 'https://www.youtube.com/c/yourCustomUrl' },
		// { type: 'polywork', username: 'yourUserName' },
		// { type: 'medium', username: 'yourUserName' },
		// { type: 'hashnode', username: 'yourUserName' },
		// { type: 'mastodon', url: 'https://mastodon.server/@username' },
		{
			type: 'website',
			url: 'https://instagram.com/SimpleAmericanAccent',
			title: 'IG: Simple American Accent (200k+ followers)',
		},
	],
	badges: [],
	// Add your location to our member map at https://virtualcoffee.io/members (optional)
	// Feel free to be as specific or vague as you're comfortable with.
	// Use this handy website to find your latitude and longitude: https://www.latlong.net/
	location: {
		latitude: 41.893917,
		longitude: -87.624645,
		title: 'Chicago, IL', // optional
	},
};
