import { eq } from 'drizzle-orm';
import { describe, expect, test, vi } from 'vitest';

import { db, lunchAndLearnIdea, submissionEvent } from '@/db';
import { failWrites } from '@/test/db/fixtures';
import { formDataWith } from '@/test/forms';
import { redirectTo } from '@/test/next';

const notifySlack = vi.hoisted(() => vi.fn());
vi.mock('@/lib/slack/notify', async (importOriginal) => ({
	...(await importOriginal<typeof import('@/lib/slack/notify')>()),
	notifySlack,
}));

const createLunchAndLearnIssue = vi.hoisted(() => vi.fn());
vi.mock('@/lib/github/issues', () => ({ createLunchAndLearnIssue }));

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

async function submit() {
	await expect(
		submitLunchAndLearnIdea(null, formDataWith(valid)),
	).rejects.toMatchObject(redirectTo('/lunch-and-learn-idea/thanks'));
	const [row] = await db().select().from(lunchAndLearnIdea);
	const events = await db()
		.select({ type: submissionEvent.type, body: submissionEvent.body })
		.from(submissionEvent)
		.where(eq(submissionEvent.lunchAndLearnIdeaId, row.id))
		.orderBy(submissionEvent.createdAt);
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
			`New Lunch & Learn Submission: Property testing by Ada\n\nGitHub Link: ${ISSUE}`,
		);
		expect(events).toEqual([
			{ type: 'submitted', body: 'Idea submitted' },
			{
				type: 'notification_sent',
				body: 'Lunch & Learn issue opened on GitHub',
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
			'New Lunch & Learn Submission: Property testing by Ada',
		);
		expect(events).toEqual([
			{ type: 'submitted', body: 'Idea submitted' },
			{
				type: 'notification_failed',
				body: 'Lunch & Learn issue opened on GitHub failed: Could not reach GitHub: Not Found Posted to Slack.',
			},
		]);
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
			'New Lunch & Learn Submission: Property testing by Ada',
		);
		expect(events[1]).toEqual({
			type: 'notification_sent',
			body: 'Lunch & Learn issue opened on GitHub — Captured, not opened on GitHub (deploy-preview). Captured, not posted to Slack (deploy-preview).',
		});
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
			`New Lunch & Learn Submission: Property testing by Ada\n\nGitHub Link: ${ISSUE}`,
		);
		// The row lost the link, so History is the only place that has it.
		expect(result.events[1]).toEqual({
			type: 'notification_sent',
			body: `Lunch & Learn issue opened on GitHub — Opened ${ISSUE}. The issue link could not be saved to the submission.`,
		});
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
		expect(events[1]).toEqual({
			type: 'notification_failed',
			body: `Lunch & Learn issue opened on GitHub failed: Opened ${ISSUE} Could not reach Slack.`,
		});
	});
});
