import { eq } from 'drizzle-orm';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { db, invite, pendingGrant, user, volunteer } from '@/db';
import { hashClaimToken, volunteerBalance } from '@/lib/volunteers/invites';
import { sendEmail, sendSlackDm } from '@/test/mocks/spies';
import { SENT } from '@/test/outbound';
import { NOT_FOUND } from '@/test/next';
import { signInAs } from '@/test/session';
import {
	failInserts,
	insertInvite,
	insertPendingGrant,
	insertUser,
	insertVolunteer,
	inviteRow,
	ledgerFor,
} from '@/test/db/fixtures';
import { afterRead } from '@/test/mocks/wrappers';
import { slackDirectory, slackMember } from '@/test/mocks/slackMembers';

import {
	addVolunteer,
	adjustBalance,
	resendInvite,
	setEmail,
	setRoleLabels,
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

const VOLUNTEER_ID = '0199404c-2c5e-7000-8000-000000000000';

beforeEach(async () => {
	slackDirectory.members = [
		slackMember('U_ADA', {
			name: 'Ada Lovelace',
			displayName: 'Ada',
			handle: 'ada',
		}),
	];
	sendEmail.mockResolvedValue(SENT);
	sendSlackDm.mockResolvedValue({ ok: true, message: 'DM sent.' });
	vi.stubEnv('URL', 'https://virtualcoffee.io');
	await signInAs('admin');
});

describe('addVolunteer', () => {
	test('a malformed email is refused before anything is looked up', async () => {
		await expect(addVolunteer('U_ADA', [], 'not-an-email')).resolves.toEqual({
			ok: false,
			message: 'That doesn’t look like an email address.',
		});
	});

	test('a role that is not on the list is refused', async () => {
		await expect(
			addVolunteer('U_ADA', ['VC Host', 'Grand Poobah'], ''),
		).resolves.toEqual({
			ok: false,
			message: 'That isn’t one of the community roles.',
		});
	});

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
			addVolunteer(
				'U_ADA',
				['VC Host', 'Notetaker', 'VC Host'],
				'ADA@example.test',
			),
		).resolves.toEqual({
			ok: true,
			message: "Ada can now send invites, and we've emailed them.",
		});

		await expect(volunteerRow('U_ADA')).resolves.toMatchObject({
			slackDisplayName: 'Ada',
			slackHandle: 'ada',
			roleLabels: 'Notetaker, VC Host',
			email: 'ada@example.test',
			deactivatedAt: null,
		});
		await expect(roleOf(ada.id)).resolves.toEqual({
			role: 'coc_reviewer,volunteer',
			roleGrantedBy: 'Local dev',
		});
		await expect(grantRole('U_ADA')).resolves.toEqual([]);
		expect(sendEmail).toHaveBeenCalledWith({
			to: 'ada@example.test',
			subject: 'You can now invite people to Virtual Coffee',
			text: expect.stringContaining('https://virtualcoffee.io/invites'),
		});
		// Already signed in — nobody left to tell to come claim anything.
		expect(sendSlackDm).not.toHaveBeenCalled();
	});

	test('someone who has never signed in gets a Pending Grant, merged into any existing one', async () => {
		await insertPendingGrant({
			slackUserId: 'U_ADA',
			role: 'waitlist_reviewer',
		});

		await expect(addVolunteer('U_ADA', [], '')).resolves.toEqual({
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
		expect(sendSlackDm).toHaveBeenCalledWith(
			'U_ADA',
			expect.stringContaining('Volunteer'),
		);
	});

	test('a second add is refused by the unique index, and grants nothing', async () => {
		await insertVolunteer({ slackUserId: 'U_ADA' });

		await expect(addVolunteer('U_ADA', [], '')).resolves.toEqual({
			ok: false,
			message: 'Ada is already a volunteer.',
		});
		await expect(grantRole('U_ADA')).resolves.toEqual([]);
		expect(sendEmail).not.toHaveBeenCalled();
	});

	test('any other failure surfaces rather than posing as a duplicate', async () => {
		const fault = await failInserts('volunteer');
		try {
			await expect(addVolunteer('U_ADA', [], '')).rejects.toThrow(
				/insert into "volunteer"/,
			);
		} finally {
			await fault.remove();
		}
		await expect(volunteerRow('U_ADA')).resolves.toBeFalsy();
	});

	test('a failed email still reports the grant as done', async () => {
		sendEmail.mockResolvedValue({
			ok: false,
			definitelyNotSent: true,
			message: 'The mail server rejected ada@example.test.',
		});

		await expect(
			addVolunteer('U_ADA', [], 'ada@example.test'),
		).resolves.toEqual({
			ok: true,
			message:
				"Ada can now send invites, but the email didn't send: The mail server rejected ada@example.test.",
		});
		await expect(volunteerRow('U_ADA')).resolves.not.toBeNull();
	});

	test('unknown Slack members and the wrong section are refused', async () => {
		await expect(addVolunteer('U_NOBODY', [], '')).resolves.toEqual({
			ok: false,
			message: 'That Slack member is no longer in the workspace.',
		});

		await signInAs('waitlist_reviewer');
		await expect(addVolunteer('U_ADA', [], '')).rejects.toMatchObject(
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
		// A pause is not a grant, so it does not claim the grantor's name.
		await expect(roleOf(ada.id)).resolves.toEqual({
			role: 'coc_reviewer',
			roleGrantedBy: null,
		});
		await expect(grantRole('U_ADA')).resolves.toEqual(['waitlist_reviewer']);
		// Nobody else's row moved.
		expect((await volunteerRow('U_OTHER'))?.deactivatedAt).toBeNull();

		await expect(setVolunteerActive(id, true)).resolves.toEqual({
			ok: true,
			message: 'Volunteering restarted.',
		});
		expect((await volunteerRow('U_ADA'))?.deactivatedAt).toBeNull();
		// A restart is the grant addVolunteer makes, and a Grant beside a
		// signed-in account is one their sign-in failed to claim: it is applied
		// with the restart and claimed (docs/adr/0009).
		await expect(roleOf(ada.id)).resolves.toMatchObject({
			role: 'coc_reviewer,waitlist_reviewer,volunteer',
			roleGrantedBy: 'Local dev',
		});
		await expect(
			db()
				.select({ claimedUserId: pendingGrant.claimedUserId })
				.from(pendingGrant)
				.where(eq(pendingGrant.slackUserId, 'U_ADA')),
		).resolves.toEqual([{ claimedUserId: ada.id }]);
		// Already signed in throughout — no DM either time.
		expect(sendSlackDm).not.toHaveBeenCalled();
	});

	test('someone whose only role was volunteer is left with the default', async () => {
		const ada = await insertUser({ role: 'volunteer', slackUserId: 'U_ADA' });
		const { id } = await insertVolunteer({ slackUserId: 'U_ADA' });

		await setVolunteerActive(id, false);

		await expect(roleOf(ada.id)).resolves.toMatchObject({ role: 'user' });
	});

	test('a grant that only carried volunteer is withdrawn rather than left empty', async () => {
		await insertPendingGrant({ slackUserId: 'U_ADA', role: 'volunteer' });
		const { id } = await insertVolunteer({ slackUserId: 'U_ADA' });

		await setVolunteerActive(id, false);

		await expect(grantRole('U_ADA')).resolves.toEqual([]);
	});

	test('restarting someone who never signed in re-creates the withdrawn grant', async () => {
		await addVolunteer('U_ADA', [], '');
		const { id } = (await volunteerRow('U_ADA'))!;

		await setVolunteerActive(id, false);
		await expect(grantRole('U_ADA')).resolves.toEqual([]);

		sendSlackDm.mockClear();
		await expect(setVolunteerActive(id, true)).resolves.toEqual({
			ok: true,
			message: 'Volunteering restarted.',
		});
		expect((await volunteerRow('U_ADA'))?.deactivatedAt).toBeNull();
		await expect(grantRole('U_ADA')).resolves.toEqual(['volunteer']);
		// Still never signed in, so the restart DMs them again.
		expect(sendSlackDm).toHaveBeenCalledWith(
			'U_ADA',
			expect.stringContaining('Volunteer'),
		);
	});

	test('a malformed or unknown id is a soft failure, not a 22P02', async () => {
		await expect(setVolunteerActive('42', false)).resolves.toEqual({
			ok: false,
			message: 'That volunteer no longer exists.',
		});
		await expect(setVolunteerActive(VOLUNTEER_ID, false)).resolves.toEqual({
			ok: false,
			message: 'That volunteer no longer exists.',
		});
	});
});

describe('adjustBalance', () => {
	test('needs volunteers:manage', async () => {
		await signInAs('waitlist_reviewer');
		await expect(
			adjustBalance(VOLUNTEER_ID, 1, 'because'),
		).rejects.toMatchObject(NOT_FOUND);
	});

	test.each([
		['a malformed id', '42', 1, 'ok', 'That volunteer no longer exists.'],
		[
			'a fraction',
			VOLUNTEER_ID,
			0.5,
			'ok',
			'Give a whole number of invites, not zero.',
		],
		[
			'zero',
			VOLUNTEER_ID,
			0,
			'ok',
			'Give a whole number of invites, not zero.',
		],
		[
			'too many',
			VOLUNTEER_ID,
			51,
			'ok',
			'That is more invites than anyone needs.',
		],
		[
			'too many back',
			VOLUNTEER_ID,
			-51,
			'ok',
			'That is more invites than anyone needs.',
		],
		[
			'no reason',
			VOLUNTEER_ID,
			1,
			'  ',
			'Say why — the ledger is the audit trail.',
		],
	])(
		'refuses %s before touching the ledger',
		async (_label, id, delta, reason, message) => {
			await expect(adjustBalance(id, delta, reason)).resolves.toEqual({
				ok: false,
				message,
			});
		},
	);

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
		await expect(adjustBalance(VOLUNTEER_ID, 1, 'ok')).resolves.toEqual({
			ok: false,
			message: 'That volunteer no longer exists.',
		});
	});
});

describe('setRoleLabels', () => {
	test('needs volunteers:manage', async () => {
		await signInAs('waitlist_reviewer');
		await expect(
			setRoleLabels(VOLUNTEER_ID, ['VC Host']),
		).rejects.toMatchObject(NOT_FOUND);
	});

	test('a role that is not on the list is refused', async () => {
		await expect(
			setRoleLabels(VOLUNTEER_ID, ['Grand Poobah']),
		).resolves.toEqual({
			ok: false,
			message: 'That isn’t one of the community roles.',
		});
	});

	test('writes the list in canonical order, and an empty list clears it', async () => {
		const { id } = await insertVolunteer({ slackUserId: 'U_ADA' });

		await expect(
			setRoleLabels(id, ['VC Host', 'Notetaker', 'VC Host']),
		).resolves.toEqual({ ok: true, message: 'Roles updated.' });
		await expect(volunteerRow('U_ADA')).resolves.toMatchObject({
			roleLabels: 'Notetaker, VC Host',
		});

		await expect(setRoleLabels(id, [])).resolves.toEqual({
			ok: true,
			message: 'Roles updated.',
		});
		await expect(volunteerRow('U_ADA')).resolves.toMatchObject({
			roleLabels: null,
		});
	});

	test('a malformed or unknown id is a soft failure, not a 22P02', async () => {
		await expect(setRoleLabels('42', ['VC Host'])).resolves.toEqual({
			ok: false,
			message: 'That volunteer no longer exists.',
		});
		await expect(setRoleLabels(VOLUNTEER_ID, ['VC Host'])).resolves.toEqual({
			ok: false,
			message: 'That volunteer no longer exists.',
		});
	});
});

describe('setEmail', () => {
	test('needs volunteers:manage', async () => {
		await signInAs('waitlist_reviewer');
		await expect(
			setEmail(VOLUNTEER_ID, 'ada@example.com'),
		).rejects.toMatchObject(NOT_FOUND);
	});

	test('a malformed email is refused before anything is looked up', async () => {
		await expect(setEmail(VOLUNTEER_ID, 'not-an-email')).resolves.toEqual({
			ok: false,
			message: 'That doesn’t look like an email address.',
		});
	});

	test('writes the address lowercased, and an empty one clears it', async () => {
		const { id } = await insertVolunteer({
			slackUserId: 'U_ADA',
			email: 'old@example.com',
		});

		await expect(setEmail(id, '  Ada@Example.com ')).resolves.toEqual({
			ok: true,
			message: 'Email updated.',
		});
		await expect(volunteerRow('U_ADA')).resolves.toMatchObject({
			email: 'ada@example.com',
		});

		await expect(setEmail(id, '   ')).resolves.toEqual({
			ok: true,
			message: 'Email cleared.',
		});
		await expect(volunteerRow('U_ADA')).resolves.toMatchObject({
			email: null,
		});
	});

	test('a malformed or unknown id is a soft failure, not a 22P02', async () => {
		await expect(setEmail('42', 'ada@example.com')).resolves.toEqual({
			ok: false,
			message: 'That volunteer no longer exists.',
		});
		await expect(setEmail(VOLUNTEER_ID, 'ada@example.com')).resolves.toEqual({
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

	test('an invite imported from Airtable has no link to re-send', async () => {
		const { id: volunteerId } = await insertVolunteer({
			slackUserId: 'U_GRACE',
		});
		const [{ id }] = await db()
			.insert(invite)
			.values({
				inviterSlackUserId: 'U_GRACE',
				inviterName: 'Grace',
				inviteeName: 'Ada',
				inviteeEmail: 'ada@example.test',
				status: 'pending',
				airtableRecordId: 'recIMPORTED',
			})
			.returning({ id: invite.id });

		await expect(resendInvite(id, volunteerId)).resolves.toEqual({
			ok: false,
			message:
				'This invite was imported from Airtable and has no claim link to re-send.',
		});
		expect((await inviteRow(id)).tokenHash).toBeNull();
		expect(sendEmail).not.toHaveBeenCalled();
	});

	test('an invite claimed between the read and the write is not emailed', async () => {
		const { id: volunteerId } = await insertVolunteer({
			slackUserId: 'U_GRACE',
		});
		const { id } = await insertInvite({ inviterSlackUserId: 'U_GRACE' });
		// The read sees `pending`; the claim lands before the write.
		afterRead.run = async () => {
			await db()
				.update(invite)
				.set({ status: 'accepted', tokenHash: null })
				.where(eq(invite.id, id));
		};

		await expect(resendInvite(id, volunteerId)).resolves.toEqual({
			ok: false,
			message:
				'That invite was claimed, cancelled or re-sent just now. Reload the page.',
		});
		expect(sendEmail).not.toHaveBeenCalled();
		expect((await inviteRow(id)).status).toBe('accepted');
	});

	test('a resend that lost the race to another resend is not emailed', async () => {
		const { id: volunteerId } = await insertVolunteer({
			slackUserId: 'U_GRACE',
		});
		const { id } = await insertInvite({ inviterSlackUserId: 'U_GRACE' });
		// Still `pending`, but the other maintainer's token is already in the row.
		const theirs = hashClaimToken('the-other-resend');
		afterRead.run = async () => {
			await db()
				.update(invite)
				.set({ tokenHash: theirs })
				.where(eq(invite.id, id));
		};

		await expect(resendInvite(id, volunteerId)).resolves.toEqual({
			ok: false,
			message:
				'That invite was claimed, cancelled or re-sent just now. Reload the page.',
		});
		expect(sendEmail).not.toHaveBeenCalled();
		expect((await inviteRow(id)).tokenHash).toBe(theirs);
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
