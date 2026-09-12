import { eq } from 'drizzle-orm';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { db, pendingGrant, user } from '@/db';
import { signInAs } from '@/test/session';
import {
	failInserts,
	insertPendingGrant,
	insertUser,
} from '@/test/db/fixtures';

vi.mock('@/data/slackMembers', () => ({
	getSlackMembers: async () => [
		{
			id: 'U_ADA',
			name: 'Ada',
			displayName: 'Ada',
			handle: 'ada',
		},
	],
}));

import {
	grantPendingAccess,
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

beforeEach(() => signInAs('admin'));

describe('setUserRoles', () => {
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
});

describe('grantPendingAccess', () => {
	test('writes one grant per Slack member, and only for members who have not signed in', async () => {
		await expect(
			grantPendingAccess('U_ADA', ['coc_reviewer']),
		).resolves.toEqual({ ok: true });
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

		const grace = await insertUser({ name: 'Grace', slackUserId: 'U_GRACE' });
		await expect(grantPendingAccess('U_GRACE', ['admin'])).resolves.toEqual({
			ok: false,
			message:
				'Grace has already signed in — set their roles in the table below.',
		});
		expect(grace.id).toBeTruthy();

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
