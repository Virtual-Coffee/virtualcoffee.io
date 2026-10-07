import { describe, expect, test } from 'vitest';

import { getAuth } from './auth';
import { requireVolunteer } from './volunteerAccess';
import { insertUser } from '@/test/db/fixtures';
import { redirectTo } from '@/test/next';
import { requestHeaders } from '@/test/requestHeaders';
import { signInAs } from '@/test/session';

describe('requireVolunteer', () => {
	test('lets a volunteer in with their Slack id', async () => {
		await signInAs('volunteer', 'U0AB12CD3');
		await expect(requireVolunteer()).resolves.toMatchObject({
			slackUserId: 'U0AB12CD3',
		});
	});

	test('redirects rather than 404s — an admin is not a volunteer', async () => {
		await signInAs('admin');
		await expect(requireVolunteer()).rejects.toMatchObject(
			redirectTo('/invites/sign-in'),
		);
	});

	test('a volunteer whose account has no Slack id is told so, not offered sign-in', async () => {
		const { id: userId } = await insertUser({ role: 'volunteer' });
		const { test } = await getAuth().$context;
		requestHeaders.current = await test.getAuthHeaders({ userId });

		await expect(requireVolunteer()).rejects.toMatchObject(
			redirectTo('/invites/sign-in?problem=no-slack-id'),
		);
	});
});
