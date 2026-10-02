import { eq, type SQL } from 'drizzle-orm';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { db, pendingGrant, user, volunteer } from '@/db';
import {
	failWrites,
	insertPendingGrant,
	insertUser,
	insertVolunteer,
} from '@/test/db/fixtures';

import { listAccessRows } from './admins';
import {
	addVolunteerRole,
	claimOnSignIn,
	grantToSlackMember,
	removeVolunteerRole,
	replaceRoles,
	setGrantRoles,
	withdrawGrant,
} from './roleAssignment';

async function userRow(id: string) {
	const [row] = await db().select().from(user).where(eq(user.id, id));
	return row;
}

async function grantRows(slackUserId: string) {
	return db()
		.select({
			role: pendingGrant.role,
			claimedAt: pendingGrant.claimedAt,
			claimedUserId: pendingGrant.claimedUserId,
		})
		.from(pendingGrant)
		.where(eq(pendingGrant.slackUserId, slackUserId));
}

const admin = { userId: 'user-admin', name: 'user-admin' };

const slackAccount = (userId: string, accountId: string) => ({
	providerId: 'slack',
	accountId,
	userId,
});

beforeEach(() => vi.stubEnv('ADMIN_BOOTSTRAP_SLACK_IDS', undefined));

describe('claimOnSignIn', () => {
	/** ADR 0009: matched on the Slack member id, never on email. */
	test('applies the grant for the Slack id, with the original grantor and date', async () => {
		const grantedAt = new Date('2026-08-01T12:00:00Z');
		await db().insert(pendingGrant).values({
			slackUserId: 'U_ADA',
			slackDisplayName: 'Ada',
			role: 'coc_reviewer,waitlist_reviewer',
			grantedBy: 'user-admin',
			grantedAt,
		});
		const ada = await insertUser({ email: 'ada@example.test' });

		await expect(claimOnSignIn(slackAccount(ada.id, 'U_ADA'))).resolves.toBe(
			true,
		);

		await expect(userRow(ada.id)).resolves.toMatchObject({
			slackUserId: 'U_ADA',
			role: 'coc_reviewer,waitlist_reviewer',
			roleGrantedBy: 'user-admin',
			roleGrantedAt: grantedAt,
		});
		const [grant] = await grantRows('U_ADA');
		expect(grant.claimedAt).toBeInstanceOf(Date);
		expect(grant.claimedUserId).toBe(ada.id);
	});

	test('a grant for someone else with the same email is not claimed', async () => {
		await insertPendingGrant({ slackUserId: 'U_OTHER', role: 'admin' });
		const ada = await insertUser({ email: 'shared@example.test' });

		await claimOnSignIn(slackAccount(ada.id, 'U_ADA'));

		await expect(userRow(ada.id)).resolves.toMatchObject({
			slackUserId: 'U_ADA',
			role: null,
		});
		const [grant] = await grantRows('U_OTHER');
		expect(grant.claimedAt).toBeNull();
	});

	test('only ever grants, never revokes: someone who already holds access keeps it', async () => {
		await insertPendingGrant({ slackUserId: 'U_ADA', role: 'coc_reviewer' });
		const ada = await insertUser({ role: 'admin' });

		await claimOnSignIn(slackAccount(ada.id, 'U_ADA'));

		await expect(userRow(ada.id)).resolves.toMatchObject({
			slackUserId: 'U_ADA',
			role: 'admin',
		});
		const [grant] = await grantRows('U_ADA');
		expect(grant.claimedAt).toBeNull();
	});

	test('the bootstrap list makes a first admin, and is ignored once they hold anything', async () => {
		vi.stubEnv('ADMIN_BOOTSTRAP_SLACK_IDS', 'U_FIRST, U_SECOND');
		const first = await insertUser({});
		const second = await insertUser({ role: 'coc_reviewer' });

		await claimOnSignIn(slackAccount(first.id, 'U_FIRST'));
		await claimOnSignIn(slackAccount(second.id, 'U_SECOND'));

		await expect(userRow(first.id)).resolves.toMatchObject({
			role: 'admin',
			roleGrantedBy: 'ADMIN_BOOTSTRAP_SLACK_IDS',
		});
		await expect(userRow(second.id)).resolves.toMatchObject({
			role: 'coc_reviewer',
		});
	});

	test('a bootstrap admin who also holds a Pending Grant gets both, and the grant is claimed', async () => {
		vi.stubEnv('ADMIN_BOOTSTRAP_SLACK_IDS', 'U_BOTH');
		const grantedAt = new Date('2026-08-01T12:00:00Z');
		await db().insert(pendingGrant).values({
			slackUserId: 'U_BOTH',
			slackDisplayName: 'Both',
			role: 'volunteer',
			grantedBy: 'user-admin',
			grantedAt,
		});
		const both = await insertUser({});

		await claimOnSignIn(slackAccount(both.id, 'U_BOTH'));

		await expect(userRow(both.id)).resolves.toMatchObject({
			role: 'admin,volunteer',
			roleGrantedBy: 'user-admin',
			roleGrantedAt: grantedAt,
		});
		const [grant] = await grantRows('U_BOTH');
		expect(grant.claimedAt).toBeInstanceOf(Date);
		expect(grant.claimedUserId).toBe(both.id);
	});

	test('links a Volunteer row added before sign-in to its owner, grant or no grant', async () => {
		await insertVolunteer({ slackUserId: 'U_GRACE' });
		const grace = await insertUser({ role: 'admin' });

		await claimOnSignIn(slackAccount(grace.id, 'U_GRACE'));

		const [row] = await db()
			.select({ userId: volunteer.userId })
			.from(volunteer)
			.where(eq(volunteer.slackUserId, 'U_GRACE'));
		expect(row.userId).toBe(grace.id);
	});

	/**
	 * ADR 0009 promises that a failed claim strands nobody: listAccessRows()
	 * finds them by Slack id. That only holds if the Slack id was written
	 * before the part that failed.
	 */
	test('a claim that fails still records the Slack id, so the person can be found', async () => {
		const ada = await insertUser({});
		await insertPendingGrant({ slackUserId: 'U_ADA', role: 'coc_reviewer' });
		const trigger = await failWrites('pending_grant', 'update');
		const error = vi.spyOn(console, 'error').mockImplementation(() => {});

		try {
			await expect(claimOnSignIn(slackAccount(ada.id, 'U_ADA'))).resolves.toBe(
				false,
			);

			expect(error).toHaveBeenCalledOnce();
			await expect(userRow(ada.id)).resolves.toMatchObject({
				slackUserId: 'U_ADA',
				role: null,
			});
			await expect(grantRows('U_ADA')).resolves.toMatchObject([
				{ claimedAt: null },
			]);
			// Badged, and showing what the grant held so a maintainer can see
			// what to apply; it is not listed a second time as pending.
			await expect(listAccessRows()).resolves.toEqual([
				expect.objectContaining({
					kind: 'user',
					id: ada.id,
					stranded: true,
					roles: ['coc_reviewer'],
					grantedBy: 'user-admin',
					grantedAt: expect.any(Date),
				}),
			]);
		} finally {
			await trigger.remove();
			error.mockRestore();
		}
	});

	test('ignores accounts from other providers, and never throws', async () => {
		const ada = await insertUser({});
		await claimOnSignIn({
			providerId: 'github',
			accountId: 'U_ADA',
			userId: ada.id,
		});
		await expect(userRow(ada.id)).resolves.toMatchObject({ slackUserId: null });

		const error = vi.spyOn(console, 'error').mockImplementation(() => {});
		// Nothing to claim is not a failure.
		await expect(
			claimOnSignIn(slackAccount('no-such-user', 'U_ADA')),
		).resolves.toBe(true);
		// Two users claiming the same Slack id: the second violates the unique
		// column, and sign-in must still not fail.
		await claimOnSignIn(slackAccount(ada.id, 'U_ADA'));
		const other = await insertUser({});
		await expect(claimOnSignIn(slackAccount(other.id, 'U_ADA'))).resolves.toBe(
			false,
		);
		expect(error).toHaveBeenCalledOnce();
		error.mockRestore();
	});
});

describe('addVolunteerRole', () => {
	const member = {
		slackUserId: 'U_GRACE',
		slackDisplayName: 'Grace Hopper',
		slackHandle: 'grace',
	};

	test('adds the role directly when the person has signed in', async () => {
		const grace = await insertUser({
			role: 'coc_reviewer',
			slackUserId: 'U_GRACE',
		});

		const outcome = await db().transaction((tx) =>
			addVolunteerRole(tx, member, admin),
		);

		expect(outcome).toMatchObject({ kind: 'applied', userId: grace.id });

		await expect(userRow(grace.id)).resolves.toMatchObject({
			role: 'coc_reviewer,volunteer',
			roleGrantedBy: 'user-admin',
		});
		await expect(grantRows('U_GRACE')).resolves.toEqual([]);
	});

	test('otherwise writes a Pending Grant, merging into an existing one', async () => {
		await expect(
			db().transaction((tx) => addVolunteerRole(tx, member, admin)),
		).resolves.toMatchObject({ kind: 'pending' });
		await expect(grantRows('U_GRACE')).resolves.toEqual([
			{ role: 'volunteer', claimedAt: null, claimedUserId: null },
		]);

		// Repeating changes nothing; a second unclaimed grant would violate the
		// partial unique index, so merging is the only option.
		await db().transaction((tx) => addVolunteerRole(tx, member, admin));
		await expect(grantRows('U_GRACE')).resolves.toHaveLength(1);

		await expect(
			insertPendingGrant({ slackUserId: 'U_GRACE', role: 'admin' }),
		).rejects.toMatchObject({
			cause: { constraint: 'pending_grant_unclaimed_slack_user_id_idx' },
		});
	});

	test('merges into a grant User Management already wrote', async () => {
		await insertPendingGrant({ slackUserId: 'U_GRACE', role: 'coc_reviewer' });

		await db().transaction((tx) => addVolunteerRole(tx, member, admin));

		await expect(grantRows('U_GRACE')).resolves.toEqual([
			expect.objectContaining({ role: 'coc_reviewer,volunteer' }),
		]);
	});

	test('applies and claims a grant left behind by a failed claim', async () => {
		const grace = await insertUser({ name: 'Grace', slackUserId: 'U_GRACE' });
		await insertPendingGrant({ slackUserId: 'U_GRACE', role: 'admin' });

		await db().transaction((tx) => addVolunteerRole(tx, member, admin));

		await expect(userRow(grace.id)).resolves.toMatchObject({
			role: 'admin,volunteer',
			roleGrantedBy: 'user-admin',
		});
		await expect(grantRows('U_GRACE')).resolves.toEqual([
			{
				role: 'admin',
				claimedAt: expect.any(Date),
				claimedUserId: grace.id,
			},
		]);
		await expect(listAccessRows()).resolves.toEqual([
			expect.objectContaining({
				kind: 'user',
				id: grace.id,
				roles: ['admin', 'volunteer'],
				stranded: false,
			}),
		]);

		// Repeating changes nothing: the grant is claimed, and there is nothing
		// left to merge.
		await db().transaction((tx) => addVolunteerRole(tx, member, admin));
		await expect(userRow(grace.id)).resolves.toMatchObject({
			role: 'admin,volunteer',
		});
	});
});

describe('removeVolunteerRole', () => {
	test('takes volunteer off the user and the Grant, withdrawing an empty Grant', async () => {
		const ada = await insertUser({
			role: 'admin,volunteer',
			slackUserId: 'U_ADA',
		});
		await insertPendingGrant({ slackUserId: 'U_ADA', role: 'volunteer' });

		await expect(
			db().transaction((tx) => removeVolunteerRole(tx, 'U_ADA')),
		).resolves.toMatchObject({ kind: 'applied', userId: ada.id });

		await expect(userRow(ada.id)).resolves.toMatchObject({ role: 'admin' });
		await expect(grantRows('U_ADA')).resolves.toEqual([]);
	});

	test('leaves the default role when volunteer was the only one', async () => {
		const ada = await insertUser({ role: 'volunteer', slackUserId: 'U_ADA' });

		await db().transaction((tx) => removeVolunteerRole(tx, 'U_ADA'));

		await expect(userRow(ada.id)).resolves.toMatchObject({ role: 'user' });
	});

	test('is stale when they held it nowhere', async () => {
		await expect(
			db().transaction((tx) => removeVolunteerRole(tx, 'U_NOBODY')),
		).resolves.toEqual({ kind: 'stale' });
	});
});

describe('replaceRoles', () => {
	test('revoke-all on a volunteer-only user keeps volunteer and names the grantor', async () => {
		const ada = await insertUser({ role: 'volunteer' });

		await db().transaction((tx) => replaceRoles(tx, ada.id, [], admin));

		await expect(userRow(ada.id)).resolves.toMatchObject({
			role: 'volunteer',
			roleGrantedBy: 'user-admin',
		});
	});

	test('revoke-all leaves the default role and no grantor', async () => {
		const ada = await insertUser({ role: 'admin' });

		await db().transaction((tx) => replaceRoles(tx, ada.id, [], admin));

		await expect(userRow(ada.id)).resolves.toMatchObject({
			role: 'user',
			roleGrantedBy: null,
			roleGrantedAt: null,
		});
	});

	/**
	 * A user with no Slack id takes no lock, so the write is pinned to still
	 * having none; the shim stands in for a sign-in landing before the write.
	 */
	test('is stale when a sign-in gives a Slack-less user an id before the write', async () => {
		const ada = await insertUser({});

		const outcome = await db().transaction((tx) => {
			const racing = new Proxy(tx, {
				get(target, prop, receiver) {
					if (prop !== 'update') return Reflect.get(target, prop, receiver);
					return (table: typeof user) => ({
						set: (values: object) => ({
							where: async (where: SQL) => {
								await target
									.update(user)
									.set({ slackUserId: 'U_RACE', role: 'admin' })
									.where(eq(user.id, ada.id));
								return target.update(table).set(values).where(where);
							},
						}),
					});
				},
			});
			return replaceRoles(racing, ada.id, ['coc_reviewer'], admin);
		});

		expect(outcome).toEqual({ kind: 'stale' });
	});

	test('is stale when the Slack id changes between the read and the lock', async () => {
		const ada = await insertUser({ slackUserId: 'U_ADA', role: 'admin' });

		const outcome = await db().transaction((tx) => {
			const racing = new Proxy(tx, {
				get(target, prop, receiver) {
					if (prop !== 'execute') return Reflect.get(target, prop, receiver);
					return async (query: SQL) => {
						const locked = await target.execute(query);
						await target
							.update(user)
							.set({ slackUserId: 'U_OTHER' })
							.where(eq(user.id, ada.id));
						return locked;
					};
				},
			});
			return replaceRoles(racing, ada.id, ['coc_reviewer'], admin);
		});

		expect(outcome).toEqual({ kind: 'stale' });
		await expect(userRow(ada.id)).resolves.toMatchObject({ role: 'admin' });
	});

	test('keeps volunteer, which User Management does not grant', async () => {
		const ada = await insertUser({ role: 'admin,volunteer' });

		await expect(
			db().transaction((tx) =>
				replaceRoles(tx, ada.id, ['coc_reviewer'], admin),
			),
		).resolves.toMatchObject({ kind: 'applied' });

		await expect(userRow(ada.id)).resolves.toMatchObject({
			role: 'coc_reviewer,volunteer',
			roleGrantedBy: 'user-admin',
		});
	});

	test('applies and claims a stranded Grant, keeping what it carried', async () => {
		const ada = await insertUser({ slackUserId: 'U_ADA' });
		await insertPendingGrant({ slackUserId: 'U_ADA', role: 'volunteer' });

		await db().transaction((tx) =>
			replaceRoles(tx, ada.id, ['coc_reviewer'], admin),
		);

		await expect(userRow(ada.id)).resolves.toMatchObject({
			role: 'coc_reviewer,volunteer',
		});
		await expect(grantRows('U_ADA')).resolves.toMatchObject([
			{ claimedUserId: ada.id },
		]);
	});

	test('revoke-all withdraws a stranded Grant that never took effect', async () => {
		const ada = await insertUser({ slackUserId: 'U_ADA' });
		await insertPendingGrant({ slackUserId: 'U_ADA', role: 'coc_reviewer' });

		await db().transaction((tx) => replaceRoles(tx, ada.id, [], admin));

		await expect(grantRows('U_ADA')).resolves.toEqual([]);
		await expect(userRow(ada.id)).resolves.toMatchObject({
			roleGrantedBy: null,
		});
	});

	test("refuses to drop the actor's own admin, and is stale for a missing user", async () => {
		const me = await insertUser({ role: 'admin' });

		await expect(
			db().transaction((tx) =>
				replaceRoles(tx, me.id, ['coc_reviewer'], {
					userId: me.id,
					name: 'Me',
				}),
			),
		).resolves.toEqual({ kind: 'refused', reason: 'self-demotion' });
		await expect(userRow(me.id)).resolves.toMatchObject({ role: 'admin' });

		await expect(
			db().transaction((tx) => replaceRoles(tx, 'no-such-user', [], admin)),
		).resolves.toEqual({ kind: 'stale' });
	});
});

describe('grantToSlackMember', () => {
	const member = {
		slackUserId: 'U_NEW',
		slackDisplayName: 'New',
		slackHandle: 'new',
	};

	test('is applied for someone who signed in holding nothing, pending otherwise', async () => {
		await expect(
			db().transaction((tx) =>
				grantToSlackMember(tx, member, ['coc_reviewer'], admin),
			),
		).resolves.toMatchObject({ kind: 'pending' });
		await expect(grantRows('U_NEW')).resolves.toMatchObject([
			{ role: 'coc_reviewer' },
		]);

		const signedIn = await insertUser({ slackUserId: 'U_IN', name: 'Ines' });
		await expect(
			db().transaction((tx) =>
				grantToSlackMember(
					tx,
					{ ...member, slackUserId: 'U_IN' },
					['coc_reviewer'],
					admin,
				),
			),
		).resolves.toEqual({ kind: 'applied', userId: signedIn.id, name: 'Ines' });
		await expect(userRow(signedIn.id)).resolves.toMatchObject({
			role: 'coc_reviewer',
			roleGrantedBy: 'user-admin',
		});
	});

	test('refuses someone who already holds a role, or already has a Grant, or asks for nothing', async () => {
		await insertUser({ slackUserId: 'U_HOLD', role: 'admin', name: 'Hal' });
		await insertPendingGrant({ slackUserId: 'U_WAIT', role: 'admin' });

		const run = (
			slackUserId: string,
			roles: Parameters<typeof grantToSlackMember>[2],
		) =>
			db().transaction((tx) =>
				grantToSlackMember(tx, { ...member, slackUserId }, roles, admin),
			);

		await expect(run('U_HOLD', ['coc_reviewer'])).resolves.toEqual({
			kind: 'refused',
			reason: 'already-has-roles',
			name: 'Hal',
		});
		await expect(run('U_WAIT', ['coc_reviewer'])).resolves.toEqual({
			kind: 'refused',
			reason: 'already-pending',
		});
		await expect(run('U_NEW', [])).resolves.toEqual({
			kind: 'refused',
			reason: 'empty',
		});
	});
});

describe('setGrantRoles and withdrawGrant', () => {
	test('setGrantRoles accepts an empty request on a volunteer Grant and stores volunteer', async () => {
		const vol = await insertPendingGrant({
			slackUserId: 'U_V',
			role: 'coc_reviewer,volunteer',
		});

		await expect(
			db().transaction((tx) => setGrantRoles(tx, vol.id, [])),
		).resolves.toEqual({ kind: 'pending', grantId: vol.id });
		await expect(grantRows('U_V')).resolves.toMatchObject([
			{ role: 'volunteer' },
		]);
	});

	test('setGrantRoles keeps volunteer, refuses an empty result, and is stale once claimed', async () => {
		const plain = await insertPendingGrant({
			slackUserId: 'U_A',
			role: 'admin',
		});
		const vol = await insertPendingGrant({
			slackUserId: 'U_B',
			role: 'volunteer',
		});

		const set = (id: string, roles: Parameters<typeof setGrantRoles>[2]) =>
			db().transaction((tx) => setGrantRoles(tx, id, roles));

		await expect(set(plain.id, ['coc_reviewer'])).resolves.toEqual({
			kind: 'pending',
			grantId: plain.id,
		});
		await expect(set(plain.id, [])).resolves.toEqual({
			kind: 'refused',
			reason: 'empty',
		});
		await expect(set(vol.id, ['coc_reviewer'])).resolves.toMatchObject({
			kind: 'pending',
		});
		await expect(grantRows('U_B')).resolves.toMatchObject([
			{ role: 'coc_reviewer,volunteer' },
		]);

		const ada = await insertUser({});
		await claimOnSignIn(slackAccount(ada.id, 'U_A'));
		await expect(set(plain.id, ['admin'])).resolves.toEqual({ kind: 'stale' });
	});

	test('withdrawGrant deletes an unclaimed Grant but refuses one holding volunteer', async () => {
		const plain = await insertPendingGrant({
			slackUserId: 'U_A',
			role: 'admin',
		});
		const vol = await insertPendingGrant({
			slackUserId: 'U_B',
			role: 'admin,volunteer',
		});

		await expect(
			db().transaction((tx) => withdrawGrant(tx, vol.id)),
		).resolves.toEqual({ kind: 'refused', reason: 'holds-volunteer' });
		await expect(grantRows('U_B')).resolves.toHaveLength(1);

		await expect(
			db().transaction((tx) => withdrawGrant(tx, plain.id)),
		).resolves.toMatchObject({ kind: 'pending' });
		await expect(grantRows('U_A')).resolves.toEqual([]);
		await expect(
			db().transaction((tx) => withdrawGrant(tx, plain.id)),
		).resolves.toEqual({ kind: 'stale' });
	});
});
