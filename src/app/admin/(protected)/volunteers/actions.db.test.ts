import { eq } from 'drizzle-orm';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { db, pendingGrant, user, volunteer } from '@/db';
import { hashClaimToken, volunteerBalance } from '@/lib/invites';
import { NOT_FOUND } from '@/test/next';
import { signInAs } from '@/test/session';
import {
	insertInvite,
	insertPendingGrant,
	insertUser,
	insertVolunteer,
	inviteRow,
	ledgerFor,
} from '@/test/db/fixtures';

const sendEmail = vi.hoisted(() => vi.fn());
vi.mock('@/lib/email/transport', () => ({ sendEmail }));

vi.mock('@/data/slackMembers', () => ({
	getSlackMembers: async () => [
		{
			id: 'U_ADA',
			name: 'Ada Lovelace',
			displayName: 'Ada',
			handle: 'ada',
			image: null,
		},
	],
}));

import {
	addVolunteer,
	adjustBalance,
	resendInvite,
	setVolunteerActive,
} from './actions';

async function volunteerRow(slackUserId: string) {
	const [row] = await db()
		.select()
		.from(volunteer)
		.where(eq(volunteer.slackUserId, slackUserId));
	return row ?? null;
}

async function roleOf(userId: string) {
	const [row] = await db()
		.select({ role: user.role, roleGrantedBy: user.roleGrantedBy })
		.from(user)
		.where(eq(user.id, userId));
	return row;
}

async function grantRole(slackUserId: string) {
	const rows = await db()
		.select({ role: pendingGrant.role })
		.from(pendingGrant)
		.where(eq(pendingGrant.slackUserId, slackUserId));
	return rows.map((r) => r.role);
}

beforeEach(() => {
	sendEmail.mockReset();
	sendEmail.mockResolvedValue({ ok: true });
	vi.stubEnv('URL', 'https://virtualcoffee.io');
	signInAs('admin');
});

describe('addVolunteer', () => {
	/**
	 * The row and the role together, or neither (docs/adr/0010). Which half
	 * carries the role depends on whether they have signed in yet.
	 */
	test('a signed-in member gets the row and the role on their account', async () => {
		const ada = await insertUser({
			role: 'coc_reviewer',
			slackUserId: 'U_ADA',
		});

		await expect(
			addVolunteer('U_ADA', ' Maintainer ', 'ADA@example.test'),
		).resolves.toEqual({
			ok: true,
			message: "Ada can now send invites, and we've emailed them.",
		});

		await expect(volunteerRow('U_ADA')).resolves.toMatchObject({
			slackDisplayName: 'Ada',
			slackHandle: 'ada',
			roleLabels: 'Maintainer',
			email: 'ada@example.test',
			deactivatedAt: null,
		});
		await expect(roleOf(ada.id)).resolves.toEqual({
			role: 'coc_reviewer,volunteer',
			roleGrantedBy: 'Local dev',
		});
		await expect(grantRole('U_ADA')).resolves.toEqual([]);
		expect(sendEmail).toHaveBeenCalledWith({
			to: 'ADA@example.test',
			subject: 'You can now invite people to Virtual Coffee',
			text: expect.stringContaining('https://virtualcoffee.io/invites'),
		});
	});

	test('someone who has never signed in gets a Pending Grant, merged into any existing one', async () => {
		await insertPendingGrant({
			slackUserId: 'U_ADA',
			role: 'waitlist_reviewer',
		});

		await expect(addVolunteer('U_ADA', '', '')).resolves.toEqual({
			ok: true,
			message:
				'Ada can now send invites. Add an email address to let us tell them.',
		});

		await expect(volunteerRow('U_ADA')).resolves.toMatchObject({
			roleLabels: null,
			email: null,
		});
		await expect(grantRole('U_ADA')).resolves.toEqual([
			'waitlist_reviewer,volunteer',
		]);
		expect(sendEmail).not.toHaveBeenCalled();
	});

	test('a second add is refused by the unique index, and grants nothing', async () => {
		await insertVolunteer({ slackUserId: 'U_ADA' });

		await expect(addVolunteer('U_ADA', '', '')).resolves.toEqual({
			ok: false,
			message: 'Ada is already a volunteer.',
		});
		await expect(grantRole('U_ADA')).resolves.toEqual([]);
		expect(sendEmail).not.toHaveBeenCalled();
	});

	test('a failed email still reports the grant as done', async () => {
		sendEmail.mockResolvedValue({
			ok: false,
			definitelyNotSent: true,
			message: 'The mail server rejected ada@example.test.',
		});

		await expect(
			addVolunteer('U_ADA', '', 'ada@example.test'),
		).resolves.toEqual({
			ok: true,
			message:
				"Ada can now send invites, but the email didn't send: The mail server rejected ada@example.test.",
		});
		await expect(volunteerRow('U_ADA')).resolves.not.toBeNull();
	});

	test('unknown Slack members and the wrong section are refused', async () => {
		await expect(addVolunteer('U_NOBODY', '', '')).resolves.toEqual({
			ok: false,
			message: 'That Slack member is no longer in the workspace.',
		});

		signInAs('waitlist_reviewer');
		await expect(addVolunteer('U_ADA', '', '')).rejects.toMatchObject(
			NOT_FOUND,
		);
		await expect(volunteerRow('U_ADA')).resolves.toBeNull();
	});
});

describe('setVolunteerActive', () => {
	/**
	 * Both halves move together: `deactivated_at` is what accrual reads, the
	 * role is what /invites reads. The ledger is left alone.
	 */
	test('pausing clears the role wherever it is held; restarting puts it back', async () => {
		const ada = await insertUser({
			role: 'coc_reviewer,volunteer',
			slackUserId: 'U_ADA',
		});
		await insertPendingGrant({
			slackUserId: 'U_ADA',
			role: 'volunteer,waitlist_reviewer',
		});
		const { id } = await insertVolunteer({ slackUserId: 'U_ADA' });
		await db()
			.insert(volunteer)
			.values({ slackUserId: 'U_OTHER', slackDisplayName: 'Other' });

		await expect(setVolunteerActive(id, false)).resolves.toEqual({
			ok: true,
			message: 'Volunteering paused.',
		});
		expect((await volunteerRow('U_ADA'))?.deactivatedAt).toBeInstanceOf(Date);
		await expect(roleOf(ada.id)).resolves.toEqual({
			role: 'coc_reviewer',
			roleGrantedBy: 'Local dev',
		});
		await expect(grantRole('U_ADA')).resolves.toEqual(['waitlist_reviewer']);
		// Nobody else's row moved.
		expect((await volunteerRow('U_OTHER'))?.deactivatedAt).toBeNull();

		await expect(setVolunteerActive(id, true)).resolves.toEqual({
			ok: true,
			message: 'Volunteering restarted.',
		});
		expect((await volunteerRow('U_ADA'))?.deactivatedAt).toBeNull();
		await expect(roleOf(ada.id)).resolves.toMatchObject({
			role: 'coc_reviewer,volunteer',
		});
		await expect(grantRole('U_ADA')).resolves.toEqual([
			'waitlist_reviewer,volunteer',
		]);
	});

	test('someone whose only role was volunteer is left with the default', async () => {
		const ada = await insertUser({ role: 'volunteer', slackUserId: 'U_ADA' });
		const { id } = await insertVolunteer({ slackUserId: 'U_ADA' });

		await setVolunteerActive(id, false);

		await expect(roleOf(ada.id)).resolves.toMatchObject({ role: 'user' });
	});

	test('a malformed or unknown id is a soft failure, not a 22P02', async () => {
		await expect(setVolunteerActive('42', false)).resolves.toEqual({
			ok: false,
			message: 'That volunteer no longer exists.',
		});
		await expect(
			setVolunteerActive('0199404c-2c5e-7000-8000-000000000000', false),
		).resolves.toEqual({
			ok: false,
			message: 'That volunteer no longer exists.',
		});
	});
});

describe('adjustBalance', () => {
	test('appends a signed ledger row with the reason, and the balance follows', async () => {
		const { id } = await insertVolunteer({ slackUserId: 'U_ADA' });

		await expect(adjustBalance(id, 3, ' Ran the meetup ')).resolves.toEqual({
			ok: true,
			message: 'Added 3 invites.',
		});
		await expect(adjustBalance(id, -1, 'Typo')).resolves.toEqual({
			ok: true,
			message: 'Removed 1 invite.',
		});

		await expect(ledgerFor('U_ADA')).resolves.toEqual([
			{ delta: 3, reason: 'admin_grant', periodKey: null, inviteId: null },
			{ delta: -1, reason: 'admin_revoke', periodKey: null, inviteId: null },
		]);
		await expect(volunteerBalance('U_ADA')).resolves.toBe(2);
	});

	test('an unknown volunteer writes nothing', async () => {
		await expect(
			adjustBalance('0199404c-2c5e-7000-8000-000000000000', 1, 'ok'),
		).resolves.toEqual({
			ok: false,
			message: 'That volunteer no longer exists.',
		});
	});
});

describe('resendInvite', () => {
	/**
	 * The old link dies before the email goes out, because the email cannot
	 * carry a token that does not exist yet — so a failed send has to say so.
	 */
	test('replaces the token, restarts the expiry, and emails the new link', async () => {
		const { id: volunteerId } = await insertVolunteer({
			slackUserId: 'U_GRACE',
		});
		const soon = new Date(Date.now() + 60 * 60 * 1000);
		const { id, token: oldToken } = await insertInvite({
			inviterSlackUserId: 'U_GRACE',
			inviterName: 'Grace Hopper',
			inviteeEmail: 'ada@example.test',
			expiresAt: soon,
		});

		await expect(resendInvite(id, volunteerId)).resolves.toEqual({
			ok: true,
			message: 'Invite re-sent to ada@example.test.',
		});

		const row = await inviteRow(id);
		expect(row.tokenHash).not.toBe(hashClaimToken(oldToken));
		expect(row.tokenExpiresAt!.getTime()).toBeGreaterThan(soon.getTime());

		expect(sendEmail).toHaveBeenCalledOnce();
		const [{ to, subject, text }] = sendEmail.mock.calls[0];
		expect({ to, subject }).toEqual({
			to: 'ada@example.test',
			subject: 'Grace Hopper invited you to Virtual Coffee',
		});
		const newToken = /\/join\?invite=([A-Za-z0-9_-]+)/.exec(text)?.[1];
		expect(newToken).toBeDefined();
		expect(hashClaimToken(newToken!)).toBe(row.tokenHash);
		// No ledger movement: it is the same Invite.
		await expect(ledgerFor('U_GRACE')).resolves.toEqual([]);
	});

	test('a failed send admits the previous link has stopped working', async () => {
		sendEmail.mockResolvedValue({
			ok: false,
			definitelyNotSent: true,
			message: 'The mail server rejected ada@example.test.',
		});
		const { id: volunteerId } = await insertVolunteer({
			slackUserId: 'U_GRACE',
		});
		const { id, token: oldToken } = await insertInvite({
			inviterSlackUserId: 'U_GRACE',
		});

		await expect(resendInvite(id, volunteerId)).resolves.toEqual({
			ok: false,
			message:
				'The mail server rejected ada@example.test. The previous link has stopped working, so try again or cancel the invite.',
		});
		expect((await inviteRow(id)).tokenHash).not.toBe(hashClaimToken(oldToken));
	});

	test('only a pending invite with an email can be re-sent', async () => {
		const { id: volunteerId } = await insertVolunteer({
			slackUserId: 'U_GRACE',
		});
		const { id, token } = await insertInvite({
			inviterSlackUserId: 'U_GRACE',
			status: 'accepted',
		});

		await expect(resendInvite(id, volunteerId)).resolves.toEqual({
			ok: false,
			message: 'Only an unclaimed invite with an email address can be re-sent.',
		});
		await expect(resendInvite('42', volunteerId)).resolves.toEqual({
			ok: false,
			message: 'That invite no longer exists.',
		});
		expect((await inviteRow(id)).tokenHash).toBe(hashClaimToken(token));
		expect(sendEmail).not.toHaveBeenCalled();
	});
});
