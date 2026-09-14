import { afterEach, describe, expect, test, vi } from 'vitest';

import { actorId, getSession, requirePermission } from './adminAccess';
import { requestHeaders } from '@/test/requestHeaders';
import { signInAs } from '@/test/session';

/**
 * The one place the dev bypass is still switched on in a test: it is the
 * subject. Everywhere else `signInAs()` is a real session and the bypass is
 * off.
 */
describe('a real session and the dev bypass', () => {
	afterEach(() => vi.unstubAllEnvs());

	test('a signed-in user is the session, with a user row behind it', async () => {
		const { userId } = await signInAs('coc_reviewer');

		const session = await getSession();
		expect(session?.user).toMatchObject({ id: userId, role: 'coc_reviewer' });
		await expect(actorId(userId)).resolves.toBe(userId);
		await expect(requirePermission('coc', 'manage')).resolves.toMatchObject({
			user: { id: userId },
		});
	});

	/**
	 * The devtools panel's "switch user" sets a real cookie while the bypass
	 * is on; the cookie has to win or the switch does nothing visible.
	 */
	test('the real session wins over the bypass', async () => {
		vi.stubEnv('ADMIN_DEV_BYPASS', 'true');
		const { userId } = await signInAs('waitlist_reviewer');

		expect((await getSession())?.user).toMatchObject({
			id: userId,
			role: 'waitlist_reviewer',
		});
	});

	test('a cookie for a session that no longer exists falls back to the bypass', async () => {
		vi.stubEnv('ADMIN_DEV_BYPASS', 'true');
		requestHeaders.current = new Headers({
			cookie: 'better-auth.session_token=gone.gone',
		});

		expect((await getSession())?.user).toMatchObject({ id: 'dev-bypass' });
	});

	test('and with the bypass off, that cookie is nobody', async () => {
		requestHeaders.current = new Headers({
			cookie: 'better-auth.session_token=gone.gone',
		});

		await expect(getSession()).resolves.toBeNull();
	});
});
