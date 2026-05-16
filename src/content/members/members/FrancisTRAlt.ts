import type { MemberObject } from '../types';
import { profileMasks } from '../flare';

export const FrancisTRAlt: MemberObject = {
	github: 'FrancisTRAlt',
	name: 'Francis Tran',
	emoji: '👩‍💻',
	mainUrl: 'https://dev.to/francistrdev',
	bio: `Full-Stack Developer and Open Source Contributor to Forem (Dev.to) and Virtual Coffee!`,
	flare: {
		profileMask: profileMasks.octogon,
	},
	accounts: [
		// { type: 'linkedin', username: 'yourlinkedinUserName' },
		{ type: 'dev', username: 'francistrdev' },
		{ type: 'website', url: 'https://francistr.github.io', title: 'Portfolio' },
	],
	badges: [],
};
