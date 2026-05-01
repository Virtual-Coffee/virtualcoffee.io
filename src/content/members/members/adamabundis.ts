import type { MemberObject } from '../types';
import { profileMasks } from '../flare';

export const adamabundis: MemberObject = {
	github: 'adam-abundis',
	bio: `Returning dev making tech purposeful again. Frontend-focused | Accessibility | Unlearning spaghetti code in public.`,
	flare: {
		profileMask: profileMasks.circle,
	},
	accounts: [
		{ type: 'linkedin', username: 'adam-abundis' },
		{ type: 'dev', username: 'adamabundis' },
		{ type: 'twitter', username: 'adamabundis' },
	],
	badges: ['Hacktoberfest2022'],
};
