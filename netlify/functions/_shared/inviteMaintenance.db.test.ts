import { eq } from 'drizzle-orm';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { z } from 'zod';

import { db, volunteerAccrualNotice, volunteerInviteLedger } from '@/db';
import { volunteerBalance } from '@/lib/volunteers/invites';
import { sendEmail } from '@/test/mocks/spies';
import { SENT } from '@/test/outbound';
import {
	failLedgerInserts,
	insertInvite,
	insertUser,
	insertVolunteer,
	inviteRow,
	ledgerFor,
	ledgerRow,
} from '@/test/db/fixtures';

import { runInviteMaintenance } from './inviteMaintenance';

const JAN = new Date('2026-01-15T06:00:00Z');
const FEB = new Date('2026-02-01T06:00:00Z');

async function noticesFor(slackUserId: string) {
	const rows = await db()
		.select({ outcome: volunteerAccrualNotice.outcome })
		.from(volunteerAccrualNotice)
		.innerJoin(
			volunteerInviteLedger,
			eq(volunteerInviteLedger.id, volunteerAccrualNotice.ledgerId),
		)
		.where(eq(volunteerInviteLedger.slackUserId, slackUserId));
	return rows.map((row) => row.outcome);
}

beforeEach(() => {
	sendEmail.mockResolvedValue(SENT);
	vi.stubEnv('URL', 'https://virtualcoffee.io');
});

describe('accrual', () => {
	test('one invite per active volunteer per month, however often it runs', async () => {
		await insertVolunteer({ slackUserId: 'U_A', email: 'a@example.test' });
		await insertVolunteer({ slackUserId: 'U_B', email: 'b@example.test' });
		await insertVolunteer({ slackUserId: 'U_GONE', active: false });

		await expect(runInviteMaintenance(JAN)).resolves.toEqual({
			period: '2026-01',
			accrued: 2,
			expired: 0,
			expiryFailures: 0,
			emailed: 2,
			emailFailures: 0,
			emailDeferred: 0,
		});
		await expect(runInviteMaintenance(JAN)).resolves.toMatchObject({
			accrued: 0,
			emailed: 0,
		});
		await expect(
			runInviteMaintenance(new Date('2026-01-31T23:00:00Z')),
		).resolves.toMatchObject({ accrued: 0 });

		await expect(volunteerBalance('U_A')).resolves.toBe(1);
		await expect(volunteerBalance('U_GONE')).resolves.toBe(0);
		await expect(ledgerFor('U_A')).resolves.toEqual([
			{
				delta: 1,
				reason: 'monthly_accrual',
				periodKey: '2026-01',
				inviteId: null,
			},
		]);

		await expect(runInviteMaintenance(FEB)).resolves.toMatchObject({
			period: '2026-02',
			accrued: 2,
		});
		await expect(volunteerBalance('U_A')).resolves.toBe(2);
	});

	/** The index, not the code, is what makes the above true. */
	test('the ledger refuses a second accrual for the same month', async () => {
		await insertVolunteer({ slackUserId: 'U_A' });
		await runInviteMaintenance(JAN);
		await expect(
			ledgerRow({
				slackUserId: 'U_A',
				delta: 1,
				reason: 'monthly_accrual',
				periodKey: '2026-01',
			}),
		).rejects.toMatchObject({
			cause: { constraint: 'volunteer_invite_ledger_accrual_period_idx' },
		});
	});

	test('emails the new balance to the roster address, falling back to the account', async () => {
		const ada = await insertUser({ email: 'ada-account@example.test' });
		await insertVolunteer({
			slackUserId: 'U_ROSTER',
			name: 'Grace Hopper',
			email: 'grace@example.test',
		});
		await insertVolunteer({ slackUserId: 'U_ACCOUNT', userId: ada.id });
		await insertVolunteer({ slackUserId: 'U_NOWHERE' });
		await ledgerRow({ slackUserId: 'U_ROSTER', delta: 2, reason: 'imported' });

		await expect(runInviteMaintenance(JAN)).resolves.toMatchObject({
			accrued: 3,
			emailed: 2,
			emailFailures: 0,
		});

		expect(sendEmail).toHaveBeenCalledTimes(2);
		expect(sendEmail).toHaveBeenCalledWith({
			to: 'grace@example.test',
			subject: 'You have 3 Virtual Coffee invites',
			html: expect.schemaMatching(
				z.string().includes('href="https://virtualcoffee.io/invites"'),
			),
			text: expect.schemaMatching(
				z
					.string()
					.startsWith('Hi Grace,')
					.includes('https://virtualcoffee.io/invites'),
			),
		});
		expect(sendEmail).toHaveBeenCalledWith(
			expect.schemaMatching(
				z.object({
					to: z.literal('ada-account@example.test'),
					subject: z.string().min(1),
					html: z.string().includes('/invites'),
					text: z.string().includes('/invites'),
				}),
			),
		);
	});

	test('an email failure is counted once, and the accrual stands', async () => {
		const error = vi.spyOn(console, 'error').mockImplementation(() => {});
		sendEmail.mockResolvedValue({
			ok: false,
			definitelyNotSent: true,
			message: 'nope',
		});
		await insertVolunteer({ slackUserId: 'U_A', email: 'a@example.test' });
		await insertVolunteer({ slackUserId: 'U_NOWHERE' });

		await expect(runInviteMaintenance(JAN)).resolves.toMatchObject({
			accrued: 2,
			emailed: 0,
			emailFailures: 1,
			emailDeferred: 0,
		});
		await expect(volunteerBalance('U_A')).resolves.toBe(1);

		// The attempt is the notice: tomorrow does not try the same address again.
		sendEmail.mockResolvedValue(SENT);
		await expect(runInviteMaintenance(JAN)).resolves.toMatchObject({
			emailed: 0,
			emailFailures: 0,
		});
		expect(sendEmail).toHaveBeenCalledTimes(1);
		await expect(noticesFor('U_A')).resolves.toEqual(['failed']);
		await expect(noticesFor('U_NOWHERE')).resolves.toEqual(['no_address']);
		error.mockRestore();
	});

	/**
	 * A scheduled function is cut off at 30 seconds, so the run stops starting
	 * batches once its budget is spent; the accruals it did not reach have no
	 * notice, and the next run — which accrues nothing — emails them.
	 */
	test('accruals not reached within the budget are emailed by the next run', async () => {
		vi.useFakeTimers({ shouldAdvanceTime: true });
		for (const letter of ['A', 'B', 'C', 'D', 'E']) {
			await insertVolunteer({
				slackUserId: `U_${letter}`,
				email: `${letter.toLowerCase()}@example.test`,
			});
		}
		sendEmail.mockImplementation(async () => {
			vi.setSystemTime(Date.now() + 16_000);
			return SENT;
		});

		try {
			await expect(runInviteMaintenance(JAN)).resolves.toMatchObject({
				accrued: 5,
				emailed: 4,
				emailFailures: 0,
				emailDeferred: 1,
			});
			expect(sendEmail).toHaveBeenCalledTimes(4);
			await expect(noticesFor('U_E')).resolves.toEqual([]);

			await expect(runInviteMaintenance(JAN)).resolves.toMatchObject({
				accrued: 0,
				emailed: 1,
				emailDeferred: 0,
			});
			expect(sendEmail).toHaveBeenLastCalledWith(
				expect.objectContaining({ to: 'e@example.test' }),
			);
			await expect(noticesFor('U_E')).resolves.toEqual(['sent']);
		} finally {
			vi.useRealTimers();
		}
	});

	test('one send that hangs costs one email, not the rest of the roster', async () => {
		vi.useFakeTimers({ shouldAdvanceTime: true });
		const error = vi.spyOn(console, 'error').mockImplementation(() => {});
		sendEmail.mockImplementation(async ({ to }: { to: string }) => {
			if (to === 'hung@example.test') return new Promise(() => {});
			return SENT;
		});
		await insertVolunteer({ slackUserId: 'U_A', email: 'a@example.test' });
		await insertVolunteer({
			slackUserId: 'U_HUNG',
			email: 'hung@example.test',
		});
		await insertVolunteer({ slackUserId: 'U_B', email: 'b@example.test' });

		try {
			const run = runInviteMaintenance(JAN);
			// The database work runs on real time; the send timeout is a fake one.
			await vi.waitFor(() => expect(sendEmail).toHaveBeenCalledTimes(3));
			await vi.advanceTimersByTimeAsync(11_000);

			await expect(run).resolves.toMatchObject({
				accrued: 3,
				emailed: 2,
				emailFailures: 1,
			});
			expect(error).toHaveBeenCalledWith(
				'Accrual email threw',
				expect.objectContaining({ slackUserId: 'U_HUNG' }),
			);
		} finally {
			error.mockRestore();
			vi.useRealTimers();
		}
	}, 15_000);
});

describe('expiry', () => {
	test('an unclaimed link past its date expires, and the spend is refunded once', async () => {
		await insertVolunteer({ slackUserId: 'U_A' });
		await ledgerRow({ slackUserId: 'U_A', delta: 1, reason: 'imported' });
		const { id } = await insertInvite({
			inviterSlackUserId: 'U_A',
			expiresAt: new Date('2026-01-10T00:00:00Z'),
		});
		await ledgerRow({
			slackUserId: 'U_A',
			delta: -1,
			reason: 'spend',
			inviteId: id,
		});
		await expect(volunteerBalance('U_A')).resolves.toBe(0);

		await expect(runInviteMaintenance(JAN)).resolves.toMatchObject({
			expired: 1,
		});
		await expect(runInviteMaintenance(JAN)).resolves.toMatchObject({
			expired: 0,
		});

		await expect(inviteRow(id)).resolves.toMatchObject({
			status: 'expired',
			tokenHash: null,
		});
		// imported 1, spend -1, accrual +1, refund +1
		await expect(volunteerBalance('U_A')).resolves.toBe(2);
		const refunds = (await ledgerFor('U_A')).filter(
			(r) => r.reason === 'refund_expired',
		);
		expect(refunds).toEqual([
			expect.objectContaining({ delta: 1, inviteId: id }),
		]);
	});

	test('a link that is still live is left alone', async () => {
		await insertVolunteer({ slackUserId: 'U_A' });
		const { id } = await insertInvite({
			inviterSlackUserId: 'U_A',
			expiresAt: new Date('2026-01-16T00:00:00Z'),
		});
		await expect(runInviteMaintenance(JAN)).resolves.toMatchObject({
			expired: 0,
		});
		await expect(inviteRow(id)).resolves.toMatchObject({ status: 'pending' });
	});

	/**
	 * `pending` is the guard, not the date. PGlite cannot stage the race where
	 * an Invite is claimed between the sweep's select and its update, but the
	 * update is conditional on `pending` for that reason, and this pins the
	 * outcome it guards: a claimed Invite past its date is not expired, not
	 * refunded and not counted.
	 */
	test('a claimed invite past its date is neither swept nor refunded', async () => {
		await insertVolunteer({ slackUserId: 'U_A' });
		const { id } = await insertInvite({
			inviterSlackUserId: 'U_A',
			expiresAt: new Date('2026-01-10T00:00:00Z'),
			status: 'accepted',
		});
		await ledgerRow({
			slackUserId: 'U_A',
			delta: -1,
			reason: 'spend',
			inviteId: id,
		});

		await expect(runInviteMaintenance(JAN)).resolves.toMatchObject({
			expired: 0,
		});
		await expect(inviteRow(id)).resolves.toMatchObject({ status: 'accepted' });
		expect(
			(await ledgerFor('U_A')).filter((r) => r.reason === 'refund_expired'),
		).toHaveLength(0);
	});

	/**
	 * Imported Invites are `pending` forever, never had a Claim Link, and were
	 * never charged — expiring them would invent allowance out of nothing.
	 */
	test('imported invites, with no expiry date, are never swept', async () => {
		await insertVolunteer({ slackUserId: 'U_A' });
		const { id } = await insertInvite({
			inviterSlackUserId: 'U_A',
			expiresAt: null,
		});

		await expect(runInviteMaintenance(JAN)).resolves.toMatchObject({
			expired: 0,
		});
		await expect(inviteRow(id)).resolves.toMatchObject({ status: 'pending' });
	});

	test('a refund that fails leaves the invite pending for the next sweep, and the run goes on', async () => {
		await insertVolunteer({ slackUserId: 'U_A', email: 'a@example.test' });
		const { id } = await insertInvite({
			inviterSlackUserId: 'U_A',
			expiresAt: new Date('2026-01-10T00:00:00Z'),
		});
		await ledgerRow({
			slackUserId: 'U_A',
			delta: -1,
			reason: 'spend',
			inviteId: id,
		});

		const fault = await failLedgerInserts('refund_expired');
		try {
			// Counted, not thrown: the accrual has already happened and is not
			// repeated tomorrow, so this run is the only one that can announce it.
			await expect(runInviteMaintenance(JAN)).resolves.toMatchObject({
				accrued: 1,
				expired: 0,
				expiryFailures: 1,
				emailed: 1,
			});
			// Rolled back together: still pending, so the next run picks it up.
			await expect(inviteRow(id)).resolves.toMatchObject({
				status: 'pending',
			});
		} finally {
			await fault.remove();
		}

		await expect(runInviteMaintenance(JAN)).resolves.toMatchObject({
			expired: 1,
			expiryFailures: 0,
		});
		await expect(inviteRow(id)).resolves.toMatchObject({ status: 'expired' });
		const refunds = (await ledgerFor('U_A')).filter(
			(r) => r.reason === 'refund_expired',
		);
		expect(refunds).toHaveLength(1);
	});

	test('an expired invite that was never charged is not refunded', async () => {
		await insertVolunteer({ slackUserId: 'U_A' });
		const { id } = await insertInvite({
			inviterSlackUserId: 'U_A',
			expiresAt: new Date('2026-01-01T00:00:00Z'),
		});

		await expect(runInviteMaintenance(JAN)).resolves.toMatchObject({
			expired: 1,
		});
		await expect(inviteRow(id)).resolves.toMatchObject({ status: 'expired' });
		// Only the month's accrual.
		await expect(ledgerFor('U_A')).resolves.toEqual([
			expect.objectContaining({ reason: 'monthly_accrual' }),
		]);
	});
});
