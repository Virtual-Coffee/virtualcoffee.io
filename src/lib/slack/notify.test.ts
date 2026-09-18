import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import {
	applicationSubmittedMessage,
	cocReportMessage,
	coffeeTableGroupMessage,
	lunchAndLearnMessage,
	notifySlack,
	volunteerSignupMessage,
} from './notify';

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

		await expect(notifySlack('membership', 'hi')).resolves.toMatchObject({
			ok: true,
			warning: 'Captured, not posted to Slack (deploy-preview).',
		});
		expect(fetch).not.toHaveBeenCalled();
		expect(info).toHaveBeenCalledWith(
			'[slack captured] deploy-preview membership',
			'\nhi',
		);
		info.mockRestore();
	});

	test('NOTIFY_LIVE_OUTSIDE_PRODUCTION=true posts for real from a preview', async () => {
		vi.stubEnv('CONTEXT', 'deploy-preview');
		vi.stubEnv('NOTIFY_LIVE_OUTSIDE_PRODUCTION', 'true');
		fetch.mockResolvedValue(new Response('ok', { status: 200 }));

		await expect(notifySlack('coc', 'hi')).resolves.toEqual({
			ok: true,
			message: 'Posted to Slack.',
		});
		expect(fetch).toHaveBeenCalledOnce();
	});

	test('a missing webhook is a skip, not an error, and nothing is fetched', async () => {
		await expect(notifySlack('membership', 'hi')).resolves.toEqual({
			ok: false,
			definitelyNotSent: true,
			message:
				'SLACK_WEBHOOK_MEMBERSHIP is not set, so nothing was posted to Slack.',
		});
		expect(fetch).not.toHaveBeenCalled();
	});

	test('posts the text as JSON to the channel’s own webhook, with unfurls off', async () => {
		fetch.mockResolvedValue(new Response('ok', { status: 200 }));
		await expect(notifySlack('coc', '*hi*')).resolves.toEqual({
			ok: true,
			message: 'Posted to Slack.',
		});

		const [url, init] = fetch.mock.calls[0];
		expect(url).toBe('https://hooks.slack.test/coc');
		expect(init).toMatchObject({
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ text: '*hi*', unfurl_links: false }),
		});
		expect(init?.signal).toBeInstanceOf(AbortSignal);
	});

	test('a rejection carries Slack’s status and plain-text reason', async () => {
		fetch.mockResolvedValue(new Response('no_service', { status: 404 }));
		await expect(notifySlack('coc', 'hi')).resolves.toEqual({
			ok: false,
			definitelyNotSent: true,
			message: 'Slack rejected the message (404: no_service).',
		});
	});

	test('a network failure returns rather than throws', async () => {
		fetch.mockRejectedValue(new TypeError('fetch failed'));
		await expect(notifySlack('coc', 'hi')).resolves.toEqual({
			ok: false,
			definitelyNotSent: true,
			message: 'Could not reach Slack: fetch failed',
		});
	});
});

describe('the messages', () => {
	const ADMIN_URL = 'https://virtualcoffee.io/admin/submissions/volunteers/01';
	const ADMIN_LINK = `<${ADMIN_URL}|View in admin>`;

	test('what a person typed cannot page the channel or break the markup', () => {
		const text = volunteerSignupMessage({
			name: '<!channel>',
			email: 'a&b@example.test',
			position: '<https://evil.example|click>',
			adminUrl: ADMIN_URL,
		});
		expect(text).toContain('*Name:* &lt;!channel&gt;');
		expect(text).toContain('*Email:* a&amp;b@example.test');
		expect(text).toContain('&lt;https://evil.example|click&gt;');
		expect(text).not.toContain('<!channel>');

		expect(
			lunchAndLearnMessage({
				name: 'A & B',
				email: 'ab@example.test',
				topic: '<!here>',
				issueUrl: null,
				adminUrl: ADMIN_URL,
			}),
		).toContain(
			'*Name:* A &amp; B\n*Email:* ab@example.test\n*Title:* &lt;!here&gt;',
		);
	});

	test('a CoC report shows who and where, and links the file to open', () => {
		const text = cocReportMessage({
			name: 'Ada',
			email: 'ada@example.test',
			reporteeName: 'Someone',
			timeLocation: 'Tuesday coffee',
			hasAttachment: true,
			adminUrl: 'https://virtualcoffee.io/admin/submissions/coc/01',
		});
		expect(text).toBe(
			[
				'*CoC Report Submitted*',
				'',
				'*Name:* Ada',
				'*Email:* ada@example.test',
				'*Reportee Name:* Someone',
				'*Time/Location:* Tuesday coffee',
				'',
				'_<https://virtualcoffee.io/admin/submissions/coc/01|A file was attached; open the report to view it.>_',
			].join('\n'),
		);
	});

	test('an anonymous CoC report says so instead of showing blanks', () => {
		const text = cocReportMessage({
			name: null,
			email: null,
			reporteeName: 'Someone',
			timeLocation: 'Slack',
			hasAttachment: false,
			adminUrl: 'https://virtualcoffee.io/admin/submissions/coc/01',
		});
		expect(text).toContain('*Name:* (anonymous)');
		expect(text).toContain('*Email:* (anonymous)');
		expect(text).not.toContain('A file was attached');
		expect(
			text.endsWith(
				'\n<https://virtualcoffee.io/admin/submissions/coc/01|View in admin>',
			),
		).toBe(true);
	});

	test('optional fields render as a dash, not as "null"', () => {
		expect(
			volunteerSignupMessage({
				name: 'Ada',
				email: 'ada@example.test',
				position: null,
				adminUrl: ADMIN_URL,
			}),
		).toBe(
			[
				'*New Volunteer Form Submission*',
				'',
				'*Name:* Ada',
				'*Email:* ada@example.test',
				'*Position:* —',
				'',
				ADMIN_LINK,
			].join('\n'),
		);

		expect(
			coffeeTableGroupMessage({
				name: 'Ada',
				email: 'ada@example.test',
				groupName: null,
				adminUrl: ADMIN_URL,
			}),
		).toContain(`*Group name:* —\n\n${ADMIN_LINK}`);
	});

	test('a Lunch & Learn message links the issue only when one was opened', () => {
		const fields = [
			'*New Lunch & Learn Idea*',
			'',
			'*Name:* Ada',
			'*Email:* ada@example.test',
			'*Title:* Testing',
			'',
		];
		expect(
			lunchAndLearnMessage({
				name: 'Ada',
				email: 'ada@example.test',
				topic: 'Testing',
				issueUrl: null,
				adminUrl: ADMIN_URL,
			}),
		).toBe([...fields, ADMIN_LINK].join('\n'));
		expect(
			lunchAndLearnMessage({
				name: 'Ada',
				email: 'ada@example.test',
				topic: 'Testing',
				issueUrl: 'https://github.com/x/y/issues/1',
				adminUrl: ADMIN_URL,
			}),
		).toBe(
			[
				...fields,
				'<https://github.com/x/y/issues/1|GitHub issue>',
				ADMIN_LINK,
			].join('\n'),
		);
	});

	test('a plain application is name, email and the link', () => {
		expect(
			applicationSubmittedMessage({
				name: 'Ada',
				email: 'ada@example.test',
				adminUrl: 'https://virtualcoffee.io/admin/waitlist/01',
				invite: null,
			}),
		).toBe(
			[
				'*Application Received*',
				'',
				'*Name:* Ada',
				'*Email:* ada@example.test',
				'',
				'<https://virtualcoffee.io/admin/waitlist/01|View in admin>',
			].join('\n'),
		);
	});

	test('a claimed invite names the inviter and explains the priority', () => {
		const text = applicationSubmittedMessage({
			name: 'Ada',
			email: 'ada@example.test',
			adminUrl: 'https://virtualcoffee.io/admin/waitlist/01',
			invite: { inviterName: null },
		});
		expect(text).toBe(
			[
				'*Invited Application Received*',
				'',
				'*Name:* Ada',
				'*Email:* ada@example.test',
				'*Invited by:* —',
				'',
				'_Invited applications sort to the front of the waitlist._',
				'<https://virtualcoffee.io/admin/waitlist/01|View in admin>',
			].join('\n'),
		);
	});
});
