import { eq } from 'drizzle-orm';
import { describe, expect, test, vi } from 'vitest';

import { coffeeTableGroupRequest, db, submissionEvent } from '@/db';
import { formDataWith } from '@/test/forms';
import { redirectTo } from '@/test/next';

const notifySlack = vi.hoisted(() => vi.fn());
vi.mock('@/lib/slack/notify', async (importOriginal) => ({
	...(await importOriginal<typeof import('@/lib/slack/notify')>()),
	notifySlack,
}));

import { submitCoffeeTableGroupRequest } from './action';

const valid = {
	name: 'Ada',
	email: 'ada@example.test',
	group_name: 'Analytical Engines',
	description: 'Weekly, for people building compilers.',
	agree: 'agree',
};

async function submit() {
	await expect(
		submitCoffeeTableGroupRequest(null, formDataWith(valid)),
	).rejects.toMatchObject(redirectTo('/start-coffee-table-group/thanks'));
	const [row] = await db().select().from(coffeeTableGroupRequest);
	const events = await db()
		.select({ type: submissionEvent.type, body: submissionEvent.body })
		.from(submissionEvent)
		.where(eq(submissionEvent.coffeeTableGroupRequestId, row.id))
		.orderBy(submissionEvent.createdAt);
	return { row, events };
}

describe('submitCoffeeTableGroupRequest', () => {
	test('writes the request, then posts it to Slack', async () => {
		notifySlack.mockResolvedValue({ ok: true });

		const { row, events } = await submit();

		expect(row).toMatchObject({
			name: 'Ada',
			email: 'ada@example.test',
			groupName: 'Analytical Engines',
		});
		expect(notifySlack).toHaveBeenCalledWith(
			'coffee-tables',
			expect.stringMatching(
				/^\*New Coffee Table Group\*[\s\S]*Analytical Engines/,
			),
		);
		expect(events).toEqual([
			{ type: 'submitted', body: 'Request submitted' },
			{ type: 'notification_sent', body: 'Posted to Slack.' },
		]);
	});

	/** ADR 0005: the request is saved before Slack is asked. */
	test('a Slack failure is recorded on the request, not shown to the applicant', async () => {
		// notifySlack() returns rather than throws, by contract.
		notifySlack.mockResolvedValue({
			ok: false,
			message: 'Could not reach Slack: fetch failed',
		});

		const { row, events } = await submit();

		expect(row.groupName).toBe('Analytical Engines');
		expect(events).toEqual([
			{ type: 'submitted', body: 'Request submitted' },
			{
				type: 'notification_failed',
				body: 'Could not reach Slack: fetch failed',
			},
		]);
	});
});
