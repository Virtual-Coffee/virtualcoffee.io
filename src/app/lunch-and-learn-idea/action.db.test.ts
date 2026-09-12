import { eq } from 'drizzle-orm';
import { describe, expect, test, vi } from 'vitest';

import { db, lunchAndLearnIdea, submissionEvent } from '@/db';
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
		createLunchAndLearnIssue.mockResolvedValue({ ok: true, url: ISSUE });
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
			{ type: 'notification_sent', body: `Posted to Slack, opened ${ISSUE}` },
		]);
	});

	test('a GitHub outage neither loses the idea nor stops the Slack message', async () => {
		createLunchAndLearnIssue.mockResolvedValue({
			ok: false,
			message: 'Could not open the GitHub issue: Not Found',
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
				body: 'Could not open the GitHub issue: Not Found Posted to Slack.',
			},
		]);
	});

	test('the issue URL is kept even when Slack then fails', async () => {
		createLunchAndLearnIssue.mockResolvedValue({ ok: true, url: ISSUE });
		notifySlack.mockResolvedValue({
			ok: false,
			message: 'Could not reach Slack.',
		});

		const { row, events } = await submit();

		expect(row.githubIssueUrl).toBe(ISSUE);
		expect(events[1]).toEqual({
			type: 'notification_failed',
			body: `Opened ${ISSUE} Could not reach Slack.`,
		});
	});
});
