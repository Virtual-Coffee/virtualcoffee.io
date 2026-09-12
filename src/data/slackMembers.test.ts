import { describe, expect, test } from 'vitest';

import { filterSlackMembers, type SlackMember } from './slackMembers';

const members: SlackMember[] = [
	{ id: 'U1', name: 'Grace Hopper', displayName: 'Grace', handle: 'ghopper' },
	{ id: 'U2', name: 'Ada Lovelace', displayName: 'Ada', handle: 'ada' },
	{ id: 'U3', name: 'Alan Turing', displayName: 'Alan', handle: 'turing' },
];

describe('filterSlackMembers', () => {
	test('matches any of the three names, ignoring case and padding', () => {
		expect(filterSlackMembers(members, '  HOPPER ').map((m) => m.id)).toEqual([
			'U1',
		]);
		expect(filterSlackMembers(members, 'a').map((m) => m.id)).toEqual([
			'U1',
			'U2',
			'U3',
		]);
		expect(filterSlackMembers(members, 'turing')[0]?.id).toBe('U3');
	});

	test('an empty query is everyone, capped', () => {
		expect(filterSlackMembers(members, '')).toHaveLength(3);
		expect(filterSlackMembers(members, '', 2)).toHaveLength(2);
	});
});
