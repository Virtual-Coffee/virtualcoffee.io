import { eq } from 'drizzle-orm';
import { describe, expect, test } from 'vitest';

import { db, invite } from '@/db';
import { insertInvite, ledgerFor, ledgerRow } from '@/test/db/fixtures';

const GRACE = 'U_GRACE';

/** The invariants `SUM(delta)` rests on; the schema comments name each. */
describe('volunteer_invite_ledger', () => {
	/** The one key each reason takes; `reason_keys` refuses anything else. */
	async function keyFor(reason: string) {
		if (reason === 'monthly_accrual') return { periodKey: '2026-09' };
		if (['spend', 'refund_cancelled', 'refund_expired'].includes(reason)) {
			const { id } = await insertInvite({ inviterSlackUserId: GRACE });
			return { inviteId: id };
		}
		return {};
	}

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
		await expect(
			ledgerRow({
				slackUserId: GRACE,
				delta,
				reason,
				...(await keyFor(reason)),
			}),
		).rejects.toMatchObject({
			cause: { constraint: 'volunteer_invite_ledger_sign_by_reason' },
		});
	});

	test.each([
		['monthly_accrual', 1, 'inviteId'],
		['admin_grant', 1, 'inviteId'],
		['admin_grant', 1, 'periodKey'],
		['imported', 1, 'periodKey'],
		['spend', -1, 'periodKey'],
		['refund_expired', 1, 'periodKey'],
	] as const)(
		'refuses %s carrying a %s it has no use for',
		async (reason, delta, extra) => {
			const { id } = await insertInvite({ inviterSlackUserId: GRACE });
			await expect(
				ledgerRow({
					slackUserId: GRACE,
					delta,
					reason,
					...(await keyFor(reason)),
					...(extra === 'inviteId'
						? { inviteId: id }
						: { periodKey: '2026-09' }),
				}),
			).rejects.toMatchObject({
				cause: { constraint: 'volunteer_invite_ledger_reason_keys' },
			});
		},
	);

	test.each(['monthly_accrual', 'spend', 'refund_expired'] as const)(
		'refuses %s missing its key',
		async (reason) => {
			const delta = reason === 'spend' ? -1 : 1;
			await expect(
				ledgerRow({ slackUserId: GRACE, delta, reason }),
			).rejects.toMatchObject({
				cause: { constraint: 'volunteer_invite_ledger_reason_keys' },
			});
		},
	);

	test.each(['2026-9', '2026-13', '26-09', '2026-09-01'])(
		'refuses monthly_accrual with period_key %s',
		async (periodKey) => {
			await expect(
				ledgerRow({
					slackUserId: GRACE,
					delta: 1,
					reason: 'monthly_accrual',
					periodKey,
				}),
			).rejects.toMatchObject({
				cause: { constraint: 'volunteer_invite_ledger_period_key_format' },
			});
		},
	);

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
