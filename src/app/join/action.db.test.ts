import { describe, expect, test, vi } from 'vitest';

import { db, membershipApplication } from '@/db';
import { formDataWith } from '@/test/forms';
import { redirectTo } from '@/test/next';
import { applicationEvents, insertInvite, inviteRow } from '@/test/db/fixtures';

const notifySlack = vi.hoisted(() => vi.fn());
vi.mock('@/lib/slack/notify', async (importOriginal) => ({
	...(await importOriginal<typeof import('@/lib/slack/notify')>()),
	notifySlack,
}));

import { submitMembershipApplication } from './action';

const valid = {
	name: 'Ada Lovelace',
	email: 'ada@example.test',
	agree: 'agree',
};

async function submit(fields: Record<string, string>) {
	await expect(
		submitMembershipApplication(null, formDataWith(fields)),
	).rejects.toMatchObject(redirectTo('/join/thank-you'));
	const [row] = await db().select().from(membershipApplication);
	return row;
}

describe('submitMembershipApplication', () => {
	test('writes a waitlisted application and records the consent', async () => {
		notifySlack.mockResolvedValue({ ok: true, message: 'Posted to Slack.' });
		const row = await submit({
			...valid,
			githubUsername: 'https://github.com/AdaL/',
			pronouns: '  she/her ',
		});

		expect(row).toMatchObject({
			status: 'waitlisted',
			source: 'waitlist_signup',
			isPriority: false,
			githubUsername: 'AdaL',
			pronouns: 'she/her',
			inviteId: null,
			referrer: null,
		});
		expect(row.agreedToCocAt).toBeInstanceOf(Date);
		expect(row.waitlistedAt).toBeInstanceOf(Date);
		await expect(applicationEvents(row.id)).resolves.toEqual([
			{ type: 'submitted', body: 'Application submitted', actorUserId: null },
		]);
		expect(notifySlack).not.toHaveBeenCalled();
	});

	test('a valid Claim Link makes a priority application and kills the link', async () => {
		notifySlack.mockResolvedValue({ ok: true, message: 'Posted to Slack.' });
		const { id, token } = await insertInvite({
			inviterSlackUserId: 'U_GRACE',
			inviterName: 'Grace Hopper',
		});

		const row = await submit({ ...valid, invite: token });

		expect(row).toMatchObject({
			source: 'volunteer_invite',
			isPriority: true,
			inviteId: id,
			referrer: 'Grace Hopper',
		});
		await expect(inviteRow(id)).resolves.toMatchObject({
			status: 'accepted',
			tokenHash: null,
		});
		expect(row.agreedToCocAt).toEqual((await inviteRow(id)).claimedAt);

		expect(notifySlack).toHaveBeenCalledWith(
			'membership',
			expect.stringContaining('*Invited by:* Grace Hopper'),
		);
		await expect(applicationEvents(row.id)).resolves.toEqual([
			expect.objectContaining({
				type: 'submitted',
				body: 'Application submitted from an invite by Grace Hopper',
			}),
			expect.objectContaining({ type: 'notification_sent' }),
		]);
	});

	test('an expired link still produces an application — as an ordinary signup', async () => {
		const { id, token } = await insertInvite({
			inviterSlackUserId: 'U_GRACE',
			expiresAt: new Date(Date.now() - 1000),
		});

		const row = await submit({ ...valid, invite: token });

		expect(row).toMatchObject({
			source: 'waitlist_signup',
			isPriority: false,
			inviteId: null,
		});
		await expect(inviteRow(id)).resolves.toMatchObject({ status: 'pending' });
		expect(notifySlack).not.toHaveBeenCalled();
	});

	test('a link works once', async () => {
		notifySlack.mockResolvedValue({ ok: true, message: 'Posted to Slack.' });
		const { id, token } = await insertInvite({ inviterSlackUserId: 'U_GRACE' });

		await submit({ ...valid, invite: token });
		await expect(
			submitMembershipApplication(
				null,
				formDataWith({ ...valid, email: 'second@example.test', invite: token }),
			),
		).rejects.toMatchObject(redirectTo('/join/thank-you'));

		const rows = await db()
			.select({ inviteId: membershipApplication.inviteId })
			.from(membershipApplication);
		expect(rows.filter((r) => r.inviteId === id)).toHaveLength(1);
		expect(rows.filter((r) => r.inviteId === null)).toHaveLength(1);
	});

	/** ADR 0005: the application is saved before Slack is asked. */
	test('a Slack failure is recorded on the application, not shown to the applicant', async () => {
		// notifySlack() returns rather than throws, by contract.
		notifySlack.mockResolvedValue({
			ok: false,
			message: 'Could not reach Slack: fetch failed',
		});
		const { token } = await insertInvite({ inviterSlackUserId: 'U_GRACE' });

		const row = await submit({ ...valid, invite: token });

		expect(row.isPriority).toBe(true);
		await expect(applicationEvents(row.id)).resolves.toEqual([
			expect.objectContaining({ type: 'submitted' }),
			expect.objectContaining({
				type: 'notification_failed',
				body: expect.stringContaining('fetch failed'),
			}),
		]);
	});
});
