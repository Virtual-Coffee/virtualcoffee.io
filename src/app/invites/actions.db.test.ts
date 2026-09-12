import { beforeEach, describe, expect, test, vi } from 'vitest';
import { z } from 'zod';

import { db, invite } from '@/db';
import { volunteerBalance } from '@/lib/invites';
import { redirectTo } from '@/test/next';
import { signInAs } from '@/test/session';
import {
	insertApplication,
	insertInvite,
	insertVolunteer,
	inviteRow,
	ledgerFor,
	ledgerRow,
} from '@/test/db/fixtures';

const sendEmail = vi.hoisted(() => vi.fn());
vi.mock('@/lib/email/transport', () => ({ sendEmail }));

import { cancelInvite, sendInvite } from './actions';

const GRACE = 'U_GRACE';

const SENT = { ok: true };
const NOT_SENT = {
	ok: false,
	definitelyNotSent: true,
	message: 'The mail server rejected ada@example.test.',
};
const MAYBE_SENT = {
	ok: false,
	definitelyNotSent: false,
	message: 'Connection timed out.',
};

async function volunteerWithBalance(balance: number) {
	await insertVolunteer({ slackUserId: GRACE, name: 'Grace Hopper' });
	if (balance > 0) {
		await ledgerRow({ slackUserId: GRACE, delta: balance, reason: 'imported' });
	}
}

beforeEach(() => {
	sendEmail.mockReset();
	sendEmail.mockResolvedValue(SENT);
	signInAs('volunteer', GRACE);
	vi.stubEnv('URL', 'https://virtualcoffee.io');
});

describe('sendInvite', () => {
	test('spends one invite, writes the Invite with only the hash, and emails the link', async () => {
		await volunteerWithBalance(2);

		await expect(
			sendInvite('Ada Lovelace', 'ada@example.test'),
		).resolves.toEqual({
			ok: true,
			message: 'Invite sent to ada@example.test.',
		});

		await expect(volunteerBalance(GRACE)).resolves.toBe(1);
		const [row] = await db().select().from(invite);
		expect(row).toMatchObject({
			inviterSlackUserId: GRACE,
			inviterName: 'Local dev',
			inviteeName: 'Ada Lovelace',
			inviteeEmail: 'ada@example.test',
			status: 'pending',
			tokenHash: expect.schemaMatching(z.hash('sha256')),
			tokenExpiresAt: expect.schemaMatching(z.date().min(new Date())),
		});

		const [{ text, to }] = sendEmail.mock.calls[0];
		expect(to).toBe('ada@example.test');
		const [, token] = text.match(/join\?invite=([A-Za-z0-9_-]{43})/) ?? [];
		expect(token).toBeDefined();
		expect(text).not.toContain(row.tokenHash);

		await expect(ledgerFor(GRACE)).resolves.toEqual([
			expect.objectContaining({ delta: 2, reason: 'imported' }),
			{ delta: -1, reason: 'spend', periodKey: null, inviteId: row.id },
		]);
	});

	test('no balance, no invite, nothing sent', async () => {
		await volunteerWithBalance(0);

		await expect(sendInvite('Ada', 'ada@example.test')).resolves.toEqual({
			ok: false,
			message: 'You have no invites left. You get one more on the 1st.',
			emailSent: false,
		});
		await expect(db().select().from(invite)).resolves.toEqual([]);
		expect(sendEmail).not.toHaveBeenCalled();
	});

	test('a volunteer role without a volunteer row is told to ask a maintainer', async () => {
		await expect(sendInvite('Ada', 'ada@example.test')).resolves.toMatchObject({
			ok: false,
			message: expect.stringContaining('Admin → Volunteers'),
		});
	});

	test('someone already in, or already applying, is not invited again', async () => {
		await volunteerWithBalance(3);
		await insertApplication({ status: 'member', email: 'Member@Example.test' });
		await insertApplication({
			status: 'waitlisted',
			email: 'applying@example.test',
		});

		await expect(sendInvite('M', 'member@example.test')).resolves.toMatchObject(
			{
				message: 'M is already a member of Virtual Coffee — no invite needed.',
			},
		);
		await expect(
			sendInvite('A', 'applying@example.test'),
		).resolves.toMatchObject({
			message: expect.stringContaining(
				'already has an application in progress',
			),
		});
		await expect(volunteerBalance(GRACE)).resolves.toBe(3);
	});

	/**
	 * The import left duplicate rows per email, so the guard reads several:
	 * `member` wins over a live application, and a closed one is no veto at all.
	 */
	test('among several rows for one email, member wins; closed ones do not count', async () => {
		await volunteerWithBalance(3);
		await insertApplication({
			status: 'waitlisted',
			email: 'ada@example.test',
		});
		await insertApplication({ status: 'member', email: 'ADA@example.test' });
		for (const status of ['lapsed', 'declined', 'withdrawn'] as const) {
			await insertApplication({ status, email: 'again@example.test' });
		}

		await expect(sendInvite('Ada', 'ada@example.test')).resolves.toMatchObject({
			message: 'Ada is already a member of Virtual Coffee — no invite needed.',
		});
		await expect(sendInvite('Bob', 'again@example.test')).resolves.toEqual({
			ok: true,
			message: 'Invite sent to again@example.test.',
		});
		await expect(volunteerBalance(GRACE)).resolves.toBe(2);
	});

	/** ADR 0011: a definite failure is cancelled and refunded, in that order. */
	test('a definite send failure cancels the Invite and gives the allowance back', async () => {
		await volunteerWithBalance(1);
		sendEmail.mockResolvedValue(NOT_SENT);

		await expect(sendInvite('Ada', 'ada@example.test')).resolves.toEqual({
			ok: false,
			message: `${NOT_SENT.message} Nothing was emailed and your invite has been given back — safe to try again.`,
			emailSent: false,
		});

		const [row] = await db().select().from(invite);
		expect(row).toMatchObject({
			status: 'cancelled',
			tokenHash: null,
			tokenExpiresAt: null,
		});
		await expect(volunteerBalance(GRACE)).resolves.toBe(1);
		await expect(ledgerFor(GRACE)).resolves.toEqual([
			expect.objectContaining({ reason: 'imported' }),
			expect.objectContaining({ reason: 'spend', inviteId: row.id }),
			expect.objectContaining({
				delta: 1,
				reason: 'refund_cancelled',
				inviteId: row.id,
			}),
		]);
	});

	test('a failure we cannot be sure about stays spent', async () => {
		await volunteerWithBalance(1);
		sendEmail.mockResolvedValue(MAYBE_SENT);

		await expect(sendInvite('Ada', 'ada@example.test')).resolves.toMatchObject({
			ok: false,
			emailSent: 'unknown',
			message: expect.stringContaining('the invite is still spent'),
		});
		await expect(
			inviteRow((await db().select().from(invite))[0].id),
		).resolves.toMatchObject({
			status: 'pending',
		});
		await expect(volunteerBalance(GRACE)).resolves.toBe(0);
	});

	test('validation runs after the volunteer check, before anything is written', async () => {
		await volunteerWithBalance(1);
		await expect(sendInvite('', 'ada@example.test')).resolves.toEqual({
			ok: false,
			message: 'Please give their name.',
			emailSent: false,
		});
		await expect(volunteerBalance(GRACE)).resolves.toBe(1);

		signInAs('admin');
		await expect(sendInvite('Ada', 'ada@example.test')).rejects.toMatchObject(
			redirectTo('/invites/sign-in'),
		);
	});
});

describe('cancelInvite', () => {
	test('refunds once, however many times it is asked', async () => {
		await volunteerWithBalance(1);
		const { id } = await insertInvite({ inviterSlackUserId: GRACE });
		await ledgerRow({
			slackUserId: GRACE,
			delta: -1,
			reason: 'spend',
			inviteId: id,
		});
		await expect(volunteerBalance(GRACE)).resolves.toBe(0);

		await expect(cancelInvite(id)).resolves.toEqual({
			ok: true,
			message: 'Invite cancelled and given back.',
		});
		await expect(cancelInvite(id)).resolves.toMatchObject({
			ok: false,
			message: expect.stringContaining('can’t be cancelled'),
		});

		await expect(volunteerBalance(GRACE)).resolves.toBe(1);
		await expect(inviteRow(id)).resolves.toMatchObject({
			status: 'cancelled',
			tokenHash: null,
		});
		const refunds = (await ledgerFor(GRACE)).filter(
			(r) => r.reason === 'refund_cancelled',
		);
		expect(refunds).toHaveLength(1);
	});

	/**
	 * The partial unique index over both refund reasons is the backstop: even
	 * a second refund written by another path is dropped, not doubled.
	 */
	test('the ledger refuses a second refund of either kind for one Invite', async () => {
		await volunteerWithBalance(1);
		const { id } = await insertInvite({ inviterSlackUserId: GRACE });
		await ledgerRow({
			slackUserId: GRACE,
			delta: -1,
			reason: 'spend',
			inviteId: id,
		});
		await cancelInvite(id);

		await expect(
			ledgerRow({
				slackUserId: GRACE,
				delta: 1,
				reason: 'refund_expired',
				inviteId: id,
			}),
		).rejects.toMatchObject({
			cause: { constraint: 'volunteer_invite_ledger_refund_idx' },
		});
		await expect(
			ledgerRow({
				slackUserId: GRACE,
				delta: -1,
				reason: 'spend',
				inviteId: id,
			}),
		).rejects.toMatchObject({
			cause: { constraint: 'volunteer_invite_ledger_spend_idx' },
		});
	});

	test('only the inviter can cancel, and only while it is pending', async () => {
		await volunteerWithBalance(1);
		const theirs = await insertInvite({ inviterSlackUserId: 'U_SOMEONE_ELSE' });
		const claimed = await insertInvite({
			inviterSlackUserId: GRACE,
			status: 'accepted',
		});

		await expect(cancelInvite(theirs.id)).resolves.toMatchObject({ ok: false });
		await expect(cancelInvite(claimed.id)).resolves.toMatchObject({
			ok: false,
		});
		await expect(cancelInvite('not-an-id')).resolves.toMatchObject({
			ok: false,
			message: 'That invite no longer exists. Reload the page.',
		});

		await expect(inviteRow(theirs.id)).resolves.toMatchObject({
			status: 'pending',
		});
		await expect(inviteRow(claimed.id)).resolves.toMatchObject({
			status: 'accepted',
		});
		await expect(volunteerBalance(GRACE)).resolves.toBe(1);
	});
});
