import type { MemberObject } from '../types';
import { profileMasks } from '../flare';

export const FrancisTRdev: MemberObject = {
	github: 'FrancisTRdev',
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
	],
	badges: [],
};
