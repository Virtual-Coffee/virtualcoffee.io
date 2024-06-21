import type { MemberObject } from '../types';
// import { profileMasks } from '../flare';

// Change _EXAMPLE to `yourGitHubUserName` and add your info below
export const eternalmaha: MemberObject = {
	// GitHub username (required)
	github: 'eternalmaha',

	// Name - If not defined here, it will default to your display name on GitHub. If that's not defined, then your GitHub username.
	 name: 'Maha Ahmed',
	//
	// Main URL - If not defined here, it will default to the website displayed on your GitHub profile. If that's not defined, then a link to your GitHub profile will be displayed.
	mainUrl: 'https://maha-ahmed.netlify.app/',
	//
	// Bio - Accepts [markdown](https://spec.commonmark.org/0.30/). Please keep your bio to a reasonable length. Refer to our [members page](https://virtualcoffee.io/members/) for examples.
	bio: `Software Engineer | Design | Community | Education | "The Eternal Now" [https://maha-ahmed.netlify.app]`,

	// Links - You can add one of each type, except website - you can add as many `website` accounts as you wish.
	accounts: [
		{ type: 'linkedin', username: 'www.linkedin.com/in/maha-ahmed3' },
		{ type: 'website', url: 'https://maha-ahmed.netlify.app', title: 'Portfolio for Maha Ahmed' },
	],
	badges: [],
};
