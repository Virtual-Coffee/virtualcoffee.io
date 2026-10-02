import { eq } from 'drizzle-orm';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { z } from 'zod';

import { db, invite, volunteerEvent } from '@/db';
import { volunteerInvite } from '@/emails/volunteerInvite';
import * as monitoring from '@/lib/monitoring/reportHandled';
import {
	failLedgerInserts,
	insertInvite,
	insertVolunteer,
	inviteRow,
	ledgerFor,
	ledgerRow,
	volunteerEvents,
} from '@/test/db/fixtures';
import { sendEmail } from '@/test/mocks/spies';
import { afterRead } from '@/test/mocks/wrappers';
import { CAPTURED, MAYBE_SENT, NOT_SENT, SENT } from '@/test/outbound';

import {
	accrue,
	adjust,
	giveBack,
	claimInvite,
	completeInvite,
	hashClaimToken,
	inviteForClaimToken,
	issueAndSend,
	resendClaimLink,
	volunteerBalance,
} from './invites';

const GRACE = 'U_GRACE';

const ADA = { name: 'Ada Lovelace', email: 'ada@example.test' };

/** The inviter side of `issueAndSend`, as the action assembles it. */
function send(slackUserId = GRACE, invitee = ADA) {
	return issueAndSend({
		inviter: { slackUserId, userId: null, name: 'Grace Hopper' },
		invitee,
		inviterName: 'Grace Hopper',
	});
}

async function volunteerWithBalance(balance: number, slackUserId = GRACE) {
	const { id } = await insertVolunteer({ slackUserId });
	if (balance > 0) {
		await ledgerRow({ slackUserId, delta: balance, reason: 'imported' });
	}
	return id;
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

describe('issueAndSend', () => {
	test('writes the Invite, charges one, and emails the link', async () => {
		const volunteerId = await volunteerWithBalance(2);
		sendEmail.mockResolvedValue(SENT);

		await expect(send()).resolves.toEqual({ kind: 'sent' });

		const [row] = await db().select().from(invite);
		expect(row).toMatchObject({
			inviterSlackUserId: GRACE,
			inviteeEmail: 'ada@example.test',
			status: 'pending',
			tokenHash: expect.schemaMatching(z.hash('sha256')),
			tokenExpiresAt: expect.schemaMatching(
				z.date().min(new Date(Date.now() + 89 * 24 * 60 * 60 * 1000)),
			),
		});
		await expect(volunteerBalance(GRACE)).resolves.toBe(1);
		await expect(ledgerFor(GRACE)).resolves.toEqual([
			expect.objectContaining({ delta: 2, reason: 'imported' }),
			expect.objectContaining({
				delta: -1,
				reason: 'spend',
				inviteId: row.id,
			}),
		]);

		const [template, props, envelope] = sendEmail.mock.calls[0];
		expect(template).toBe(volunteerInvite);
		expect(envelope).toEqual({ to: 'ada@example.test' });
		expect(props).toMatchObject({
			inviterName: 'Grace Hopper',
			inviteeName: 'Ada Lovelace',
		});
		const [, token] =
			props.claimUrl.match(/join\?invite=([A-Za-z0-9_-]{43})/) ?? [];
		expect(hashClaimToken(token)).toBe(row.tokenHash);
		await expect(volunteerEvents(volunteerId)).resolves.toMatchObject([
			{ type: 'email_sent', body: 'Invite to ada@example.test' },
		]);
	});

	test('two Invites carry different tokens', async () => {
		await volunteerWithBalance(2);
		sendEmail.mockResolvedValue(SENT);

		await send(GRACE, ADA);
		await send(GRACE, { name: 'Alan', email: 'alan@example.test' });

		const hashes = (await db().select().from(invite)).map((r) => r.tokenHash);
		expect(new Set(hashes).size).toBe(2);
	});

	test('a captured send is still spent, and says where it went', async () => {
		await volunteerWithBalance(2);
		sendEmail.mockResolvedValue(CAPTURED);

		await expect(send()).resolves.toEqual({
			kind: 'sent',
			warning: CAPTURED.warning,
		});
		await expect(volunteerBalance(GRACE)).resolves.toBe(1);
	});

	test('a volunteer role with no roster row writes nothing', async () => {
		await expect(send()).resolves.toEqual({
			kind: 'refused',
			reason: 'no_volunteer',
		});
		await expect(db().select().from(invite)).resolves.toEqual([]);
		expect(sendEmail).not.toHaveBeenCalled();
	});

	test('an empty allowance writes and sends nothing', async () => {
		await volunteerWithBalance(0);

		await expect(send()).resolves.toEqual({
			kind: 'refused',
			reason: 'no_balance',
		});
		await expect(db().select().from(invite)).resolves.toEqual([]);
		await expect(ledgerFor(GRACE)).resolves.toEqual([]);
		expect(sendEmail).not.toHaveBeenCalled();
	});

	/**
	 * `invite_pending_email_idx` firing, which the action's friendly pre-check
	 * can race past. The whole transaction rolls back, so the second Volunteer
	 * is not charged.
	 */
	test('a live Claim Link at that address is refused and nothing is charged', async () => {
		await volunteerWithBalance(2);
		await insertInvite({
			inviterSlackUserId: 'U_OTHER',
			inviteeEmail: 'ada@example.test',
		});

		await expect(send()).resolves.toEqual({
			kind: 'refused',
			reason: 'already_invited',
		});
		await expect(volunteerBalance(GRACE)).resolves.toBe(2);
		await expect(ledgerFor(GRACE)).resolves.toHaveLength(1);
		expect(sendEmail).not.toHaveBeenCalled();
	});

	test('a definite send failure cancels the Invite and gives the allowance back', async () => {
		const volunteerId = await volunteerWithBalance(1);
		sendEmail.mockResolvedValue(NOT_SENT);

		await expect(send()).resolves.toEqual({
			kind: 'not_sent_given_back',
			message: NOT_SENT.message,
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
		await expect(volunteerEvents(volunteerId)).resolves.toMatchObject([
			{
				type: 'email_failed',
				body: `Invite to ada@example.test failed: ${NOT_SENT.message}`,
			},
		]);
	});

	test('a definite send failure whose refund fails leaves it pending and charged', async () => {
		await volunteerWithBalance(1);
		sendEmail.mockResolvedValue(NOT_SENT);
		const report = vi
			.spyOn(monitoring, 'reportHandled')
			.mockImplementation(() => {});
		vi.spyOn(console, 'error').mockImplementation(() => {});

		const fault = await failLedgerInserts('refund_cancelled');
		try {
			await expect(send()).resolves.toEqual({
				kind: 'not_sent_give_back_failed',
				message: NOT_SENT.message,
			});
		} finally {
			await fault.remove();
		}

		// Rolled back together, so Cancel on the list can still give it back.
		const [row] = await db().select().from(invite);
		expect(row).toMatchObject({ status: 'pending' });
		await expect(volunteerBalance(GRACE)).resolves.toBe(0);
		expect(report).toHaveBeenCalledWith(expect.anything(), {
			area: 'invites',
		});
		await expect(
			giveBack({
				inviteId: row.id,
				reason: 'refund_cancelled',
				body: 'Cancelled',
			}),
		).resolves.toBe('given_back');
		await expect(volunteerBalance(GRACE)).resolves.toBe(1);
	});

	test('a failure we cannot be sure about stays spent', async () => {
		await volunteerWithBalance(1);
		sendEmail.mockResolvedValue(MAYBE_SENT);

		await expect(send()).resolves.toEqual({
			kind: 'maybe_sent',
			message: MAYBE_SENT.message,
		});
		const [row] = await db().select().from(invite);
		expect(row).toMatchObject({ status: 'pending' });
		expect(row.tokenHash).not.toBeNull();
		await expect(volunteerBalance(GRACE)).resolves.toBe(0);
	});

	test('a write that throws is reported and sends nothing', async () => {
		await volunteerWithBalance(1);
		const report = vi
			.spyOn(monitoring, 'reportHandled')
			.mockImplementation(() => {});
		vi.spyOn(console, 'error').mockImplementation(() => {});

		const fault = await failLedgerInserts('spend');
		try {
			await expect(send()).resolves.toEqual({ kind: 'failed' });
		} finally {
			await fault.remove();
		}

		expect(report).toHaveBeenCalledOnce();
		expect(sendEmail).not.toHaveBeenCalled();
		await expect(db().select().from(invite)).resolves.toEqual([]);
	});
});

describe('resendClaimLink', () => {
	const ACTOR = { actorUserId: null };

	test('replaces the token, restarts the expiry, and emails the new link', async () => {
		const { id: volunteerId } = await insertVolunteer({ slackUserId: GRACE });
		const soon = new Date(Date.now() + 60 * 60 * 1000);
		const { id, token: oldToken } = await insertInvite({
			inviterSlackUserId: GRACE,
			inviterName: 'Grace Hopper',
			inviteeEmail: 'ada@example.test',
			expiresAt: soon,
		});
		sendEmail.mockResolvedValue(SENT);

		await expect(resendClaimLink(id, ACTOR)).resolves.toEqual({
			kind: 'sent',
			email: 'ada@example.test',
		});

		const row = await inviteRow(id);
		expect(row.tokenHash).not.toBe(hashClaimToken(oldToken));
		expect(row.tokenExpiresAt!.getTime()).toBeGreaterThan(soon.getTime());

		const [template, props, envelope] = sendEmail.mock.calls[0];
		expect(template).toBe(volunteerInvite);
		expect(envelope).toEqual({ to: 'ada@example.test' });
		expect(props.inviterName).toBe('Grace Hopper');
		const [, token] = props.claimUrl.match(/join\?invite=([\w-]+)/) ?? [];
		expect(hashClaimToken(token)).toBe(row.tokenHash);
		// No ledger movement: it is the same Invite.
		await expect(ledgerFor(GRACE)).resolves.toEqual([]);
		await expect(volunteerEvents(volunteerId)).resolves.toEqual([
			{
				type: 'email_sent',
				body: 'Invite re-sent to ada@example.test',
				actorUserId: null,
			},
		]);
	});

	test.each([
		['a definite failure', NOT_SENT, 'not_sent', 'email_failed'],
		['an uncertain failure', MAYBE_SENT, 'maybe_sent', 'email_failed'],
	] as const)(
		'%s leaves the previous link dead and says which it was',
		async (_name, outbound, kind, eventType) => {
			const { id: volunteerId } = await insertVolunteer({
				slackUserId: GRACE,
			});
			const { id, token: oldToken } = await insertInvite({
				inviterSlackUserId: GRACE,
			});
			sendEmail.mockResolvedValue(outbound);

			await expect(resendClaimLink(id, ACTOR)).resolves.toEqual({
				kind,
				message: outbound.message,
			});

			expect((await inviteRow(id)).tokenHash).not.toBe(
				hashClaimToken(oldToken),
			);
			await expect(volunteerEvents(volunteerId)).resolves.toMatchObject([
				{ type: eventType },
			]);
		},
	);

	test('an Invite imported from Airtable has no link to re-send', async () => {
		await insertVolunteer({ slackUserId: GRACE });
		const [{ id }] = await db()
			.insert(invite)
			.values({
				inviterSlackUserId: GRACE,
				inviterName: 'Grace',
				inviteeName: 'Ada',
				inviteeEmail: 'ada@example.test',
				status: 'pending',
				airtableRecordId: 'recIMPORTED',
			})
			.returning({ id: invite.id });

		await expect(resendClaimLink(id, ACTOR)).resolves.toEqual({
			kind: 'refused',
			reason: 'imported',
		});
		expect((await inviteRow(id)).tokenHash).toBeNull();
		expect(sendEmail).not.toHaveBeenCalled();
	});

	test('only a pending Invite with an email can be re-sent', async () => {
		const { id, token } = await insertInvite({
			inviterSlackUserId: GRACE,
			status: 'accepted',
		});

		await expect(resendClaimLink(id, ACTOR)).resolves.toEqual({
			kind: 'refused',
			reason: 'not_pending',
		});

		const [{ id: noEmail }] = await db()
			.insert(invite)
			.values({
				inviterSlackUserId: GRACE,
				inviterName: 'Grace',
				status: 'pending',
				tokenHash: hashClaimToken('x'),
				tokenExpiresAt: new Date(Date.now() + 1000),
			})
			.returning({ id: invite.id });
		await expect(resendClaimLink(noEmail, ACTOR)).resolves.toEqual({
			kind: 'refused',
			reason: 'no_email',
		});
		expect((await inviteRow(id)).tokenHash).toBe(hashClaimToken(token));
		expect(sendEmail).not.toHaveBeenCalled();
	});

	test('an Invite claimed between the read and the write is not emailed', async () => {
		const { id } = await insertInvite({ inviterSlackUserId: GRACE });
		// The read sees `pending`; the claim lands before the write.
		afterRead.run = async () => {
			await db()
				.update(invite)
				.set({ status: 'accepted', tokenHash: null })
				.where(eq(invite.id, id));
		};

		await expect(resendClaimLink(id, ACTOR)).resolves.toEqual({
			kind: 'stale',
		});
		expect(sendEmail).not.toHaveBeenCalled();
		expect((await inviteRow(id)).status).toBe('accepted');
	});

	test('a resend that lost the race to another resend is not emailed', async () => {
		const { id } = await insertInvite({ inviterSlackUserId: GRACE });
		// Still `pending`, but the other maintainer's token is already in the row.
		const theirs = hashClaimToken('the-other-resend');
		afterRead.run = async () => {
			await db()
				.update(invite)
				.set({ tokenHash: theirs })
				.where(eq(invite.id, id));
		};

		await expect(resendClaimLink(id, ACTOR)).resolves.toEqual({
			kind: 'stale',
		});
		expect(sendEmail).not.toHaveBeenCalled();
		expect((await inviteRow(id)).tokenHash).toBe(theirs);
	});

	test('with no inviter Volunteer the send goes out, nothing is recorded, and it is reported', async () => {
		const report = vi
			.spyOn(monitoring, 'reportHandled')
			.mockImplementation(() => {});
		const { id } = await insertInvite({ inviterSlackUserId: 'U_NOT_HERE' });
		sendEmail.mockResolvedValue(SENT);

		await expect(resendClaimLink(id, ACTOR)).resolves.toMatchObject({
			kind: 'sent',
		});

		expect(sendEmail).toHaveBeenCalledOnce();
		expect(report).toHaveBeenCalledWith(
			expect.objectContaining({
				message: expect.stringContaining('with no inviter Volunteer'),
			}),
			{ area: 'invites' },
		);
		await expect(db().select().from(volunteerEvent)).resolves.toEqual([]);
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

describe('claimInvite', () => {
	test('spends a live link once', async () => {
		const { id, token } = await insertInvite({
			inviterSlackUserId: 'U_GRACE',
			inviterName: 'Grace Hopper',
		});
		const now = new Date();

		await expect(claimInvite(token, now)).resolves.toEqual({
			id,
			inviterName: 'Grace Hopper',
			inviterSlackUserId: 'U_GRACE',
		});
		await expect(inviteRow(id)).resolves.toMatchObject({
			status: 'accepted',
			claimedAt: now,
			tokenHash: null,
		});
		await expect(claimInvite(token, new Date())).resolves.toBeNull();
	});

	test('an expired link is not spent', async () => {
		const { id, token } = await insertInvite({
			inviterSlackUserId: 'U_GRACE',
			expiresAt: new Date(Date.now() - 1000),
		});

		await expect(claimInvite(token, new Date())).resolves.toBeNull();
		await expect(inviteRow(id)).resolves.toMatchObject({ status: 'pending' });
	});
});

describe('completeInvite', () => {
	test('marks the Invite completed', async () => {
		const { id } = await insertInvite({
			inviterSlackUserId: 'U_GRACE',
			status: 'accepted',
		});

		await completeInvite(id);

		await expect(inviteRow(id)).resolves.toMatchObject({ status: 'completed' });
	});
});
