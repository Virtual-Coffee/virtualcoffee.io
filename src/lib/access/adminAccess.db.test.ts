import { describe, expect, test } from 'vitest';

import { actorId, getSession, requirePermission } from './adminAccess';
import { requestHeaders } from '@/test/requestHeaders';
import { signInAs } from '@/test/session';

describe('a real session', () => {
	test('a signed-in user is the session, with a user row behind it', async () => {
		const { userId } = await signInAs('coc_reviewer');

		const session = await getSession();
		expect(session?.user).toMatchObject({ id: userId, role: 'coc_reviewer' });
		await expect(actorId(userId)).resolves.toBe(userId);
		await expect(requirePermission('coc', 'manage')).resolves.toMatchObject({
			user: { id: userId },
		});
	});

	test('a cookie for a session that no longer exists is nobody', async () => {
		requestHeaders.current = new Headers({
			cookie: 'better-auth.session_token=gone.gone',
		});

		await expect(getSession()).resolves.toBeNull();
	});
});
