import { eq } from 'drizzle-orm';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { db, pendingGrant, user } from '@/db';
import { sendSlackDm } from '@/test/mocks/slackDm';
import { NOT_FOUND } from '@/test/next';
import { signInAs } from '@/test/session';
import {
	failInserts,
	insertPendingGrant,
	insertUser,
} from '@/test/db/fixtures';
import { listAccessRows } from '@/lib/access/admins';
import { slackDirectory, slackMember } from '@/test/mocks/slackMembers';

vi.mock('@/lib/slack/dm', async (importOriginal) => ({
	...(await importOriginal<typeof import('@/lib/slack/dm')>()),
	...(await import('@/test/mocks/slackDm')),
}));

import {
	grantPendingAccess,
	resendPendingGrantDm,
	revokePendingGrant,
	setPendingGrantRoles,
	setUserRoles,
} from './actions';

async function roleOf(id: string) {
	const [row] = await db()
		.select({ role: user.role, roleGrantedBy: user.roleGrantedBy })
		.from(user)
		.where(eq(user.id, id));
	return row;
}

async function grantRole(id: string) {
	const [row] = await db()
		.select({ role: pendingGrant.role })
		.from(pendingGrant)
		.where(eq(pendingGrant.id, id));
	return row?.role ?? null;
}

let admin: Awaited<ReturnType<typeof signInAs>>;

beforeEach(async () => {
	slackDirectory.members = [
		slackMember('U_ADA', { name: 'Ada', displayName: 'Ada', handle: 'ada' }),
	];
	sendSlackDm.mockResolvedValue({ ok: true, message: 'DM sent.' });
	admin = await signInAs('admin');
});

describe('setUserRoles', () => {
	test('needs admins:manage, and 404s otherwise', async () => {
		await signInAs('volunteer_coordinator');
		await expect(setUserRoles('someone', ['admin'])).rejects.toMatchObject(
			NOT_FOUND,
		);
	});

	test('refuses a role it does not recognise', async () => {
		await expect(setUserRoles('someone', ['superuser'])).resolves.toEqual({
			ok: false,
			message: 'That is not a role we recognise.',
		});
	});

	test('refuses the default role by name: it is what revoking leaves, not a grant', async () => {
		await expect(setUserRoles('someone', ['user'])).resolves.toEqual({
			ok: false,
			message: 'That is not a role we recognise.',
		});
	});

	test('an admin cannot revoke their own admin access', async () => {
		await expect(setUserRoles(admin.userId, [])).resolves.toEqual({
			ok: false,
			message: 'You cannot revoke your own admin access.',
		});
		await expect(setUserRoles(admin.userId, ['coc_reviewer'])).resolves.toEqual(
			{
				ok: false,
				message: 'You cannot revoke your own admin access.',
			},
		);
	});

	test('replaces the grantable set and records who granted it', async () => {
		const ada = await insertUser({ role: 'coc_reviewer' });

		await expect(
			setUserRoles(ada.id, ['waitlist_reviewer', 'lunch_and_learn_organizer']),
		).resolves.toEqual({ ok: true });
		await expect(roleOf(ada.id)).resolves.toEqual({
			role: 'waitlist_reviewer,lunch_and_learn_organizer',
			roleGrantedBy: 'Local dev',
		});
	});

	/**
	 * `volunteer` is granted from /admin/volunteers alongside a `volunteer`
	 * row; the dropdown here must not be able to strip it, even with "Revoke
	 * all", or that row is left accruing invites nobody can spend.
	 */
	test('preserves volunteer when the dropdown omits it, or sends nothing', async () => {
		const grace = await insertUser({ role: 'coc_reviewer,volunteer' });

		await setUserRoles(grace.id, ['admin']);
		await expect(roleOf(grace.id)).resolves.toMatchObject({
			role: 'admin,volunteer',
		});

		await setUserRoles(grace.id, []);
		await expect(roleOf(grace.id)).resolves.toMatchObject({
			role: 'volunteer',
		});

		// Sending it explicitly grants nothing extra and refuses nothing.
		await expect(setUserRoles(grace.id, ['volunteer'])).resolves.toEqual({
			ok: true,
		});
		await expect(roleOf(grace.id)).resolves.toMatchObject({
			role: 'volunteer',
		});
	});

	test('revoking everything leaves the default role and no grantor', async () => {
		const ada = await insertUser({ role: 'admin' });
		await setUserRoles(ada.id, []);
		await expect(roleOf(ada.id)).resolves.toEqual({
			role: 'user',
			roleGrantedBy: null,
		});
	});

	test('a stale row is a failure, not a silent success', async () => {
		await expect(setUserRoles('gone', ['admin'])).resolves.toEqual({
			ok: false,
			message: 'That person no longer exists. Reload the page.',
		});
	});

	/**
	 * The recovery for a claim that failed at sign-in. The grant is consumed
	 * here, or it would sit unclaimed and — once they hold a role — hidden.
	 */
	test('recovers a stranded user: applies the roles and claims the grant, keeping its volunteer', async () => {
		const ada = await insertUser({ name: 'Ada', slackUserId: 'U_ADA' });
		const grant = await insertPendingGrant({
			slackUserId: 'U_ADA',
			role: 'coc_reviewer,volunteer',
		});

		await expect(setUserRoles(ada.id, ['admin'])).resolves.toEqual({
			ok: true,
		});
		await expect(roleOf(ada.id)).resolves.toEqual({
			role: 'admin,volunteer',
			roleGrantedBy: 'Local dev',
		});
		await expect(
			db()
				.select({ claimedUserId: pendingGrant.claimedUserId })
				.from(pendingGrant)
				.where(eq(pendingGrant.id, grant.id)),
		).resolves.toEqual([{ claimedUserId: ada.id }]);
		await expect(listAccessRows()).resolves.toEqual([
			expect.objectContaining({
				kind: 'user',
				id: ada.id,
				roles: ['admin', 'volunteer'],
				stranded: false,
			}),
			expect.objectContaining({ kind: 'user', id: admin.userId }),
		]);
	});

	test('revoking everything from a stranded user withdraws the grant rather than claiming it', async () => {
		const ada = await insertUser({ name: 'Ada', slackUserId: 'U_ADA' });
		await insertPendingGrant({ slackUserId: 'U_ADA', role: 'admin' });

		await expect(setUserRoles(ada.id, [])).resolves.toEqual({ ok: true });
		await expect(roleOf(ada.id)).resolves.toEqual({
			role: 'user',
			roleGrantedBy: null,
		});
		await expect(db().select().from(pendingGrant)).resolves.toEqual([]);
		await expect(listAccessRows()).resolves.toEqual([
			expect.objectContaining({ kind: 'user', id: admin.userId }),
		]);
	});
});

describe('grantPendingAccess', () => {
	test('writes one grant per Slack member who has not signed in', async () => {
		await expect(
			grantPendingAccess('U_ADA', ['coc_reviewer']),
		).resolves.toEqual({ ok: true, message: 'DM sent.' });
		expect(sendSlackDm).toHaveBeenCalledWith(
			'U_ADA',
			expect.stringContaining('CoC reviewer'),
		);
		await expect(grantPendingAccess('U_ADA', ['admin'])).resolves.toEqual({
			ok: false,
			message: 'Ada already has access pending. Edit it in the table below.',
		});
		await expect(grantPendingAccess('U_NOBODY', ['admin'])).resolves.toEqual({
			ok: false,
			message: 'That is not someone in the Virtual Coffee Slack workspace.',
		});
		await expect(grantPendingAccess('U_ADA', [])).resolves.toEqual({
			ok: false,
			message: 'Choose at least one role to grant.',
		});

		const grants = await db().select().from(pendingGrant);
		expect(grants).toEqual([
			expect.objectContaining({
				slackUserId: 'U_ADA',
				slackDisplayName: 'Ada',
				role: 'coc_reviewer',
				grantedBy: 'Local dev',
			}),
		]);
	});

	test('someone signed in holding nothing is granted directly, and appears in the table', async () => {
		const ada = await insertUser({ name: 'Ada', slackUserId: 'U_ADA' });

		await expect(
			grantPendingAccess('U_ADA', ['coc_reviewer']),
		).resolves.toEqual({ ok: true, message: 'Ada has access now. DM sent.' });
		// Told the access is live, not that there is something to claim.
		expect(sendSlackDm).toHaveBeenCalledWith(
			'U_ADA',
			expect.stringMatching(/CoC reviewer[^]*active now/),
		);

		await expect(roleOf(ada.id)).resolves.toEqual({
			role: 'coc_reviewer',
			roleGrantedBy: 'Local dev',
		});
		await expect(db().select().from(pendingGrant)).resolves.toEqual([]);
		await expect(listAccessRows()).resolves.toContainEqual(
			expect.objectContaining({
				kind: 'user',
				id: ada.id,
				roles: ['coc_reviewer'],
				grantedBy: 'Local dev',
				stranded: false,
			}),
		);
	});

	test('someone already holding a role is edited in the table, not overwritten here', async () => {
		for (const role of ['admin', 'volunteer']) {
			const ada = await insertUser({ name: 'Ada', slackUserId: 'U_ADA', role });

			await expect(
				grantPendingAccess('U_ADA', ['coc_reviewer']),
			).resolves.toEqual({
				ok: false,
				message:
					'Ada has already signed in — set their roles in the table below.',
			});
			await expect(roleOf(ada.id)).resolves.toMatchObject({ role });

			await db().delete(user).where(eq(user.id, ada.id));
		}
	});

	test('a DM that fails after a direct grant is reported, and the grant stands', async () => {
		const ada = await insertUser({ name: 'Ada', slackUserId: 'U_ADA' });
		sendSlackDm.mockResolvedValue({
			ok: false,
			message: 'SLACK_BOT_TOKEN is not set, so no DM was sent.',
		});

		await expect(
			grantPendingAccess('U_ADA', ['coc_reviewer']),
		).resolves.toEqual({
			ok: true,
			message:
				'Ada has access now. SLACK_BOT_TOKEN is not set, so no DM was sent.',
		});
		await expect(roleOf(ada.id)).resolves.toMatchObject({
			role: 'coc_reviewer',
		});
	});

	test('a stranded user keeps their unclaimed grant rather than being granted over it', async () => {
		const ada = await insertUser({ name: 'Ada', slackUserId: 'U_ADA' });
		await insertPendingGrant({ slackUserId: 'U_ADA', role: 'admin' });

		await expect(
			grantPendingAccess('U_ADA', ['coc_reviewer']),
		).resolves.toEqual({
			ok: false,
			message: 'Ada already has access pending. Edit it in the table below.',
		});
		await expect(roleOf(ada.id)).resolves.toMatchObject({ role: null });
	});

	test('a first sign-in that lands mid-action is granted directly', async () => {
		let ada: { id: string } | undefined;
		slackDirectory.during = async () => {
			ada = await insertUser({ name: 'Ada', slackUserId: 'U_ADA' });
		};

		await expect(
			grantPendingAccess('U_ADA', ['coc_reviewer']),
		).resolves.toEqual({ ok: true, message: 'Ada has access now. DM sent.' });
		expect(sendSlackDm).toHaveBeenCalledWith(
			'U_ADA',
			expect.stringContaining('active now'),
		);

		await expect(roleOf(ada!.id)).resolves.toEqual({
			role: 'coc_reviewer',
			roleGrantedBy: 'Local dev',
		});
		await expect(db().select().from(pendingGrant)).resolves.toEqual([]);
	});

	test('any other failure surfaces rather than posing as a duplicate', async () => {
		const fault = await failInserts('pending_grant');
		try {
			await expect(
				grantPendingAccess('U_ADA', ['coc_reviewer']),
			).rejects.toThrow(/insert into "pending_grant"/);
		} finally {
			await fault.remove();
		}
	});
});

describe('resendPendingGrantDm', () => {
	test('a malformed id is a not-found, not a 22P02', async () => {
		await expect(resendPendingGrantDm('42')).resolves.toEqual({
			ok: false,
			message: 'That grant no longer exists. Reload the page.',
		});
		expect(sendSlackDm).not.toHaveBeenCalled();
	});

	test('re-sends to the grant’s Slack member with its current roles', async () => {
		const { id } = await insertPendingGrant({
			slackUserId: 'U_GRACE',
			role: 'coc_reviewer,volunteer',
		});

		await expect(resendPendingGrantDm(id)).resolves.toEqual({
			ok: true,
			message: 'DM sent.',
		});
		expect(sendSlackDm).toHaveBeenCalledWith(
			'U_GRACE',
			expect.stringContaining('CoC reviewer, Volunteer'),
		);
	});

	test('a claimed grant is left alone', async () => {
		const [claimed] = await db()
			.insert(pendingGrant)
			.values({
				slackUserId: 'U_ADA',
				slackDisplayName: 'Ada',
				role: 'admin',
				grantedBy: 'x',
				claimedAt: new Date(),
			})
			.returning({ id: pendingGrant.id });

		await expect(resendPendingGrantDm(claimed.id)).resolves.toEqual({
			ok: false,
			message: 'That grant has already been claimed. Reload the page.',
		});
		expect(sendSlackDm).not.toHaveBeenCalled();
	});

	test('reports rather than throws when the DM fails', async () => {
		sendSlackDm.mockResolvedValue({
			ok: false,
			message: 'SLACK_BOT_TOKEN is not set, so no DM was sent.',
		});
		const { id } = await insertPendingGrant({
			slackUserId: 'U_ADA',
			role: 'admin',
		});

		await expect(resendPendingGrantDm(id)).resolves.toEqual({
			ok: false,
			message: 'SLACK_BOT_TOKEN is not set, so no DM was sent.',
		});
	});
});

describe('setPendingGrantRoles and revokePendingGrant', () => {
	test('a malformed id is a not-found, not a 22P02', async () => {
		await expect(setPendingGrantRoles('42', ['admin'])).resolves.toEqual({
			ok: false,
			message: 'That grant no longer exists. Reload the page.',
		});
		await expect(revokePendingGrant('42')).resolves.toEqual({
			ok: false,
			message: 'That grant no longer exists. Reload the page.',
		});
	});

	test('edits keep volunteer, and an empty result is refused rather than stored', async () => {
		const { id } = await insertPendingGrant({
			slackUserId: 'U_GRACE',
			role: 'coc_reviewer,volunteer',
		});

		await expect(setPendingGrantRoles(id, ['admin'])).resolves.toEqual({
			ok: true,
		});
		await expect(grantRole(id)).resolves.toBe('admin,volunteer');

		await expect(setPendingGrantRoles(id, [])).resolves.toEqual({ ok: true });
		await expect(grantRole(id)).resolves.toBe('volunteer');

		const plain = await insertPendingGrant({
			slackUserId: 'U_ADA',
			role: 'admin',
		});
		await expect(setPendingGrantRoles(plain.id, [])).resolves.toEqual({
			ok: false,
			message: 'Revoke the grant instead of leaving it with no roles.',
		});
	});

	test('revoke deletes an unclaimed grant, but never one carrying volunteer', async () => {
		const plain = await insertPendingGrant({
			slackUserId: 'U_ADA',
			role: 'admin',
		});
		const withVolunteer = await insertPendingGrant({
			slackUserId: 'U_GRACE',
			role: 'admin,volunteer',
		});

		await expect(revokePendingGrant(plain.id)).resolves.toEqual({ ok: true });
		await expect(grantRole(plain.id)).resolves.toBeNull();

		await expect(revokePendingGrant(withVolunteer.id)).resolves.toEqual({
			ok: false,
			message:
				'This grant includes Volunteer access. Remove it in Admin → Volunteers.',
		});
		await expect(grantRole(withVolunteer.id)).resolves.toBe('admin,volunteer');
	});

	test('a claimed grant is left alone by both', async () => {
		const [claimed] = await db()
			.insert(pendingGrant)
			.values({
				slackUserId: 'U_ADA',
				slackDisplayName: 'Ada',
				role: 'admin',
				grantedBy: 'x',
				claimedAt: new Date(),
			})
			.returning({ id: pendingGrant.id });

		await expect(
			setPendingGrantRoles(claimed.id, ['coc_reviewer']),
		).resolves.toEqual({
			ok: false,
			message: 'That grant has already been claimed. Reload the page.',
		});
		await expect(revokePendingGrant(claimed.id)).resolves.toMatchObject({
			ok: false,
		});
		await expect(grantRole(claimed.id)).resolves.toBe('admin');
	});
});
