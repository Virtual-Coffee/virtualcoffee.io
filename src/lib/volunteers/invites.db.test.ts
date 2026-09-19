import { afterEach, describe, expect, test, vi } from 'vitest';

import { insertInvite } from '@/test/db/fixtures';

import { inviteForClaimToken } from './invites';

describe('inviteForClaimToken', () => {
	test('a live link resolves to the Invite', async () => {
		const { id, token } = await insertInvite({ inviterSlackUserId: 'U_GRACE' });
		await expect(inviteForClaimToken(token)).resolves.toMatchObject({ id });
	});

	test.each([
		[
			'an unknown token',
			() => insertInvite({ inviterSlackUserId: 'U_GRACE' }).then(() => 'nope'),
		],
		[
			'a link past its date',
			() =>
				insertInvite({
					inviterSlackUserId: 'U_GRACE',
					expiresAt: new Date(Date.now() - 1000),
				}).then((r) => r.token),
		],
		// The boundary is the redemption's: `> now` fails at the instant itself.
		[
			'a link expiring this instant',
			async () => {
				const now = new Date();
				vi.useFakeTimers({ toFake: ['Date'], now });
				return insertInvite({
					inviterSlackUserId: 'U_GRACE',
					expiresAt: now,
				}).then((r) => r.token);
			},
		],
		// Redemption requires `token_expires_at > now`, which NULL never satisfies;
		// the page must not offer what the action will refuse.
		[
			'a hash with no expiry',
			() =>
				insertInvite({ inviterSlackUserId: 'U_GRACE', expiresAt: null }).then(
					(r) => r.token,
				),
		],
		[
			'a link no longer pending',
			() =>
				insertInvite({
					inviterSlackUserId: 'U_GRACE',
					status: 'cancelled',
				}).then((r) => r.token),
		],
	])('%s resolves to null', async (_name, arrange) => {
		const token = await arrange();
		await expect(inviteForClaimToken(token)).resolves.toBeNull();
	});

	afterEach(() => vi.useRealTimers());
});
