import { expect, test, vi } from 'vitest';

import { insertPendingGrant, insertUser } from '@/test/db/fixtures';

vi.mock('@/data/slackMembers', () => ({
	getSlackMembers: async () =>
		['U_NEW', 'U_STRANDED', 'U_NO_ROLES', 'U_ADMIN', 'U_VOLUNTEER'].map(
			(id) => ({ id, name: id, displayName: id, handle: null }),
		),
}));

import { grantCandidates } from './admins';

test('a candidate says whether a grant is pre-provisioned, applied directly, or edited in the table', async () => {
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
