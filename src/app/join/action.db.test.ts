import { describe, expect, test, vi } from 'vitest';

import { db, membershipApplication } from '@/db';
import { fieldErrors, formDataWith } from '@/test/forms';
import { notifySlack } from '@/test/mocks/spies';
import { redirectTo } from '@/test/next';
import { buttonLinks, notes, richTextFields } from '@/test/slack';
import type { SlackMessage } from '@/lib/slack/blocks';
import * as applications from '@/lib/waitlist/applications';
import {
	applicationEvents,
	insertApplication,
	insertInvite,
	inviteRow,
} from '@/test/db/fixtures';

import { submitMembershipApplication } from './action';

/** The message the last Slack post carried. */
function posted(): SlackMessage {
	const call = notifySlack.mock.lastCall;
	if (!call) throw new Error('notifySlack was not called');
	return call[1] as SlackMessage;
}

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
			expect.objectContaining({
				type: 'notification_sent',
				body: 'Slack notified of a new application',
			}),
		]);
		expect(notifySlack).toHaveBeenCalledWith(
			'membership',
			expect.objectContaining({
				text: expect.stringContaining('Application Received'),
			}),
		);
		expect(richTextFields(posted())).toEqual({
			Name: 'Ada Lovelace',
			Email: 'ada@example.test',
		});
		expect(buttonLinks(posted())).toEqual({
			'View in admin': expect.stringMatching(
				new RegExp(`/admin/waitlist/${row.id}$`),
			),
		});
		// The one application just written is the whole queue.
		expect(notes(posted())).toEqual([
			expect.stringMatching(
				/^\*1\* waiting on a first decision · <.*\/admin\/waitlist\|Waitlist queue>$/,
			),
		]);
	});

	test('a queue count that cannot be read is logged and left off; the post still goes out', async () => {
		notifySlack.mockResolvedValue({ ok: true, message: 'Posted to Slack.' });
		const counts = vi
			.spyOn(applications, 'statusCounts')
			.mockRejectedValueOnce(new Error('connection reset'));
		const error = vi.spyOn(console, 'error').mockImplementation(() => {});

		const row = await submit(valid);

		expect(notifySlack).toHaveBeenCalledOnce();
		expect(notes(posted())).toEqual([]);
		expect(error).toHaveBeenCalledWith(
			'Waitlist count unavailable for the Slack post',
			expect.any(Error),
		);
		await expect(applicationEvents(row.id)).resolves.toEqual([
			expect.objectContaining({ type: 'submitted' }),
			expect.objectContaining({ type: 'notification_sent' }),
		]);
		counts.mockRestore();
		error.mockRestore();
	});

	test('an email already in the pipeline is refused; a closed one may apply again', async () => {
		await insertApplication({ email: 'Ada@Example.test', status: 'member' });

		await expect(
			submitMembershipApplication(null, formDataWith(valid)),
		).resolves.toEqual(
			fieldErrors({ email: expect.stringContaining('already an application') }),
		);
		expect(await db().select().from(membershipApplication)).toHaveLength(1);

		await db().update(membershipApplication).set({ status: 'declined' });
		await submit(valid);
		const statuses = (await db().select().from(membershipApplication)).map(
			(row) => row.status,
		);
		expect(statuses.sort()).toEqual(['declined', 'waitlisted']);
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

		expect(posted().text).toBe(
			'Invited Application Received — Invited by Grace Hopper',
		);
		expect(richTextFields(posted())).toMatchObject({
			'Invited by': 'Grace Hopper',
		});
		expect(buttonLinks(posted())).toEqual({
			'View in admin': expect.stringMatching(
				new RegExp(`/admin/waitlist/${row.id}$`),
			),
		});
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
		expect(posted().text).toBe('Application Received — Membership waitlist');
		expect(richTextFields(posted())).not.toHaveProperty('Invited by');
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
			definitelyNotSent: false,
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
