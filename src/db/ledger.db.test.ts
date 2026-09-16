import { eq } from 'drizzle-orm';
import { describe, expect, test } from 'vitest';

import { db, invite } from '@/db';
import { insertInvite, ledgerFor, ledgerRow } from '@/test/db/fixtures';

const GRACE = 'U_GRACE';

/** The invariants `SUM(delta)` rests on; the schema comments name each. */
describe('volunteer_invite_ledger', () => {
	test.each([
		['spend', 1],
		['admin_revoke', 1],
		['monthly_accrual', -1],
		['admin_grant', -1],
		['refund_cancelled', -1],
		['refund_expired', -1],
		['imported', -1],
		['imported', 0],
	] as const)('refuses %s with a delta of %i', async (reason, delta) => {
		const { id } = await insertInvite({ inviterSlackUserId: GRACE });
		await expect(
			ledgerRow({
				slackUserId: GRACE,
				delta,
				reason,
				inviteId: id,
				periodKey: '2026-09',
			}),
		).rejects.toMatchObject({
			cause: { constraint: 'volunteer_invite_ledger_sign_by_reason' },
		});
	});

	test('an Invite with a spend against it cannot be deleted', async () => {
		const { id } = await insertInvite({ inviterSlackUserId: GRACE });
		await ledgerRow({
			slackUserId: GRACE,
			delta: -1,
			reason: 'spend',
			inviteId: id,
		});

		await expect(
			db().delete(invite).where(eq(invite.id, id)),
		).rejects.toMatchObject({ cause: { code: '23503' } });
		await expect(ledgerFor(GRACE)).resolves.toMatchObject([
			{ reason: 'spend', inviteId: id },
		]);
	});
});
