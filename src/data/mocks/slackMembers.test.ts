import { describe, expect, test } from 'vitest';

import { createSlackMembers } from './slackMembers';

describe('createSlackMembers', () => {
	test('is the same directory on every call', () => {
		expect(createSlackMembers()).toEqual(createSlackMembers());
		expect(createSlackMembers(5)).toHaveLength(5);
	});

	test('ids look like Slack ids, so a Pending Grant on one can be claimed', () => {
		const members = createSlackMembers();
		expect(members.filter((m) => !/^U[A-Z0-9]{9}$/.test(m.id))).toEqual([]);
		expect(new Set(members.map((m) => m.id)).size).toBe(members.length);
	});

	test('is sorted by display name', () => {
		const names = createSlackMembers().map((m) => m.displayName);
		expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
	});
});
