import { afterEach, describe, expect, test, vi } from 'vitest';

import { NOT_FOUND } from '@/test/next';
import { signInAs } from '@/test/session';
import { addVolunteer, adjustBalance, setRoleLabels } from './actions';

const VOLUNTEER_ID = '0199404c-2c5e-7000-8000-000000000000';

describe('adjustBalance', () => {
	afterEach(() => vi.unstubAllEnvs());

	test('needs volunteers:manage', async () => {
		signInAs('waitlist_reviewer');
		await expect(
			adjustBalance(VOLUNTEER_ID, 1, 'because'),
		).rejects.toMatchObject(NOT_FOUND);
	});

	test.each([
		['a malformed id', '42', 1, 'ok', 'That volunteer no longer exists.'],
		[
			'a fraction',
			VOLUNTEER_ID,
			0.5,
			'ok',
			'Give a whole number of invites, not zero.',
		],
		[
			'zero',
			VOLUNTEER_ID,
			0,
			'ok',
			'Give a whole number of invites, not zero.',
		],
		[
			'too many',
			VOLUNTEER_ID,
			51,
			'ok',
			'That is more invites than anyone needs.',
		],
		[
			'too many back',
			VOLUNTEER_ID,
			-51,
			'ok',
			'That is more invites than anyone needs.',
		],
		[
			'no reason',
			VOLUNTEER_ID,
			1,
			'  ',
			'Say why — the ledger is the audit trail.',
		],
	])(
		'refuses %s before touching the ledger',
		async (_label, id, delta, reason, message) => {
			signInAs('admin');
			await expect(adjustBalance(id, delta, reason)).resolves.toEqual({
				ok: false,
				message,
			});
		},
	);
});

describe('addVolunteer', () => {
	afterEach(() => vi.unstubAllEnvs());

	test('a malformed email is refused before anything is looked up', async () => {
		signInAs('admin');
		await expect(addVolunteer('U_ADA', [], 'not-an-email')).resolves.toEqual({
			ok: false,
			message: 'That doesn’t look like an email address.',
		});
	});

	test('a role that is not on the list is refused', async () => {
		signInAs('admin');
		await expect(
			addVolunteer('U_ADA', ['VC Host', 'Grand Poobah'], ''),
		).resolves.toEqual({
			ok: false,
			message: 'That isn’t one of the community roles.',
		});
	});
});

describe('setRoleLabels', () => {
	afterEach(() => vi.unstubAllEnvs());

	test('needs volunteers:manage', async () => {
		signInAs('waitlist_reviewer');
		await expect(
			setRoleLabels(VOLUNTEER_ID, ['VC Host']),
		).rejects.toMatchObject(NOT_FOUND);
	});

	test('a role that is not on the list is refused', async () => {
		signInAs('admin');
		await expect(
			setRoleLabels(VOLUNTEER_ID, ['Grand Poobah']),
		).resolves.toEqual({
			ok: false,
			message: 'That isn’t one of the community roles.',
		});
	});
});
