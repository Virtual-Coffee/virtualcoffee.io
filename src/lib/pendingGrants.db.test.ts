import { eq } from 'drizzle-orm';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { db, pendingGrant, user, volunteer } from '@/db';
import {
	insertPendingGrant,
	insertUser,
	insertVolunteer,
} from '@/test/db/fixtures';

import { claimPendingGrant, grantVolunteerRole } from './pendingGrants';

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

const slackAccount = (userId: string, accountId: string) => ({
	providerId: 'slack',
	accountId,
	userId,
});

beforeEach(() => vi.stubEnv('ADMIN_BOOTSTRAP_SLACK_IDS', undefined));

describe('claimPendingGrant', () => {
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

		await claimPendingGrant(slackAccount(ada.id, 'U_ADA'));

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

		await claimPendingGrant(slackAccount(ada.id, 'U_ADA'));

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

		await claimPendingGrant(slackAccount(ada.id, 'U_ADA'));

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

		await claimPendingGrant(slackAccount(first.id, 'U_FIRST'));
		await claimPendingGrant(slackAccount(second.id, 'U_SECOND'));

		await expect(userRow(first.id)).resolves.toMatchObject({
			role: 'admin',
			roleGrantedBy: 'ADMIN_BOOTSTRAP_SLACK_IDS',
		});
		await expect(userRow(second.id)).resolves.toMatchObject({
			role: 'coc_reviewer',
		});
	});

	test('links a pre-provisioned Volunteer row to its owner, grant or no grant', async () => {
		await insertVolunteer({ slackUserId: 'U_GRACE' });
		const grace = await insertUser({ role: 'admin' });

		await claimPendingGrant(slackAccount(grace.id, 'U_GRACE'));

		const [row] = await db()
			.select({ userId: volunteer.userId })
			.from(volunteer)
			.where(eq(volunteer.slackUserId, 'U_GRACE'));
		expect(row.userId).toBe(grace.id);
	});

	test('ignores accounts from other providers, and never throws', async () => {
		const ada = await insertUser({});
		await claimPendingGrant({
			providerId: 'github',
			accountId: 'U_ADA',
			userId: ada.id,
		});
		await expect(userRow(ada.id)).resolves.toMatchObject({ slackUserId: null });

		const error = vi.spyOn(console, 'error').mockImplementation(() => {});
		await expect(
			claimPendingGrant(slackAccount('no-such-user', 'U_ADA')),
		).resolves.toBeUndefined();
		// Two users claiming the same Slack id: the second violates the unique
		// column, and sign-in must still not fail.
		await claimPendingGrant(slackAccount(ada.id, 'U_ADA'));
		const other = await insertUser({});
		await expect(
			claimPendingGrant(slackAccount(other.id, 'U_ADA')),
		).resolves.toBeUndefined();
		expect(error).toHaveBeenCalledOnce();
		error.mockRestore();
	});
});

describe('grantVolunteerRole', () => {
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

		await db().transaction((tx) =>
			grantVolunteerRole(tx, member, 'user-admin'),
		);

		await expect(userRow(grace.id)).resolves.toMatchObject({
			role: 'coc_reviewer,volunteer',
			roleGrantedBy: 'user-admin',
		});
		await expect(grantRows('U_GRACE')).resolves.toEqual([]);
	});

	test('otherwise writes a Pending Grant, merging into an existing one', async () => {
		await db().transaction((tx) =>
			grantVolunteerRole(tx, member, 'user-admin'),
		);
		await expect(grantRows('U_GRACE')).resolves.toEqual([
			{ role: 'volunteer', claimedAt: null, claimedUserId: null },
		]);

		// Repeating changes nothing; a second unclaimed grant would violate the
		// partial unique index, so merging is the only option.
		await db().transaction((tx) =>
			grantVolunteerRole(tx, member, 'user-admin'),
		);
		await expect(grantRows('U_GRACE')).resolves.toHaveLength(1);

		await expect(
			insertPendingGrant({ slackUserId: 'U_GRACE', role: 'admin' }),
		).rejects.toMatchObject({
			cause: { constraint: 'pending_grant_unclaimed_slack_user_id_idx' },
		});
	});

	test('merges into a grant User Management already wrote', async () => {
		await insertPendingGrant({ slackUserId: 'U_GRACE', role: 'coc_reviewer' });

		await db().transaction((tx) =>
			grantVolunteerRole(tx, member, 'user-admin'),
		);

		await expect(grantRows('U_GRACE')).resolves.toEqual([
			expect.objectContaining({ role: 'coc_reviewer,volunteer' }),
		]);
	});
});
