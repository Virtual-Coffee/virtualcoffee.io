import type { MemberObject } from '../types';
import { profileMasks } from '../flare';

export const michaeljolley: MemberObject = {
	github: 'michaeljolley',
	flare: {
		profileMask: profileMasks.circle,
	},
	accounts: [
		{ type: 'linkedin', username: 'michaelwjolley' },
		{ type: 'dev', username: 'michaeljolley' },
		{ type: 'twitter', username: 'michaeljolley' },
		{ type: 'twitch', username: 'baldbeardedbuilder' },
		{
			type: 'youtube',
			customUrl: 'https://www.youtube.com/c/baldbeardedbuilder',
		},
	],
	badges: ['Hacktoberfest2023'],
};
