import { eq } from 'drizzle-orm';
import { describe, expect, test, vi } from 'vitest';

import { db, lunchAndLearnIdea, submissionEvent } from '@/db';
import { failWrites } from '@/test/db/fixtures';
import { formDataWith } from '@/test/forms';
import { failedNotifications } from '@/lib/submissions/submissions';
import { createLunchAndLearnIssue, notifySlack } from '@/test/mocks/spies';
import { redirectTo } from '@/test/next';
import { siteUrl } from '@/util/url.server';
import { buttonLinks, richTextFields } from '@/test/slack';
import type { SlackMessage } from '@/lib/slack/blocks';

import { submitLunchAndLearnIdea } from './action';

const valid = {
	Name: 'Ada',
	Email: 'ada@example.test',
	Topic: 'Property testing',
	Description: 'Why and how.',
	Timing: 'Any Friday',
	agree: 'agree',
};

const ISSUE = 'https://github.com/Virtual-Coffee/VC-Community-Docs/issues/9';

const adminUrl = (id: string) =>
	`${siteUrl()}/admin/submissions/lunch-and-learn/${id}`;

/** The message with the buttons it carries, in order. */
const message = (...buttons: [label: string, url: string][]) => ({
	text: 'New Lunch & Learn Idea — Property testing',
	fields: { Name: 'Ada', Email: 'ada@example.test', Title: 'Property testing' },
	buttons,
});

/** What the last Slack post carried, in the shape `message()` describes. */
function posted() {
	const call = notifySlack.mock.lastCall;
	if (!call) throw new Error('notifySlack was not called');
	const sent = call[1] as SlackMessage;
	return {
		text: sent.text,
		fields: richTextFields(sent),
		buttons: Object.entries(buttonLinks(sent)),
	};
}

async function submit() {
	await expect(
		submitLunchAndLearnIdea(null, formDataWith(valid)),
	).rejects.toMatchObject(redirectTo('/lunch-and-learn-idea/thanks'));
	const [row] = await db().select().from(lunchAndLearnIdea);
	const events = await db()
		.select({ type: submissionEvent.type, body: submissionEvent.body })
		.from(submissionEvent)
		.where(eq(submissionEvent.lunchAndLearnIdeaId, row.id))
		.orderBy(submissionEvent.createdAt, submissionEvent.id);
	return { row, events };
}

describe('submitLunchAndLearnIdea', () => {
	test('opens the issue first and threads its URL into the Slack message', async () => {
		createLunchAndLearnIssue.mockResolvedValue({
			ok: true,
			url: ISSUE,
			message: `Opened ${ISSUE}`,
		});
		notifySlack.mockResolvedValue({ ok: true, message: 'Posted to Slack.' });

		const { row, events } = await submit();

		expect(row).toMatchObject({
			topic: 'Property testing',
			format: null,
			githubIssueUrl: ISSUE,
		});
		expect(notifySlack).toHaveBeenCalledWith(
			'lunch-and-learn',
			expect.anything(),
		);
		expect(posted()).toEqual(
			message(['View in admin', adminUrl(row.id)], ['GitHub issue', ISSUE]),
		);
		expect(events).toEqual([
			{ type: 'submitted', body: 'Idea submitted' },
			{
				type: 'notification_sent',
				body: 'Lunch & Learn issue opened on GitHub',
			},
			{
				type: 'notification_sent',
				body: 'Slack notified of a Lunch & Learn idea',
			},
		]);
	});

	test('a GitHub outage neither loses the idea nor stops the Slack message', async () => {
		createLunchAndLearnIssue.mockResolvedValue({
			ok: false,
			definitelyNotSent: true,
			message: 'Could not reach GitHub: Not Found',
		});
		notifySlack.mockResolvedValue({ ok: true, message: 'Posted to Slack.' });

		const { row, events } = await submit();

		expect(row.githubIssueUrl).toBeNull();
		expect(notifySlack).toHaveBeenCalledWith(
			'lunch-and-learn',
			expect.anything(),
		);
		expect(posted()).toEqual(message(['View in admin', adminUrl(row.id)]));
		// Each channel is its own line of History, so a GitHub outage is never
		// hidden behind the Slack message that followed it.
		expect(events).toEqual([
			{ type: 'submitted', body: 'Idea submitted' },
			{
				type: 'notification_failed',
				body: 'Lunch & Learn issue opened on GitHub failed: Could not reach GitHub: Not Found',
			},
			{
				type: 'notification_sent',
				body: 'Slack notified of a Lunch & Learn idea',
			},
		]);
		await expect(failedNotifications(['lunch-and-learn'])).resolves.toEqual({
			'lunch-and-learn': 1,
		});
	});

	test('a captured issue leaves no URL on the row and is still a success', async () => {
		createLunchAndLearnIssue.mockResolvedValue({
			ok: true,
			url: null,
			message: 'Captured, not opened on GitHub (deploy-preview).',
			warning: 'Captured, not opened on GitHub (deploy-preview).',
		});
		notifySlack.mockResolvedValue({
			ok: true,
			message: 'Captured, not posted to Slack (deploy-preview).',
			warning: 'Captured, not posted to Slack (deploy-preview).',
		});

		const { row, events } = await submit();

		expect(row.githubIssueUrl).toBeNull();
		expect(notifySlack).toHaveBeenCalledWith(
			'lunch-and-learn',
			expect.anything(),
		);
		expect(posted()).toEqual(message(['View in admin', adminUrl(row.id)]));
		expect(events.slice(1)).toEqual([
			{
				type: 'notification_sent',
				body: 'Lunch & Learn issue opened on GitHub — Captured, not opened on GitHub (deploy-preview).',
			},
			{
				type: 'notification_sent',
				body: 'Slack notified of a Lunch & Learn idea — Captured, not posted to Slack (deploy-preview).',
			},
		]);
	});

	test('failing to save the issue URL does not stop the Slack message', async () => {
		createLunchAndLearnIssue.mockResolvedValue({
			ok: true,
			url: ISSUE,
			message: `Opened ${ISSUE}`,
		});
		notifySlack.mockResolvedValue({ ok: true, message: 'Posted to Slack.' });
		const error = vi.spyOn(console, 'error').mockImplementation(() => {});

		const fault = await failWrites('lunch_and_learn_idea', 'update');
		let result;
		try {
			result = await submit();
		} finally {
			await fault.remove();
			error.mockRestore();
		}

		expect(result.row.githubIssueUrl).toBeNull();
		expect(notifySlack).toHaveBeenCalledWith(
			'lunch-and-learn',
			expect.anything(),
		);
		expect(posted()).toEqual(
			message(
				['View in admin', adminUrl(result.row.id)],
				['GitHub issue', ISSUE],
			),
		);
		// The row lost the link, so History is the only place that has it.
		expect(result.events.slice(1)).toEqual([
			{
				type: 'notification_sent',
				body: `Lunch & Learn issue opened on GitHub — Opened ${ISSUE}. The issue link could not be saved to the submission.`,
			},
			{
				type: 'notification_sent',
				body: 'Slack notified of a Lunch & Learn idea',
			},
		]);
	});

	test('the issue URL is kept even when Slack then fails', async () => {
		createLunchAndLearnIssue.mockResolvedValue({
			ok: true,
			url: ISSUE,
			message: `Opened ${ISSUE}`,
		});
		notifySlack.mockResolvedValue({
			ok: false,
			definitelyNotSent: true,
			message: 'Could not reach Slack.',
		});

		const { row, events } = await submit();

		expect(row.githubIssueUrl).toBe(ISSUE);
		expect(events.slice(1)).toEqual([
			{
				type: 'notification_sent',
				body: 'Lunch & Learn issue opened on GitHub',
			},
			{
				type: 'notification_failed',
				body: 'Slack notified of a Lunch & Learn idea failed: Could not reach Slack.',
			},
		]);
	});
});
