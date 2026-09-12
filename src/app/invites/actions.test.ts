import { afterEach, describe, expect, test, vi } from 'vitest';

import { redirectTo } from '@/test/next';
import { signInAs } from '@/test/session';

import { previewInvite } from './actions';

describe('previewInvite', () => {
	afterEach(() => vi.unstubAllEnvs());

	test('is for volunteers only', async () => {
		signInAs('admin');
		await expect(
			previewInvite('Ada', 'ada@example.test'),
		).rejects.toMatchObject(redirectTo('/invites/sign-in'));
	});

	test('validates before it renders, and says what is wrong', async () => {
		signInAs('volunteer');
		await expect(previewInvite('', 'ada@example.test')).resolves.toEqual({
			ok: false,
			message: 'Please give their name.',
		});
		await expect(previewInvite('Ada', 'nope')).resolves.toEqual({
			ok: false,
			message: 'That doesn’t look like an email address.',
		});
	});

	test('the preview is the real email with the link elided', async () => {
		signInAs('volunteer');
		vi.stubEnv('URL', 'http://localhost:9000');

		await expect(
			previewInvite(' Ada Lovelace ', 'ada@example.test'),
		).resolves.toEqual({
			ok: true,
			to: 'ada@example.test',
			subject: 'Local dev invited you to Virtual Coffee',
			text: expect.stringContaining(
				'\n  http://localhost:9000/join?invite=…\n',
			),
		});
	});
});
