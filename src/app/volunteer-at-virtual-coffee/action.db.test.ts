import { eq } from 'drizzle-orm';
import { describe, expect, test, vi } from 'vitest';

import { db, submissionEvent, volunteerSignup } from '@/db';
import { formDataWith } from '@/test/forms';
import { redirectTo } from '@/test/next';

const notifySlack = vi.hoisted(() => vi.fn());
vi.mock('@/lib/slack/notify', async (importOriginal) => ({
	...(await importOriginal<typeof import('@/lib/slack/notify')>()),
	notifySlack,
}));

import { submitVolunteerSignup } from './action';

const valid = {
	name: 'Ada',
	email: 'ada@example.test',
	github_username: 'https://github.com/AdaL/',
	position: 'Maintainer',
	description: 'Happy to help with the site.',
	agree: 'agree',
};

async function submit() {
	await expect(
		submitVolunteerSignup(null, formDataWith(valid)),
	).rejects.toMatchObject(redirectTo('/volunteer-at-virtual-coffee/thanks'));
	const [row] = await db().select().from(volunteerSignup);
	const events = await db()
		.select({ type: submissionEvent.type, body: submissionEvent.body })
		.from(submissionEvent)
		.where(eq(submissionEvent.volunteerSignupId, row.id))
		.orderBy(submissionEvent.createdAt);
	return { row, events };
}

describe('submitVolunteerSignup', () => {
	test('writes the signup, then posts it to Slack', async () => {
		notifySlack.mockResolvedValue({ ok: true });

		const { row, events } = await submit();

		expect(row).toMatchObject({
			name: 'Ada',
			email: 'ada@example.test',
			githubUsername: 'AdaL',
			position: 'Maintainer',
		});
		expect(notifySlack).toHaveBeenCalledWith(
			'volunteers',
			expect.stringMatching(/^\*New Volunteer Form Submission\*[\s\S]*Ada/),
		);
		expect(events).toEqual([
			{ type: 'submitted', body: 'Signup submitted' },
			{ type: 'notification_sent', body: 'Posted to Slack.' },
		]);
	});

	/** ADR 0005: the signup is saved before Slack is asked. */
	test('a Slack failure is recorded on the signup, not shown to the volunteer', async () => {
		// notifySlack() returns rather than throws, by contract.
		notifySlack.mockResolvedValue({
			ok: false,
			message: 'Could not reach Slack: fetch failed',
		});

		const { row, events } = await submit();

		expect(row.name).toBe('Ada');
		expect(events).toEqual([
			{ type: 'submitted', body: 'Signup submitted' },
			{
				type: 'notification_failed',
				body: 'Could not reach Slack: fetch failed',
			},
		]);
	});
});
