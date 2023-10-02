import { Hacktoberfest2023 } from '~/svg/badges';
import type { MemberObject } from '../types';
// import { profileMasks } from '../flare';

export const _EXAMPLE: MemberObject = {
	// GitHub username (required)
	github: 'jamescurran',
	//
	// Everything below here is optional. By default, we pull most profile data from your GitHub profile. You can override that data here, as well as provide some additional account links below.
	//
	// Name - If not defined here, it will default to your display name on GitHub. If that's not defined, then your GitHub username.
	 name: 'James Curran',
	//
	// Main URL - If not defined here, it will default to the website displayed on your GitHub profile. If that's not defined, then a link to your GitHub profile will be displayed.
	// mainUrl: 'https://virtualcoffee.io',
	//
	// Bio - Accepts [markdown](https://spec.commonmark.org/0.30/). Please keep your bio to a reasonable length. Refer to our [members page](https://virtualcoffee.io/members/) for examples.
	 bio: "30+ years as a developer: Assembly, C, C++ and C# (in that order) with sidelines in ASP/VBScript, ASP.Net, JavaScript, Perl, VisualBasic, plus a few others which I'm not going to mention 'cuz if I did someone might ask me to use them again (shutter).", //   - Microsoft MVP in VC++ (1994-2004) - Occasional conference speaker. - Also Licensed Massage Therapist (NJ), award-winning theater impresario, gallery exhibited photographer and published playwright. (yeah, that's right. I'm a renaissance man!)"
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
		 { type: 'linkedin', username: 'jamesmcurran' },
		// { type: 'dev', username: 'yourUserName' },
		// { type: 'codenewbie', username: 'yourUserName' },
		 { type: 'twitter', username: 'zamescurran' },
		// { type: 'twitch', username: 'yourUserName' },
		// { type: 'youtube', channelId: 'yourChannelId' }, OR { type: 'youtube', customUrl: 'https://www.youtube.com/c/yourCustomUrl' },
		// { type: 'polywork', username: 'yourUserName' },
		// { type: 'medium', username: 'yourUserName' },
		// { type: 'hashnode', username: 'yourUserName' },
		{ type: 'website', url: 'https://noveltheory.com', title: 'Novel Theory.com (Resume/showcase)' },
		{ type: 'website', url: 'https://honestillusion.com', title: 'Honest Illusion.com (Tech blog)' },
	],
	badges: ['Hacktoberfest2023'],
    location: {
        latitute: 40.220825943631645, 
        longitude: -74.76004035318527,
        title: 'Trenton, NJ', // optional
      },
};
