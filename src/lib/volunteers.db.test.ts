import { describe, expect, test } from 'vitest';

import {
	insertApplication,
	insertInvite,
	insertVolunteer,
	ledgerRow,
} from '@/test/db/fixtures';

import { listVolunteers, volunteerInvites } from './volunteers';

describe('listVolunteers', () => {
	/**
	 * Two volunteers × two ledger rows × two invites each. A correlated
	 * subquery with a shadowed column would give everyone the whole ledger;
	 * a direct double join would multiply both aggregates by two.
	 */
	test('each volunteer gets their own balance and count, with no fan-out', async () => {
		await insertVolunteer({ slackUserId: 'U_A', name: 'Ada' });
		await insertVolunteer({ slackUserId: 'U_B', name: 'Bea' });
		await insertVolunteer({ slackUserId: 'U_C', name: 'Cal' });

		await ledgerRow({ slackUserId: 'U_A', delta: 3, reason: 'imported' });
		await ledgerRow({ slackUserId: 'U_A', delta: -1, reason: 'spend' });
		await ledgerRow({ slackUserId: 'U_B', delta: 5, reason: 'imported' });
		await ledgerRow({ slackUserId: 'U_B', delta: 1, reason: 'admin_grant' });

		for (const inviter of ['U_A', 'U_A', 'U_B', 'U_B']) {
			await insertInvite({ inviterSlackUserId: inviter });
		}

		const rows = await listVolunteers();
		expect(
			rows.map(({ slackDisplayName, balance, invitesSent }) => ({
				slackDisplayName,
				balance,
				invitesSent,
			})),
		).toEqual([
			{ slackDisplayName: 'Ada', balance: 2, invitesSent: 2 },
			{ slackDisplayName: 'Bea', balance: 6, invitesSent: 2 },
			{ slackDisplayName: 'Cal', balance: 0, invitesSent: 0 },
		]);
	});
});

describe('volunteerInvites', () => {
	test('lists one row per Invite even when two applications name it', async () => {
		await insertVolunteer({ slackUserId: 'U_A' });
		const { id } = await insertInvite({ inviterSlackUserId: 'U_A' });
		await insertApplication({ inviteId: id });
		const newest = await insertApplication({ inviteId: id });
		await insertInvite({ inviterSlackUserId: 'U_SOMEONE_ELSE' });

		const rows = await volunteerInvites('U_A');
		expect(rows).toHaveLength(1);
		// Deterministic, not whichever row the planner happened to return first.
		expect(rows[0]).toMatchObject({ id, applicationId: newest.id });
	});
});
