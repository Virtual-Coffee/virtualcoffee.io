import { expect, test } from 'vitest';

import { insertPendingGrant, insertUser } from '@/test/db/fixtures';
import { slackDirectory, slackMember } from '@/test/mocks/slackMembers';

import { grantCandidates, listAccessRows } from './admins';

test('a candidate says whether a grant is pre-provisioned, applied directly, or edited in the table', async () => {
	slackDirectory.members = [
		'U_NEW',
		'U_STRANDED',
		'U_NO_ROLES',
		'U_ADMIN',
		'U_VOLUNTEER',
	].map((id) => slackMember(id));
	await insertUser({ slackUserId: 'U_STRANDED' });
	await insertPendingGrant({ slackUserId: 'U_STRANDED', role: 'admin' });
	await insertUser({ slackUserId: 'U_NO_ROLES' });
	await insertUser({ slackUserId: 'U_ADMIN', role: 'admin' });
	// A Volunteer holds a role but no Section; they are in the table all the same.
	await insertUser({ slackUserId: 'U_VOLUNTEER', role: 'volunteer' });

	const byId = Object.fromEntries(
		(await grantCandidates()).map((c) => [
			c.id,
			{ account: c.account, hasPendingGrant: c.hasPendingGrant },
		]),
	);

	expect(byId).toEqual({
		U_NEW: { account: 'none', hasPendingGrant: false },
		U_STRANDED: { account: 'noRoles', hasPendingGrant: true },
		U_NO_ROLES: { account: 'noRoles', hasPendingGrant: false },
		U_ADMIN: { account: 'hasRoles', hasPendingGrant: false },
		U_VOLUNTEER: { account: 'hasRoles', hasPendingGrant: false },
	});
});

test('a Grant beside a role-holder is its own pending row, not hidden behind them', async () => {
	// Better Auth links a second Slack account onto an existing role-holder,
	// and `claimPendingGrant()` leaves the Grant alone rather than rewrite
	// their roles. Nothing else applies it, so User Management must show it.
	await insertUser({ name: 'Grace', slackUserId: 'U_HOLDER', role: 'admin' });
	await insertPendingGrant({ slackUserId: 'U_HOLDER', role: 'coc_reviewer' });

	const rows = await listAccessRows();

	expect(rows).toEqual([
		expect.objectContaining({
			kind: 'user',
			name: 'Grace',
			roles: ['admin'],
			stranded: false,
		}),
		expect.objectContaining({
			kind: 'pending',
			handle: null,
			roles: ['coc_reviewer'],
			stranded: false,
		}),
	]);
});
