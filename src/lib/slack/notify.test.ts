import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import {
	cocReportMessage,
	coffeeTableGroupMessage,
	inviteClaimedMessage,
	lunchAndLearnMessage,
	notifySlack,
	volunteerSignupMessage,
} from './notify';

describe('notifySlack', () => {
	const fetch = vi.fn<typeof globalThis.fetch>();

	beforeEach(() => {
		vi.stubGlobal('fetch', fetch);
		fetch.mockReset();
		vi.stubEnv('SLACK_WEBHOOK_COC', 'https://hooks.slack.test/coc');
		vi.stubEnv('SLACK_WEBHOOK_MEMBERSHIP', undefined);
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		vi.unstubAllEnvs();
	});

	test('a missing webhook is a skip, not an error, and nothing is fetched', async () => {
		await expect(notifySlack('membership', 'hi')).resolves.toEqual({
			ok: false,
			message:
				'SLACK_WEBHOOK_MEMBERSHIP is not set, so nothing was posted to Slack.',
		});
		expect(fetch).not.toHaveBeenCalled();
	});

	test('posts the text as JSON to the channel’s own webhook', async () => {
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
			body: JSON.stringify({ text: '*hi*', unfurl_links: true }),
		});
		expect(init?.signal).toBeInstanceOf(AbortSignal);
	});

	test('a rejection carries Slack’s status and plain-text reason', async () => {
		fetch.mockResolvedValue(new Response('no_service', { status: 404 }));
		await expect(notifySlack('coc', 'hi')).resolves.toEqual({
			ok: false,
			message: 'Slack rejected the message (404: no_service).',
		});
	});

	test('a network failure returns rather than throws', async () => {
		fetch.mockRejectedValue(new TypeError('fetch failed'));
		await expect(notifySlack('coc', 'hi')).resolves.toEqual({
			ok: false,
			message: 'Could not reach Slack: fetch failed',
		});
	});
});

describe('the messages', () => {
	test('a CoC report shows who, where, and whether there is a file to open', () => {
		const text = cocReportMessage({
			name: 'Ada',
			email: 'ada@example.test',
			reporteeName: 'Someone',
			timeLocation: 'Tuesday coffee',
			description: 'What happened.',
			anyoneElseInvolved: '  ',
			hasAttachment: true,
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
				'*Description:*',
				'What happened.',
				'',
				'*Anyone else involved:*',
				'—',
				'',
				'_A file was attached; open the report to view it._',
			].join('\n'),
		);
	});

	test('an anonymous CoC report says so instead of showing blanks', () => {
		const text = cocReportMessage({
			name: null,
			email: null,
			reporteeName: 'Someone',
			timeLocation: 'Slack',
			description: 'x',
			anyoneElseInvolved: null,
			hasAttachment: false,
		});
		expect(text).toContain('*Name:* (anonymous)');
		expect(text).toContain('*Email:* (anonymous)');
		expect(text).not.toContain('A file was attached');
		expect(text.endsWith('\n')).toBe(false);
	});

	test('optional fields render as a dash, not as "null"', () => {
		expect(
			volunteerSignupMessage({
				name: 'Ada',
				email: 'ada@example.test',
				position: null,
				description: null,
			}),
		).toBe(
			[
				'*New Volunteer Form Submission*',
				'',
				'*Name:* Ada',
				'*Email:* ada@example.test',
				'*Position:* —',
				'',
				'*Description:*',
				'—',
			].join('\n'),
		);

		expect(
			coffeeTableGroupMessage({
				name: 'Ada',
				email: 'ada@example.test',
				groupName: 'Rustaceans',
				description: 'Weekly',
			}),
		).toContain('*Group name:* Rustaceans\n\n*Description:*\nWeekly');
	});

	test('a Lunch & Learn message links the issue only when one was opened', () => {
		expect(
			lunchAndLearnMessage({ topic: 'Testing', name: 'Ada', issueUrl: null }),
		).toBe('New Lunch & Learn Submission: Testing by Ada');
		expect(
			lunchAndLearnMessage({
				topic: 'Testing',
				name: 'Ada',
				issueUrl: 'https://github.com/x/y/issues/1',
			}),
		).toBe(
			'New Lunch & Learn Submission: Testing by Ada\n\nGitHub Link: https://github.com/x/y/issues/1',
		);
	});

	test('a claimed invite names the inviter and explains the priority', () => {
		const text = inviteClaimedMessage({
			inviteeName: 'Ada',
			inviteeEmail: 'ada@example.test',
			inviterName: null,
		});
		expect(text).toContain('*Invited by:* —');
		expect(text).toContain('sort to the front of the waitlist');
	});
});
