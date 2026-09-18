import { afterEach, describe, expect, test, vi } from 'vitest';

import { db, invite } from '@/db';
import {
	insertInvite,
	insertVolunteer,
	inviteRow,
	ledgerFor,
	ledgerRow,
} from '@/test/db/fixtures';

import {
	accrue,
	adjust,
	giveBack,
	hashClaimToken,
	inviteForClaimToken,
	issueInvite,
	newClaimToken,
	volunteerBalance,
} from './invites';

const GRACE = 'U_GRACE';

/** The inviter side of `issueInvite`, as `sendInvite` assembles it. */
function inviter(slackUserId = GRACE) {
	return { slackUserId, userId: null, name: 'Grace Hopper' };
}

function freshToken() {
	const { token, expiresAt } = newClaimToken();
	return { hash: hashClaimToken(token), expiresAt };
}

async function volunteerWithBalance(balance: number, slackUserId = GRACE) {
	await insertVolunteer({ slackUserId });
	if (balance > 0) {
		await ledgerRow({ slackUserId, delta: balance, reason: 'imported' });
	}
}

describe('inviteForClaimToken', () => {
	test('a live link resolves to the Invite', async () => {
		const { id, token } = await insertInvite({ inviterSlackUserId: GRACE });
		await expect(inviteForClaimToken(token)).resolves.toMatchObject({ id });
	});

	test.each([
		[
			'an unknown token',
			() => insertInvite({ inviterSlackUserId: GRACE }).then(() => 'nope'),
		],
		[
			'a link past its date',
			() =>
				insertInvite({
					inviterSlackUserId: GRACE,
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
				insertInvite({ inviterSlackUserId: GRACE, expiresAt: null }).then(
					(r) => r.token,
				),
		],
		[
			'a link no longer pending',
			() =>
				insertInvite({
					inviterSlackUserId: GRACE,
					status: 'cancelled',
				}).then((r) => r.token),
		],
	])('%s resolves to null', async (_name, arrange) => {
		const token = await arrange();
		await expect(inviteForClaimToken(token)).resolves.toBeNull();
	});

	afterEach(() => vi.useRealTimers());
});

describe('issueInvite', () => {
	test('writes the Invite and charges one, in one transaction', async () => {
		await volunteerWithBalance(2);

		const issued = await issueInvite({
			inviter: inviter(),
			invitee: { name: 'Ada Lovelace', email: 'ada@example.test' },
			token: freshToken(),
		});

		expect(issued).toEqual({
			ok: true,
			inviteId: expect.any(String),
			volunteerId: expect.any(String),
		});
		await expect(volunteerBalance(GRACE)).resolves.toBe(1);
		await expect(
			inviteRow(issued.ok ? issued.inviteId : ''),
		).resolves.toMatchObject({
			inviterSlackUserId: GRACE,
			inviteeEmail: 'ada@example.test',
			status: 'pending',
		});
		await expect(ledgerFor(GRACE)).resolves.toEqual([
			expect.objectContaining({ delta: 2, reason: 'imported' }),
			expect.objectContaining({
				delta: -1,
				reason: 'spend',
				inviteId: issued.ok ? issued.inviteId : '',
			}),
		]);
	});

	test('a volunteer role with no roster row writes nothing', async () => {
		const issued = await issueInvite({
			inviter: inviter(),
			invitee: { name: 'Ada', email: 'ada@example.test' },
			token: freshToken(),
		});

		expect(issued).toEqual({ ok: false, reason: 'no_volunteer' });
		await expect(db().select().from(invite)).resolves.toEqual([]);
	});

	test('an empty allowance writes nothing', async () => {
		await volunteerWithBalance(0);

		const issued = await issueInvite({
			inviter: inviter(),
			invitee: { name: 'Ada', email: 'ada@example.test' },
			token: freshToken(),
		});

		expect(issued).toEqual({ ok: false, reason: 'no_balance' });
		await expect(db().select().from(invite)).resolves.toEqual([]);
		await expect(ledgerFor(GRACE)).resolves.toEqual([]);
	});

	/**
	 * `invite_pending_email_idx` firing, which is what the caller's friendly
	 * pre-check can race past. The whole transaction rolls back, so the second
	 * Volunteer is not charged.
	 */
	test('a live Claim Link at that address is refused and nothing is charged', async () => {
		await volunteerWithBalance(2);
		await insertInvite({
			inviterSlackUserId: 'U_OTHER',
			inviteeEmail: 'ada@example.test',
		});

		const issued = await issueInvite({
			inviter: inviter(),
			invitee: { name: 'Ada', email: 'ada@example.test' },
			token: freshToken(),
		});

		expect(issued).toEqual({ ok: false, reason: 'already_invited' });
		await expect(volunteerBalance(GRACE)).resolves.toBe(2);
		await expect(ledgerFor(GRACE)).resolves.toHaveLength(1);
	});
});

describe('giveBack', () => {
	test('closes the Invite and credits the spend, once', async () => {
		await volunteerWithBalance(1);
		const { id } = await insertInvite({ inviterSlackUserId: GRACE });
		await ledgerRow({
			slackUserId: GRACE,
			delta: -1,
			reason: 'spend',
			inviteId: id,
		});

		await expect(
			giveBack({ inviteId: id, reason: 'refund_cancelled', body: 'Cancelled' }),
		).resolves.toBe('given_back');
		// The Claim Link goes whatever the reason: a given-back Invite has none.
		await expect(inviteRow(id)).resolves.toMatchObject({
			status: 'cancelled',
			tokenHash: null,
			tokenExpiresAt: null,
		});
		await expect(volunteerBalance(GRACE)).resolves.toBe(1);

		// Second call: no longer `pending`, so nothing moves.
		await expect(
			giveBack({ inviteId: id, reason: 'refund_expired', body: 'Swept' }),
		).resolves.toBe('not_pending');
		await expect(volunteerBalance(GRACE)).resolves.toBe(1);
		await expect(inviteRow(id)).resolves.toMatchObject({
			status: 'cancelled',
		});
	});

	test('refund_expired closes it as expired', async () => {
		await volunteerWithBalance(1);
		const { id } = await insertInvite({ inviterSlackUserId: GRACE });
		await ledgerRow({
			slackUserId: GRACE,
			delta: -1,
			reason: 'spend',
			inviteId: id,
		});

		await expect(
			giveBack({ inviteId: id, reason: 'refund_expired', body: 'Swept' }),
		).resolves.toBe('given_back');
		await expect(inviteRow(id)).resolves.toMatchObject({ status: 'expired' });
	});

	test('an Invite that is not pending is left alone', async () => {
		await volunteerWithBalance(1);
		const { id } = await insertInvite({
			inviterSlackUserId: GRACE,
			status: 'accepted',
		});

		await expect(
			giveBack({ inviteId: id, reason: 'refund_cancelled', body: 'Cancelled' }),
		).resolves.toBe('not_pending');
		await expect(inviteRow(id)).resolves.toMatchObject({ status: 'accepted' });
		await expect(ledgerFor(GRACE)).resolves.toHaveLength(1);
	});

	/**
	 * An Invite imported from Airtable is `pending` forever and was never
	 * charged — the import brings a balance across as one net row (docs/adr/0012).
	 * Closing it is right; crediting it would invent allowance.
	 */
	test('an Invite that was never charged is closed but not credited', async () => {
		await volunteerWithBalance(1);
		const { id } = await insertInvite({
			inviterSlackUserId: GRACE,
			token: null,
		});

		await expect(
			giveBack({ inviteId: id, reason: 'refund_cancelled', body: 'Cancelled' }),
		).resolves.toBe('flipped_without_spend');
		await expect(inviteRow(id)).resolves.toMatchObject({
			status: 'cancelled',
		});
		await expect(volunteerBalance(GRACE)).resolves.toBe(1);
		await expect(ledgerFor(GRACE)).resolves.toEqual([
			expect.objectContaining({ reason: 'imported' }),
		]);
	});

	test('the inviter scope refuses an id off someone else’s list', async () => {
		await volunteerWithBalance(0);
		const { id } = await insertInvite({
			inviterSlackUserId: 'U_SOMEONE_ELSE',
		});

		await expect(
			giveBack({
				inviteId: id,
				reason: 'refund_cancelled',
				body: 'Cancelled',
				inviter: GRACE,
			}),
		).resolves.toBe('not_pending');
		await expect(inviteRow(id)).resolves.toMatchObject({ status: 'pending' });
	});
});

describe('accrue', () => {
	test('one row per active Volunteer per period, however often it runs', async () => {
		await insertVolunteer({ slackUserId: 'U_A' });
		await insertVolunteer({ slackUserId: 'U_B' });
		await insertVolunteer({ slackUserId: 'U_GONE', active: false });
		const jan = new Date('2026-01-15T06:00:00Z');

		await expect(accrue(jan)).resolves.toEqual(
			expect.arrayContaining(['U_A', 'U_B']),
		);
		await expect(accrue(new Date('2026-01-31T23:00:00Z'))).resolves.toEqual([]);
		await expect(volunteerBalance('U_A')).resolves.toBe(1);
		await expect(volunteerBalance('U_GONE')).resolves.toBe(0);

		await expect(
			accrue(new Date('2026-02-01T06:00:00Z')),
		).resolves.toHaveLength(2);
		await expect(volunteerBalance('U_A')).resolves.toBe(2);
	});

	test('no Volunteers, no rows', async () => {
		await expect(accrue(new Date('2026-01-15T06:00:00Z'))).resolves.toEqual([]);
	});
});

describe('adjust', () => {
	test('the sign picks the reason', async () => {
		await volunteerWithBalance(0);

		await expect(
			adjust({ slackUserId: GRACE, delta: 3, body: 'Hackathon cohort' }),
		).resolves.toMatchObject({ reason: 'admin_grant', delta: 3 });
		await expect(
			adjust({ slackUserId: GRACE, delta: -1, body: 'Stepped back' }),
		).resolves.toMatchObject({ reason: 'admin_revoke', delta: -1 });
		await expect(volunteerBalance(GRACE)).resolves.toBe(2);
	});

	test('zero is not a movement', async () => {
		await volunteerWithBalance(0);
		await expect(
			adjust({ slackUserId: GRACE, delta: 0, body: 'Nothing' }),
		).rejects.toThrow(/zero/);
		await expect(ledgerFor(GRACE)).resolves.toEqual([]);
	});
});
