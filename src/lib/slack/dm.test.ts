import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

const conversationsOpen = vi.hoisted(() => vi.fn());
const chatPostMessage = vi.hoisted(() => vi.fn());

vi.mock('@slack/web-api', () => ({
	WebClient: vi.fn().mockImplementation(function () {
		return {
			conversations: { open: conversationsOpen },
			chat: { postMessage: chatPostMessage },
		};
	}),
}));

import { grantDmMessage, sendSlackDm } from './dm';

describe('sendSlackDm', () => {
	beforeEach(() => {
		conversationsOpen.mockReset();
		chatPostMessage.mockReset();
		// Live sending is production only (docs/adr/0013), same as notifySlack().
		vi.stubEnv('CONTEXT', 'production');
		vi.stubEnv('NOTIFY_LIVE_OUTSIDE_PRODUCTION', undefined);
		vi.stubEnv('SLACK_BOT_TOKEN', 'xoxb-test');
	});

	afterEach(() => {
		vi.unstubAllEnvs();
	});

	test('outside production the DM is captured before the token is even read', async () => {
		vi.stubEnv('CONTEXT', 'deploy-preview');
		vi.stubEnv('SLACK_BOT_TOKEN', undefined);
		const info = vi.spyOn(console, 'info').mockImplementation(() => {});

		await expect(sendSlackDm('U123', 'hi')).resolves.toEqual({
			ok: true,
			message: 'Captured, not sent to Slack (deploy-preview).',
		});
		expect(conversationsOpen).not.toHaveBeenCalled();
		// On a deploy the text is not logged (outbound.test.ts has the shape).
		expect(info).toHaveBeenCalledWith('[slack captured] deploy-preview U123');
		info.mockRestore();
	});

	test('a missing bot token is a skip, not an error, and nothing is opened', async () => {
		vi.stubEnv('SLACK_BOT_TOKEN', undefined);

		await expect(sendSlackDm('U123', 'hi')).resolves.toEqual({
			ok: false,
			message: 'SLACK_BOT_TOKEN is not set, so no DM was sent.',
		});
		expect(conversationsOpen).not.toHaveBeenCalled();
	});

	test('opens a DM with the member and posts the text to it', async () => {
		conversationsOpen.mockResolvedValue({ channel: { id: 'D123' } });
		chatPostMessage.mockResolvedValue({ ok: true });

		await expect(sendSlackDm('U123', 'hi')).resolves.toEqual({
			ok: true,
			message: 'DM sent.',
		});
		expect(conversationsOpen).toHaveBeenCalledWith({ users: 'U123' });
		expect(chatPostMessage).toHaveBeenCalledWith({
			channel: 'D123',
			text: 'hi',
		});
	});

	test('a conversation with no channel id is reported, not silently dropped', async () => {
		conversationsOpen.mockResolvedValue({ channel: undefined });

		await expect(sendSlackDm('U123', 'hi')).resolves.toEqual({
			ok: false,
			message: 'Could not open a DM with that Slack member.',
		});
		expect(chatPostMessage).not.toHaveBeenCalled();
	});

	test('a Slack API failure returns rather than throws', async () => {
		conversationsOpen.mockRejectedValue(new Error('invalid_auth'));

		await expect(sendSlackDm('U123', 'hi')).resolves.toEqual({
			ok: false,
			message: 'Could not reach Slack: invalid_auth',
		});
	});
});

describe('grantDmMessage', () => {
	test('a role grant links to /admin', () => {
		const text = grantDmMessage({ roles: ['coc_reviewer'] });
		expect(text).toContain('*CoC reviewer*');
		expect(text).toMatch(/\/admin$/);
		expect(text).not.toContain('/invites');
	});

	test('a volunteer-only grant links to /invites', () => {
		const text = grantDmMessage({ roles: ['volunteer'] });
		expect(text).toContain('*Volunteer*');
		expect(text).toMatch(/\/invites$/);
	});

	test('a bootstrap admin who also holds volunteer still links to /admin', () => {
		const text = grantDmMessage({ roles: ['admin', 'volunteer'] });
		expect(text).toContain('*Admin, Volunteer*');
		expect(text).toMatch(/\/admin$/);
	});
});
