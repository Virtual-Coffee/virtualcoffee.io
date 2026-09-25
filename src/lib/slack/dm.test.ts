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

import { WebClient } from '@slack/web-api';

import { grantDmMessage, sendSlackDm } from './dm';
import type { SectionBlock } from '@slack/types';

import type { SlackMessage } from './blocks';
import { buttonLinks } from '@/test/slack';
import { siteUrl } from '@/util/url.server';

const HI: SlackMessage = {
	text: 'hi',
	blocks: [{ type: 'section', text: { type: 'mrkdwn', text: '*hi*' } }],
};

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

		await expect(sendSlackDm('U123', HI)).resolves.toMatchObject({
			ok: true,
			warning: 'Captured, not sent as a Slack DM (deploy-preview).',
		});
		expect(conversationsOpen).not.toHaveBeenCalled();
		expect(info).toHaveBeenCalledWith(
			'[slack dm captured] deploy-preview U123',
			`\n${JSON.stringify(HI, null, 2)}`,
		);
		info.mockRestore();
	});

	test('the Slack-post opt-in does not opt a DM in: it is captured regardless', async () => {
		vi.stubEnv('CONTEXT', 'deploy-preview');
		vi.stubEnv('NOTIFY_LIVE_OUTSIDE_PRODUCTION', 'true');
		vi.spyOn(console, 'info').mockImplementation(() => {});

		await expect(sendSlackDm('U123', HI)).resolves.toMatchObject({
			ok: true,
			warning: 'Captured, not sent as a Slack DM (deploy-preview).',
		});
		expect(conversationsOpen).not.toHaveBeenCalled();
	});

	test('a missing bot token is a skip, not an error, and nothing is opened', async () => {
		vi.stubEnv('SLACK_BOT_TOKEN', undefined);

		await expect(sendSlackDm('U123', HI)).resolves.toEqual({
			ok: false,
			definitelyNotSent: true,
			message: 'SLACK_BOT_TOKEN is not set, so no DM was sent.',
		});
		expect(conversationsOpen).not.toHaveBeenCalled();
	});

	test('opens a DM with the member and posts the blocks and their fallback text to it', async () => {
		conversationsOpen.mockResolvedValue({ channel: { id: 'D123' } });
		chatPostMessage.mockResolvedValue({ ok: true });

		await expect(sendSlackDm('U123', HI)).resolves.toEqual({
			ok: true,
			message: 'DM sent.',
		});
		expect(WebClient).toHaveBeenCalledWith('xoxb-test', {
			timeout: 10_000,
			retryConfig: { retries: 0 },
		});
		expect(conversationsOpen).toHaveBeenCalledWith({ users: 'U123' });
		expect(chatPostMessage).toHaveBeenCalledWith({
			channel: 'D123',
			text: 'hi',
			blocks: HI.blocks,
		});
	});

	test('a conversation with no channel id is reported, not silently dropped', async () => {
		conversationsOpen.mockResolvedValue({ channel: undefined });

		await expect(sendSlackDm('U123', HI)).resolves.toEqual({
			ok: false,
			definitelyNotSent: true,
			message: 'Could not open a DM with that Slack member.',
		});
		expect(chatPostMessage).not.toHaveBeenCalled();
	});

	test('a Slack API failure returns rather than throws', async () => {
		conversationsOpen.mockRejectedValue(new Error('invalid_auth'));

		await expect(sendSlackDm('U123', HI)).resolves.toEqual({
			ok: false,
			definitelyNotSent: true,
			message: 'Could not reach Slack: invalid_auth',
		});
	});
});

describe('grantDmMessage', () => {
	const sentence = (message: SlackMessage) => {
		const [section] = message.blocks;
		return section?.type === 'section'
			? (section as SectionBlock).text?.text
			: undefined;
	};

	test('a role grant buttons a sign-in to /admin', () => {
		const message = grantDmMessage({ roles: ['coc_reviewer'] });
		expect(message.text).toBe(
			"You've been given access to Virtual Coffee's admin tools: CoC reviewer.",
		);
		expect(sentence(message)).toBe(
			"You've been given access to Virtual Coffee's admin tools: *CoC reviewer*. Sign in with Slack to activate it.",
		);
		expect(buttonLinks(message)).toEqual({
			'Sign in with Slack': `${siteUrl()}/admin`,
		});
	});

	test('a volunteer-only grant points at /invites', () => {
		const message = grantDmMessage({ roles: ['volunteer'] });
		expect(sentence(message)).toContain('Invites tools: *Volunteer*.');
		expect(buttonLinks(message)).toEqual({
			'Sign in with Slack': `${siteUrl()}/invites`,
		});
	});

	test('a bootstrap admin who also holds volunteer still points at /admin', () => {
		const message = grantDmMessage({ roles: ['admin', 'volunteer'] });
		expect(sentence(message)).toContain('*Admin, Volunteer*');
		expect(buttonLinks(message)).toEqual({
			'Sign in with Slack': `${siteUrl()}/admin`,
		});
	});

	test('a grant applied directly says the access is active and buttons the tools, not a sign-in', () => {
		const message = grantDmMessage({ roles: ['coc_reviewer'], active: true });
		expect(sentence(message)).toMatch(/\*CoC reviewer\*\. It's active now\.$/);
		expect(sentence(message)).not.toMatch(/sign in/i);
		expect(buttonLinks(message)).toEqual({
			'Open admin tools': `${siteUrl()}/admin`,
		});
		expect(
			buttonLinks(grantDmMessage({ roles: ['volunteer'], active: true })),
		).toEqual({ 'Open Invites': `${siteUrl()}/invites` });
	});
});
