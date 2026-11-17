import type { MemberObject } from '../types';
import { profileMasks } from '../flare';

export const damonholden: MemberObject = {
	github: 'damonholden',
	name: 'Damon Holden',
	bio: `Developer @ BT. Learning. Building. Stand to be wrong.`,
	flare: {
		profileMask: profileMasks.circle,
	},
	accounts: [
		{ type: 'linkedin', username: 'damonholden' },
		{ type: 'dev', username: 'damonholden' },
		// { type: 'codenewbie', username: 'yourUserName' },
		{ type: 'twitter', username: 'damonholden_' },
		// { type: 'twitch', username: 'yourUserName' },
		// { type: 'youtube', channelId: 'yourChannelId' }, OR { type: 'youtube', customUrl: 'https://www.youtube.com/c/yourCustomUrl' },
		// { type: 'medium', username: 'yourUserName' },
		// { type: 'hashnode', username: 'yourUserName' },
	],
	badges: [],
};
