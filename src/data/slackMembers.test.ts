import { afterEach, describe, expect, test, vi } from 'vitest';

const slack = vi.hoisted(() => ({ usersList: vi.fn() }));

vi.mock('@slack/web-api', () => ({
	WebClient: class {
		users = { list: slack.usersList };
	},
}));

import {
	fetchSlackMembers,
	filterSlackMembers,
	type SlackMember,
} from './slackMembers';

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

describe('fetchSlackMembers', () => {
	afterEach(() => {
		vi.unstubAllEnvs();
		slack.usersList.mockReset();
	});

	test('pages the workspace, drops who cannot claim a grant, and sorts by display name', async () => {
		vi.stubEnv('SLACK_BOT_TOKEN', 'xoxb-test');
		slack.usersList
			.mockResolvedValueOnce({
				members: [
					{ id: 'U_GONE', name: 'gone', real_name: 'Gone', deleted: true },
					{ id: 'U_BOT', name: 'bot', real_name: 'Bot', is_bot: true },
					{ id: 'U_GUEST', name: 'guest', is_restricted: true },
					{ id: 'U_SINGLE', name: 'single', is_ultra_restricted: true },
					{ id: 'USLACKBOT', name: 'slackbot', real_name: 'Slackbot' },
					{
						id: 'U_FULL',
						name: 'ghopper',
						real_name: 'Grace Hopper',
						profile: { display_name: 'Grace', real_name: 'Grace Hopper' },
					},
					// No display name: falls back to the real name.
					{ id: 'U_NO_DISPLAY', name: 'ada', profile: { real_name: 'Ada' } },
				],
				response_metadata: { next_cursor: 'page-2' },
			})
			.mockResolvedValueOnce({
				members: [
					// No real name anywhere: the handle stands in for both.
					{ id: 'U_HANDLE_ONLY', name: 'turing', profile: {} },
				],
				response_metadata: { next_cursor: '' },
			});

		const members = await fetchSlackMembers();

		expect(members).toEqual<SlackMember[]>([
			{ id: 'U_NO_DISPLAY', name: 'Ada', displayName: 'Ada', handle: 'ada' },
			{
				id: 'U_FULL',
				name: 'Grace Hopper',
				displayName: 'Grace',
				handle: 'ghopper',
			},
			{
				id: 'U_HANDLE_ONLY',
				name: 'turing',
				displayName: 'turing',
				handle: 'turing',
			},
		]);
		expect(slack.usersList).toHaveBeenCalledTimes(2);
		expect(slack.usersList).toHaveBeenLastCalledWith({
			limit: 200,
			cursor: 'page-2',
		});
	});
});
