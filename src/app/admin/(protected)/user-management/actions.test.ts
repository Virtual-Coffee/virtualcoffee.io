import { afterEach, describe, expect, test, vi } from 'vitest';

import { NOT_FOUND, signInAs } from '@/test/session';
import { setUserRoles } from './actions';

/**
 * Only the branches that answer before the database. The dev-bypass session
 * has id `dev-bypass`, so the self-demotion guard is reachable too.
 */
describe('setUserRoles', () => {
	afterEach(() => vi.unstubAllEnvs());

	test('needs admins:manage, and 404s otherwise', async () => {
		signInAs('volunteer_coordinator');
		await expect(setUserRoles('someone', ['admin'])).rejects.toMatchObject(
			NOT_FOUND,
		);
	});

	test('refuses a role it does not recognise', async () => {
		signInAs('admin');
		await expect(setUserRoles('someone', ['superuser'])).resolves.toEqual({
			ok: false,
			message: 'That is not a role we recognise.',
		});
	});

	test('refuses the default role by name: it is what revoking leaves, not a grant', async () => {
		signInAs('admin');
		await expect(setUserRoles('someone', ['user'])).resolves.toEqual({
			ok: false,
			message: 'That is not a role we recognise.',
		});
	});

	test('an admin cannot revoke their own admin access', async () => {
		signInAs('admin');
		await expect(setUserRoles('dev-bypass', [])).resolves.toEqual({
			ok: false,
			message: 'You cannot revoke your own admin access.',
		});
		await expect(setUserRoles('dev-bypass', ['coc_reviewer'])).resolves.toEqual(
			{
				ok: false,
				message: 'You cannot revoke your own admin access.',
			},
		);
	});
});
