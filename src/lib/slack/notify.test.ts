import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import {
	applicationSubmittedMessage,
	cocReportMessage,
	coffeeTableGroupMessage,
	lunchAndLearnMessage,
	notifySlack,
	volunteerSignupMessage,
} from './notify';
import type { SlackMessage } from './blocks';
import { buttonLinks, container, notes, richTextFields } from '@/test/slack';

const HI: SlackMessage = {
	text: 'hi',
	blocks: [{ type: 'section', text: { type: 'mrkdwn', text: '*hi*' } }],
};

describe('notifySlack', () => {
	const fetch = vi.fn<typeof globalThis.fetch>();

	beforeEach(() => {
		vi.stubGlobal('fetch', fetch);
		fetch.mockReset();
		// Live posting is production only (docs/adr/0013).
		vi.stubEnv('CONTEXT', 'production');
		vi.stubEnv('NOTIFY_LIVE_OUTSIDE_PRODUCTION', undefined);
		vi.stubEnv('SLACK_WEBHOOK_COC', 'https://hooks.slack.test/coc');
		vi.stubEnv('SLACK_WEBHOOK_MEMBERSHIP', undefined);
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		vi.unstubAllEnvs();
	});

	test('outside production the post is captured before the webhook is even read', async () => {
		vi.stubEnv('CONTEXT', 'deploy-preview');
		const info = vi.spyOn(console, 'info').mockImplementation(() => {});

		await expect(notifySlack('membership', HI)).resolves.toMatchObject({
			ok: true,
			warning: 'Captured, not posted to Slack (deploy-preview).',
		});
		expect(fetch).not.toHaveBeenCalled();
		// The captured body is the payload itself, so the log shows what would
		// have been posted.
		expect(info).toHaveBeenCalledWith(
			'[slack captured] deploy-preview membership',
			`\n${JSON.stringify(HI, null, 2)}`,
		);
		info.mockRestore();
	});

	test('NOTIFY_LIVE_OUTSIDE_PRODUCTION=true posts for real from a preview', async () => {
		vi.stubEnv('CONTEXT', 'deploy-preview');
		vi.stubEnv('NOTIFY_LIVE_OUTSIDE_PRODUCTION', 'true');
		fetch.mockResolvedValue(new Response('ok', { status: 200 }));

		await expect(notifySlack('coc', HI)).resolves.toEqual({
			ok: true,
			message: 'Posted to Slack.',
		});
		expect(fetch).toHaveBeenCalledOnce();
	});

	test('a missing webhook is a skip, not an error, and nothing is fetched', async () => {
		await expect(notifySlack('membership', HI)).resolves.toEqual({
			ok: false,
			definitelyNotSent: true,
			message:
				'SLACK_WEBHOOK_MEMBERSHIP is not set, so nothing was posted to Slack.',
		});
		expect(fetch).not.toHaveBeenCalled();
	});

	test('posts the blocks and their fallback text to the channel’s own webhook, with unfurls off', async () => {
		fetch.mockResolvedValue(new Response('ok', { status: 200 }));
		await expect(notifySlack('coc', HI)).resolves.toEqual({
			ok: true,
			message: 'Posted to Slack.',
		});

		const [url, init] = fetch.mock.calls[0];
		expect(url).toBe('https://hooks.slack.test/coc');
		expect(init).toMatchObject({
			method: 'POST',
			headers: { 'content-type': 'application/json' },
		});
		expect(JSON.parse(String(init?.body))).toEqual({
			text: 'hi',
			blocks: HI.blocks,
			unfurl_links: false,
		});
		expect(init?.signal).toBeInstanceOf(AbortSignal);
	});

	test('a rejection carries Slack’s status and plain-text reason', async () => {
		fetch.mockResolvedValue(new Response('no_service', { status: 404 }));
		await expect(notifySlack('coc', HI)).resolves.toEqual({
			ok: false,
			definitelyNotSent: true,
			message: 'Slack rejected the message (404: no_service).',
		});
	});

	test('a network failure returns rather than throws', async () => {
		fetch.mockRejectedValue(new TypeError('fetch failed'));
		await expect(notifySlack('coc', HI)).resolves.toEqual({
			ok: false,
			definitelyNotSent: true,
			message: 'Could not reach Slack: fetch failed',
		});
	});
});

describe('the messages', () => {
	const ADMIN_URL = 'https://virtualcoffee.io/admin/submissions/volunteers/01';

	test('what a person typed is a literal run, not mrkdwn, so it cannot page the channel', () => {
		const message = volunteerSignupMessage({
			name: '<!channel>',
			email: 'a&b@example.test',
			position: '<https://evil.example|click>',
			adminUrl: ADMIN_URL,
		});
		expect(richTextFields(message)).toEqual({
			Name: '<!channel>',
			Email: 'a&b@example.test',
			Position: '<https://evil.example|click>',
		});
		expect(container(message)?.subtitle).toEqual({
			type: 'plain_text',
			text: '<https://evil.example|click>',
		});
		// Only the static copy is mrkdwn.
		expect(notes(message)).toEqual([]);
	});

	test('every post is one collapsible container with a primary button to the row', () => {
		const message = coffeeTableGroupMessage({
			name: 'Ada',
			email: 'ada@example.test',
			groupName: 'Rust After Hours',
			adminUrl: ADMIN_URL,
		});
		expect(message.text).toBe('New Coffee Table Group — Rust After Hours');
		expect(message.blocks).toEqual([
			{
				type: 'container',
				title: { type: 'plain_text', text: 'New Coffee Table Group' },
				subtitle: { type: 'plain_text', text: 'Rust After Hours' },
				is_collapsible: true,
				child_blocks: [
					{
						type: 'rich_text',
						elements: [
							{
								type: 'rich_text_section',
								elements: [
									{ type: 'text', text: 'Name: ', style: { bold: true } },
									{ type: 'text', text: 'Ada' },
								],
							},
							{
								type: 'rich_text_section',
								elements: [
									{ type: 'text', text: 'Email: ', style: { bold: true } },
									{ type: 'text', text: 'ada@example.test' },
								],
							},
							{
								type: 'rich_text_section',
								elements: [
									{ type: 'text', text: 'Group name: ', style: { bold: true } },
									{ type: 'text', text: 'Rust After Hours' },
								],
							},
						],
					},
					{
						type: 'actions',
						elements: [
							{
								type: 'button',
								text: { type: 'plain_text', text: 'View in admin' },
								url: ADMIN_URL,
								style: 'primary',
							},
						],
					},
				],
			},
		]);
	});

	test('a CoC report arrives collapsed, names nobody in its preview, and notes the file', () => {
		const message = cocReportMessage({
			name: 'Ada',
			email: 'ada@example.test',
			reporteeName: 'Someone',
			timeLocation: 'Tuesday coffee',
			hasAttachment: true,
			adminUrl: 'https://virtualcoffee.io/admin/submissions/coc/01',
		});
		expect(message.text).toBe('CoC Report Submitted');
		expect(container(message)).toMatchObject({
			title: { text: 'CoC Report Submitted' },
			subtitle: { text: 'Submitted by Ada · expand to view' },
			is_collapsible: true,
			default_collapsed: true,
		});
		expect(richTextFields(message)).toEqual({
			Name: 'Ada',
			Email: 'ada@example.test',
			'Reportee Name': 'Someone',
			'Time/Location': 'Tuesday coffee',
		});
		expect(notes(message)).toEqual([
			'_A file was attached; open the report to view it._',
		]);
		expect(buttonLinks(message)).toEqual({
			'View in admin': 'https://virtualcoffee.io/admin/submissions/coc/01',
		});
	});

	test('an anonymous CoC report says so instead of showing blanks', () => {
		const message = cocReportMessage({
			name: null,
			email: null,
			reporteeName: 'Someone',
			timeLocation: 'Slack',
			hasAttachment: false,
			adminUrl: 'https://virtualcoffee.io/admin/submissions/coc/01',
		});
		expect(container(message)?.subtitle?.text).toBe(
			'Submitted anonymously · expand to view',
		);
		expect(richTextFields(message)).toMatchObject({
			Name: '(anonymous)',
			Email: '(anonymous)',
		});
		expect(notes(message)).toEqual([]);
	});

	test('optional fields render as a dash, not as "null", and leave the subtitle off', () => {
		const signup = volunteerSignupMessage({
			name: 'Ada',
			email: 'ada@example.test',
			position: null,
			adminUrl: ADMIN_URL,
		});
		expect(signup.text).toBe('New Volunteer Form Submission');
		expect(container(signup)?.subtitle).toBeUndefined();
		expect(richTextFields(signup)).toMatchObject({ Position: '—' });

		const group = coffeeTableGroupMessage({
			name: 'Ada',
			email: 'ada@example.test',
			groupName: null,
			adminUrl: ADMIN_URL,
		});
		expect(richTextFields(group)).toMatchObject({ 'Group name': '—' });
	});

	test('a subtitle a person typed is clipped to what plain_text allows; the field keeps it whole', () => {
		const topic = 'x'.repeat(200);
		const message = lunchAndLearnMessage({
			name: 'Ada',
			email: 'ada@example.test',
			topic,
			issueUrl: null,
			adminUrl: ADMIN_URL,
		});
		expect(container(message)?.subtitle?.text).toBe(`${'x'.repeat(149)}…`);
		expect(richTextFields(message).Title).toBe(topic);
	});

	test('a Lunch & Learn message buttons the issue only when one was opened, after the admin link', () => {
		const idea = {
			name: 'Ada',
			email: 'ada@example.test',
			topic: 'Testing',
			adminUrl: ADMIN_URL,
		};
		expect(
			buttonLinks(lunchAndLearnMessage({ ...idea, issueUrl: null })),
		).toEqual({
			'View in admin': ADMIN_URL,
		});
		expect(
			Object.entries(
				buttonLinks(
					lunchAndLearnMessage({
						...idea,
						issueUrl: 'https://github.com/x/y/issues/1',
					}),
				),
			),
		).toEqual([
			['View in admin', ADMIN_URL],
			['GitHub issue', 'https://github.com/x/y/issues/1'],
		]);
	});

	test('a plain application is name, email, the link and the queue depth', () => {
		const message = applicationSubmittedMessage({
			name: 'Ada',
			email: 'ada@example.test',
			adminUrl: 'https://virtualcoffee.io/admin/waitlist/01',
			waitlistUrl: 'https://virtualcoffee.io/admin/waitlist',
			waiting: 14,
			invite: null,
		});
		expect(message.text).toBe('Application Received — Membership waitlist');
		expect(richTextFields(message)).toEqual({
			Name: 'Ada',
			Email: 'ada@example.test',
		});
		expect(buttonLinks(message)).toEqual({
			'View in admin': 'https://virtualcoffee.io/admin/waitlist/01',
		});
		expect(notes(message)).toEqual([
			'*14* waiting on a first decision · <https://virtualcoffee.io/admin/waitlist|Waitlist queue>',
		]);
		// The footer sits after the container, not inside it.
		expect(message.blocks.map((block) => block.type)).toEqual([
			'container',
			'context',
		]);
	});

	test('a queue depth that could not be read leaves the footer off', () => {
		const message = applicationSubmittedMessage({
			name: 'Ada',
			email: 'ada@example.test',
			adminUrl: 'https://virtualcoffee.io/admin/waitlist/01',
			waitlistUrl: 'https://virtualcoffee.io/admin/waitlist',
			waiting: null,
			invite: null,
		});
		expect(message.blocks.map((block) => block.type)).toEqual(['container']);
		expect(notes(message)).toEqual([]);
	});

	test('a claimed invite names the inviter and explains the priority', () => {
		const message = applicationSubmittedMessage({
			name: 'Ada',
			email: 'ada@example.test',
			adminUrl: 'https://virtualcoffee.io/admin/waitlist/01',
			waitlistUrl: 'https://virtualcoffee.io/admin/waitlist',
			waiting: 3,
			invite: { inviterName: 'Grace' },
		});
		expect(message.text).toBe(
			'Invited Application Received — Invited by Grace',
		);
		expect(richTextFields(message)).toEqual({
			Name: 'Ada',
			Email: 'ada@example.test',
			'Invited by': 'Grace',
		});
		expect(notes(message)).toEqual([
			'_Invited applications sort to the front of the waitlist._',
			'*3* waiting on a first decision · <https://virtualcoffee.io/admin/waitlist|Waitlist queue>',
		]);
	});

	test('an inviter without a name is still an invited application', () => {
		const message = applicationSubmittedMessage({
			name: 'Ada',
			email: 'ada@example.test',
			adminUrl: 'https://virtualcoffee.io/admin/waitlist/01',
			waitlistUrl: 'https://virtualcoffee.io/admin/waitlist',
			waiting: 3,
			invite: { inviterName: null },
		});
		expect(container(message)?.subtitle?.text).toBe('Invited application');
		expect(richTextFields(message)).toMatchObject({ 'Invited by': '—' });
	});
});
