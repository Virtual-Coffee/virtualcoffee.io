import { beforeEach, describe, expect, test, vi } from 'vitest';

import { and, eq } from 'drizzle-orm';

import { applicationEvent, db, inviteToken, membershipApplication } from '@/db';
import { coffeeInvite } from '@/emails/coffeeInvite';
import { slackInvite } from '@/emails/slackInvite';
import { welcome } from '@/emails/welcome';
import { MAX_NOTE_LENGTH } from '@/lib/admin/notes';
import * as invites from '@/lib/volunteers/invites';
import * as monitoring from '@/lib/monitoring/reportHandled';
import { staleRead } from '@/test/mocks/wrappers';
import { sendEmail } from '@/test/mocks/spies';
import { MAYBE_SENT, NOT_SENT, SENT } from '@/test/outbound';
import {
	applicationEvents,
	applicationRow,
	failInserts,
	failWrites,
	insertApplication,
	insertInvite,
	insertUser,
	inviteRow,
} from '@/test/db/fixtures';

import { createSlackInviteToken, slackInviteForToken } from './inviteTokens';
import {
	approve,
	close,
	coffeeInviteApplicant,
	recordAttendance,
	release,
	resendSlackInvite,
	submit,
	type Actor,
} from './lifecycle';

let admin: Actor;

beforeEach(async () => {
	const { id } = await insertUser();
	admin = { userId: id, email: 'admin@example.test' };
});

const withdraw = (id: string, note: string | null = null) =>
	close(id, admin, { status: 'withdrawn', note });
const decline = (id: string, note: string | null = null) =>
	close(id, admin, { status: 'declined', note });
const sendCoffeeInvite = (id: string, copyMe: boolean) =>
	coffeeInviteApplicant(id, admin, { copyMe });
const approveMembership = (id: string, copyMe: boolean) =>
	approve(id, admin, { copyMe });
const resend = (id: string, copyMe = false) =>
	resendSlackInvite(id, admin, { copyMe });

/** The single-use code carried by a Slack invite email. */
function codeIn(inviteUrl: string): string {
	return new URL(inviteUrl).searchParams.get('code')!;
}

describe('sendCoffeeInvite', () => {
	/**
	 * Send first, then write. Reversed, a failed send leaves an applicant
	 * marked as invited with no email, and nobody can tell.
	 */
	test('a definite failure changes nothing and says a retry is safe', async () => {
		sendEmail.mockResolvedValue(NOT_SENT);
		const { id } = await insertApplication({ status: 'waitlisted' });

		await expect(sendCoffeeInvite(id, false)).resolves.toEqual({
			kind: 'email-failed',
			outbound: NOT_SENT,
		});
		await expect(applicationRow(id)).resolves.toMatchObject({
			status: 'waitlisted',
			coffeeInvitedAt: null,
		});
		await expect(applicationEvents(id)).resolves.toEqual([
			expect.objectContaining({ type: 'email_failed' }),
		]);
	});

	test('a timeout changes nothing either, and is not reported as definitely unsent', async () => {
		sendEmail.mockResolvedValue(MAYBE_SENT);
		const { id } = await insertApplication({ status: 'waitlisted' });

		await expect(sendCoffeeInvite(id, false)).resolves.toEqual({
			kind: 'email-failed',
			outbound: MAYBE_SENT,
		});
		await expect(applicationRow(id)).resolves.toMatchObject({
			status: 'waitlisted',
		});
	});

	test('a delivered invite moves the application on and is logged', async () => {
		sendEmail.mockResolvedValue(SENT);
		const { id } = await insertApplication({
			status: 'waitlisted',
			name: 'Ada Lovelace',
			email: 'ada@example.test',
		});

		await expect(sendCoffeeInvite(id, true)).resolves.toEqual({ kind: 'done' });

		expect(sendEmail).toHaveBeenCalledWith(
			coffeeInvite,
			{},
			{ to: 'ada@example.test', cc: 'admin@example.test' },
		);
		const row = await applicationRow(id);
		expect(row.status).toBe('coffee_invited');
		expect(row.coffeeInvitedAt).toBeInstanceOf(Date);
		await expect(applicationEvents(id)).resolves.toEqual([
			{
				type: 'coffee_invited',
				body: 'Coffee invite emailed to ada@example.test',
				actorUserId: admin.userId,
			},
		]);
	});

	test('only from waitlisted, and only for an application that exists', async () => {
		sendEmail.mockResolvedValue(SENT);
		const { id } = await insertApplication({ status: 'coffee_invited' });

		await expect(sendCoffeeInvite(id, false)).resolves.toEqual({
			kind: 'wrong-status',
			status: 'coffee_invited',
		});
		await expect(sendCoffeeInvite('not-an-id', false)).resolves.toEqual({
			kind: 'not-found',
		});
		expect(sendEmail).not.toHaveBeenCalled();
	});
});

describe('approveMembership', () => {
	test('the Slack invite token exists before the email that carries it', async () => {
		vi.stubEnv('URL', 'https://virtualcoffee.io');
		const tokensWhenSending: number[] = [];
		sendEmail.mockImplementation(async () => {
			const rows = await db().select().from(inviteToken);
			tokensWhenSending.push(rows.length);
			return SENT;
		});
		const { id } = await insertApplication({
			status: 'coffee_invited',
			email: 'ada@example.test',
		});

		await expect(approveMembership(id, false)).resolves.toEqual({
			kind: 'done',
		});

		expect(tokensWhenSending).toEqual([1]);
		expect(sendEmail).toHaveBeenCalledWith(
			welcome,
			{
				name: expect.any(String),
				inviteUrl: expect.stringContaining(
					'https://virtualcoffee.io/join-slack?code=',
				),
			},
			{ to: 'ada@example.test', cc: null },
		);
		const row = await applicationRow(id);
		expect(row.status).toBe('member');
		expect(row.approvedAt).toBeInstanceOf(Date);
		expect(row.coffeeAttendedAt).toBeInstanceOf(Date);
	});

	test('a failed welcome email writes nothing', async () => {
		sendEmail.mockResolvedValue(NOT_SENT);
		const { id } = await insertApplication({ status: 'coffee_invited' });

		await expect(approveMembership(id, false)).resolves.toMatchObject({
			kind: 'email-failed',
		});
		await expect(applicationRow(id)).resolves.toMatchObject({
			status: 'coffee_invited',
			approvedAt: null,
		});
		expect(sendEmail).toHaveBeenCalledOnce();
	});

	test('a welcome email that timed out may have arrived: its link is dead, and the next approval mints a fresh one', async () => {
		vi.stubEnv('URL', 'https://virtualcoffee.io');
		sendEmail.mockResolvedValueOnce(MAYBE_SENT);
		const { id } = await insertApplication({ status: 'coffee_invited' });

		await expect(approveMembership(id, false)).resolves.toEqual({
			kind: 'email-failed',
			outbound: MAYBE_SENT,
		});
		expect((await applicationRow(id)).status).toBe('coffee_invited');

		// /join-slack checks only the token, so a live one here would admit a
		// non-member.
		const [first] = sendEmail.mock.calls;
		await expect(
			slackInviteForToken(codeIn(first[1].inviteUrl)),
		).resolves.toEqual({ ok: false, reason: 'expired' });

		sendEmail.mockResolvedValue(SENT);
		await expect(approveMembership(id, false)).resolves.toEqual({
			kind: 'done',
		});
		const [, retry] = sendEmail.mock.calls;
		await expect(
			slackInviteForToken(codeIn(retry[1].inviteUrl)),
		).resolves.toEqual({ ok: true, applicationId: id });
	});

	test('a transition that throws after the email went leaves the link dead', async () => {
		vi.stubEnv('URL', 'https://virtualcoffee.io');
		sendEmail.mockResolvedValue(SENT);
		const { id } = await insertApplication({ status: 'coffee_invited' });
		const fault = await failInserts('application_event');
		try {
			await expect(approveMembership(id, false)).rejects.toThrow(
				'insert into "application_event"',
			);
		} finally {
			await fault.remove();
		}

		expect((await applicationRow(id)).status).toBe('coffee_invited');
		expect(sendEmail).toHaveBeenCalledOnce();
		const [welcome] = sendEmail.mock.calls;
		await expect(
			slackInviteForToken(codeIn(welcome[1].inviteUrl)),
		).resolves.toEqual({ ok: false, reason: 'expired' });
	});

	test('completes the Invite that produced the application', async () => {
		sendEmail.mockResolvedValue(SENT);
		const grace = await insertUser({
			role: 'volunteer',
			slackUserId: 'U_GRACE',
		});
		const { id: inviteId } = await insertInvite({
			inviterSlackUserId: 'U_GRACE',
			inviterUserId: grace.id,
			status: 'accepted',
		});
		const { id } = await insertApplication({
			status: 'coffee_invited',
			inviteId,
		});

		await approveMembership(id, false);

		await expect(inviteRow(inviteId)).resolves.toMatchObject({
			status: 'completed',
		});
	});

	test('an Invite that cannot be completed is reported and left in History; the approval stands', async () => {
		sendEmail.mockResolvedValue(SENT);
		const { id: inviteId } = await insertInvite({
			inviterSlackUserId: 'U_GRACE',
			status: 'accepted',
		});
		const { id } = await insertApplication({
			status: 'coffee_invited',
			inviteId,
		});
		const complete = vi
			.spyOn(invites, 'completeInvite')
			.mockRejectedValueOnce(new Error('connection reset'));
		const report = vi
			.spyOn(monitoring, 'reportHandled')
			.mockImplementation(() => {});
		const error = vi.spyOn(console, 'error').mockImplementation(() => {});

		await expect(approveMembership(id, false)).resolves.toEqual({
			kind: 'done',
		});

		expect(report).toHaveBeenCalledWith(expect.any(Error), {
			area: 'waitlist',
		});
		expect((await applicationRow(id)).status).toBe('member');
		await expect(applicationEvents(id)).resolves.toEqual([
			expect.objectContaining({ type: 'approved' }),
			expect.objectContaining({ type: 'invite_completion_failed' }),
		]);
		complete.mockRestore();
		report.mockRestore();
		error.mockRestore();
	});

	test('only from coffee_invited', async () => {
		const { id } = await insertApplication({ status: 'waitlisted' });
		await expect(approveMembership(id, false)).resolves.toEqual({
			kind: 'wrong-status',
			status: 'waitlisted',
		});
		expect(sendEmail).not.toHaveBeenCalled();
	});
});

describe('recordAttendance', () => {
	test('attendance is only recorded after a Coffee invite', async () => {
		const invited = await insertApplication({ status: 'coffee_invited' });
		await expect(recordAttendance(invited.id, admin)).resolves.toEqual({
			kind: 'done',
		});
		await expect(applicationRow(invited.id)).resolves.toMatchObject({
			coffeeAttendedAt: expect.any(Date),
		});

		const declined = await insertApplication({ status: 'declined' });
		await expect(recordAttendance(declined.id, admin)).resolves.toEqual({
			kind: 'wrong-status',
			status: 'declined',
		});
		await expect(applicationRow(declined.id)).resolves.toMatchObject({
			coffeeAttendedAt: null,
		});
	});

	// The update itself requires the date to be unset (no read-then-write), so
	// the second call here is the guard refusing, not a pre-check.
	test('attendance is recorded once; a second click changes nothing', async () => {
		const { id } = await insertApplication({ status: 'coffee_invited' });
		await expect(recordAttendance(id, admin)).resolves.toEqual({
			kind: 'done',
		});
		const { coffeeAttendedAt } = await applicationRow(id);

		await expect(recordAttendance(id, admin)).resolves.toEqual({
			kind: 'already-recorded',
		});
		expect((await applicationRow(id)).coffeeAttendedAt).toEqual(
			coffeeAttendedAt,
		);
		await expect(applicationEvents(id)).resolves.toEqual([
			expect.objectContaining({ type: 'attendance_recorded' }),
		]);
	});
});

describe('close', () => {
	test('close the application with a timestamp and the note', async () => {
		const { id } = await insertApplication({ status: 'waitlisted' });

		await expect(decline(id, 'Not a developer.')).resolves.toEqual({
			kind: 'done',
		});
		const row = await applicationRow(id);
		expect(row.status).toBe('declined');
		expect(row.closedAt).toBeInstanceOf(Date);
		await expect(applicationEvents(id)).resolves.toEqual([
			expect.objectContaining({ type: 'declined', body: 'Not a developer.' }),
		]);
	});

	test('a status change whose event fails to write is rolled back with it', async () => {
		const { id } = await insertApplication({ status: 'waitlisted' });
		const fault = await failInserts('application_event');
		try {
			await expect(decline(id)).rejects.toThrow();
		} finally {
			await fault.remove();
		}
		expect((await applicationRow(id)).status).toBe('waitlisted');
		await expect(applicationEvents(id)).resolves.toEqual([]);
	});

	test('a blank note is recorded as none; an over-long one is refused first', async () => {
		const blank = await insertApplication({ status: 'waitlisted' });
		await expect(withdraw(blank.id, '   ')).resolves.toEqual({
			kind: 'done',
		});
		await expect(applicationEvents(blank.id)).resolves.toEqual([
			expect.objectContaining({ type: 'withdrawn', body: null }),
		]);

		const { id } = await insertApplication({ status: 'waitlisted' });
		await expect(decline(id, 'x'.repeat(MAX_NOTE_LENGTH + 1))).resolves.toEqual(
			{
				kind: 'invalid-note',
				message: expect.stringContaining('at most'),
			},
		);
		expect((await applicationRow(id)).status).toBe('waitlisted');
		await expect(applicationEvents(id)).resolves.toEqual([]);
	});

	test('a quarantined application can be declined', async () => {
		const { id } = await insertApplication({
			status: 'suspected_spam',
			waitlistedAt: null,
		});
		await expect(decline(id)).resolves.toEqual({ kind: 'done' });
		expect((await applicationRow(id)).status).toBe('declined');
	});

	test('a member cannot be declined or withdrawn, and closing twice is refused', async () => {
		const member = await insertApplication({ status: 'member' });
		await expect(decline(member.id)).resolves.toEqual({
			kind: 'wrong-status',
			status: 'member',
		});

		const lapsed = await insertApplication({ status: 'lapsed' });
		await expect(withdraw(lapsed.id)).resolves.toEqual({
			kind: 'wrong-status',
			status: 'lapsed',
		});

		const { id } = await insertApplication({ status: 'coffee_invited' });
		await withdraw(id);
		await expect(withdraw(id)).resolves.toEqual({
			kind: 'wrong-status',
			status: 'withdrawn',
		});
		await expect(applicationEvents(id)).resolves.toHaveLength(1);
		expect(sendEmail).not.toHaveBeenCalled();
	});
});

describe('release', () => {
	test('moves a quarantined application to the Waitlist, keeping its place', async () => {
		const submittedAt = new Date(Date.now() - 86_400_000);
		const { id } = await insertApplication({
			status: 'suspected_spam',
			submittedAt,
			waitlistedAt: null,
		});

		await expect(release(id, admin)).resolves.toEqual({ kind: 'done' });

		await expect(applicationRow(id)).resolves.toMatchObject({
			status: 'waitlisted',
			waitlistedAt: submittedAt,
		});
		await expect(applicationEvents(id)).resolves.toEqual([
			{
				type: 'waitlisted',
				body: 'Not spam — moved to the Waitlist',
				actorUserId: admin.userId,
			},
		]);
		const [event] = await db()
			.select({ fromStatus: applicationEvent.fromStatus })
			.from(applicationEvent)
			.where(eq(applicationEvent.applicationId, id));
		expect(event.fromStatus).toBe('suspected_spam');
		expect(sendEmail).not.toHaveBeenCalled();
	});

	test('is refused from any other status', async () => {
		const { id } = await insertApplication({ status: 'waitlisted' });
		await expect(release(id, admin)).resolves.toEqual({
			kind: 'wrong-status',
			status: 'waitlisted',
		});
		await expect(applicationEvents(id)).resolves.toEqual([]);
	});
});

/**
 * Two maintainers on the same row within seconds. Every transition is a
 * conditional update on the status that was read, so exactly one of them
 * writes; the other is told to reload rather than overwriting a decision or
 * recording a second event from a stale status.
 */
describe('a status that changed between the read and the write', () => {
	test('closing twice at once records one close', async () => {
		const { id } = await insertApplication({ status: 'waitlisted' });
		const results = await Promise.all([withdraw(id), decline(id)]);
		expect(results.filter((r) => r.kind === 'done')).toHaveLength(1);
		await expect(applicationEvents(id)).resolves.toHaveLength(1);
	});

	test('a Coffee invite that raced a decline says the email went anyway', async () => {
		sendEmail.mockResolvedValue(SENT);
		const { id } = await insertApplication({ status: 'declined' });
		staleRead.readAs = 'waitlisted';

		await expect(sendCoffeeInvite(id, false)).resolves.toEqual({
			kind: 'stranded',
			name: expect.any(String),
		});
		expect((await applicationRow(id)).status).toBe('declined');
		await expect(applicationEvents(id)).resolves.toEqual([
			expect.objectContaining({
				type: 'email_sent',
				body: expect.stringContaining('had already left Waitlisted'),
			}),
		]);
	});

	test('an approval that raced a withdrawal does not make a member, and the emailed Slack link is dead', async () => {
		vi.stubEnv('URL', 'https://virtualcoffee.io');
		sendEmail.mockResolvedValue(SENT);
		const { id } = await insertApplication({ status: 'withdrawn' });
		staleRead.readAs = 'coffee_invited';

		await expect(approveMembership(id, false)).resolves.toMatchObject({
			kind: 'stranded',
		});
		expect((await applicationRow(id)).status).toBe('withdrawn');
		expect(sendEmail).toHaveBeenCalledOnce();

		const [call] = sendEmail.mock.calls;
		await expect(
			slackInviteForToken(codeIn(call[1].inviteUrl)),
		).resolves.toEqual({ ok: false, reason: 'expired' });
	});

	test("a second approval that lost the race does not kill the first one's link", async () => {
		vi.stubEnv('URL', 'https://virtualcoffee.io');
		sendEmail.mockResolvedValue(SENT);
		const { id } = await insertApplication({ status: 'coffee_invited' });

		await expect(approveMembership(id, false)).resolves.toEqual({
			kind: 'done',
		});
		// The other maintainer read Coffee invited before the first approval
		// committed.
		staleRead.readAs = 'coffee_invited';
		await expect(approveMembership(id, false)).resolves.toMatchObject({
			kind: 'stranded',
		});

		const [winner, loser] = sendEmail.mock.calls;
		await expect(
			slackInviteForToken(codeIn(winner[1].inviteUrl)),
		).resolves.toEqual({ ok: true, applicationId: id });
		await expect(
			slackInviteForToken(codeIn(loser[1].inviteUrl)),
		).resolves.toEqual({ ok: false, reason: 'expired' });
	});

	test('attendance cannot be recorded on a row that already moved', async () => {
		const { id } = await insertApplication({ status: 'member' });
		staleRead.readAs = 'coffee_invited';
		await expect(recordAttendance(id, admin)).resolves.toMatchObject({
			kind: 'changed',
		});
		expect((await applicationRow(id)).coffeeAttendedAt).toBeNull();
	});
});

describe('a rejected cc', () => {
	test('is reported as a warning on success, never as a failed send', async () => {
		sendEmail.mockResolvedValue({
			ok: true,
			message: 'Sent.',
			warning: 'Sent, but the copy to dev@localhost was rejected.',
		});
		const { id } = await insertApplication({ status: 'waitlisted' });
		await expect(sendCoffeeInvite(id, true)).resolves.toEqual({
			kind: 'done',
			warning: 'Sent, but the copy to dev@localhost was rejected.',
		});
		expect((await applicationRow(id)).status).toBe('coffee_invited');
	});
});

describe('resendSlackInvite', () => {
	test('mints a second token for a member, retiring the first, and records the send', async () => {
		vi.stubEnv('URL', 'https://virtualcoffee.io');
		sendEmail.mockResolvedValue(SENT);
		const { id } = await insertApplication({ status: 'member' });
		const { token: first } = await createSlackInviteToken(id);

		await expect(resend(id)).resolves.toEqual({ kind: 'done' });

		const tokens = await db().select().from(inviteToken);
		expect(tokens).toHaveLength(2);
		await expect(slackInviteForToken(first)).resolves.toEqual({
			ok: false,
			reason: 'expired',
		});
		const [template, props] = sendEmail.mock.calls[0];
		expect(template).toBe(slackInvite);
		expect(props.inviteUrl).toContain('/join-slack?code=');
		expect((await applicationRow(id)).status).toBe('member');
		await expect(applicationEvents(id)).resolves.toEqual([
			expect.objectContaining({
				type: 'email_sent',
				body: expect.stringContaining('re-sent'),
			}),
		]);
	});

	test('only for a member; approving sends the first one', async () => {
		const { id } = await insertApplication({ status: 'coffee_invited' });
		await expect(resend(id)).resolves.toEqual({
			kind: 'wrong-status',
			status: 'coffee_invited',
		});
		expect(sendEmail).not.toHaveBeenCalled();
	});

	// The old link is retired only once the new one has gone. Superseding at
	// mint would leave a member whose re-send failed holding no working link.
	test('a failed send is recorded, the new link is killed and the previous one still works', async () => {
		sendEmail.mockResolvedValue(NOT_SENT);
		const { id } = await insertApplication({ status: 'member' });
		const { token: first } = await createSlackInviteToken(id);

		await expect(resend(id)).resolves.toMatchObject({
			kind: 'email-failed',
		});

		await expect(slackInviteForToken(first)).resolves.toEqual({
			ok: true,
			applicationId: id,
		});
		const tokens = await db().select().from(inviteToken);
		expect(tokens).toHaveLength(2);
		const [minted] = tokens.filter((row) => row.expiresAt <= new Date());
		expect(minted).toBeDefined();
		await expect(applicationEvents(id)).resolves.toEqual([
			expect.objectContaining({ type: 'email_failed' }),
		]);
	});

	test('a supersession that fails still records the send, and says the old link is live', async () => {
		vi.stubEnv('URL', 'https://virtualcoffee.io');
		sendEmail.mockResolvedValue(SENT);
		const { id } = await insertApplication({ status: 'member' });
		const { token: first } = await createSlackInviteToken(id);
		const fault = await failWrites('invite_token', 'update');
		const error = vi.spyOn(console, 'error').mockImplementation(() => {});
		try {
			await expect(resend(id)).resolves.toEqual({
				kind: 'done',
			});
			expect(error).toHaveBeenCalledOnce();
		} finally {
			await fault.remove();
			error.mockRestore();
		}

		const [call] = sendEmail.mock.calls;
		for (const token of [first, codeIn(call[1].inviteUrl)]) {
			await expect(slackInviteForToken(token)).resolves.toEqual({
				ok: true,
				applicationId: id,
			});
		}
		await expect(applicationEvents(id)).resolves.toEqual([
			expect.objectContaining({
				type: 'email_sent',
				body: expect.stringMatching(
					/^Slack invite re-sent to .* — the previous link is still live$/,
				),
			}),
		]);
	});

	test("a second re-send retires the first re-send's link too; the newest is the one that works", async () => {
		vi.stubEnv('URL', 'https://virtualcoffee.io');
		sendEmail.mockResolvedValue(SENT);
		const { id } = await insertApplication({ status: 'member' });

		await expect(resend(id)).resolves.toEqual({ kind: 'done' });
		await expect(resend(id)).resolves.toEqual({ kind: 'done' });

		const tokens = await db()
			.select()
			.from(inviteToken)
			.orderBy(inviteToken.createdAt);
		expect(tokens).toHaveLength(2);
		const now = new Date();
		expect(tokens[0].expiresAt <= now).toBe(true);
		expect(tokens[1].expiresAt > now).toBe(true);
	});
});

describe('submit', () => {
	const ada = { name: 'Ada Lovelace', email: 'ada@example.test' };

	/** The one application written, as the row holds it. */
	async function onlyRow() {
		const [row] = await db().select().from(membershipApplication);
		return row;
	}

	test('an email already in the pipeline is refused; a closed one may apply again', async () => {
		await insertApplication({ email: 'Ada@Example.test', status: 'member' });

		await expect(submit(ada, null)).resolves.toEqual({ kind: 'duplicate' });
		expect(await db().select().from(membershipApplication)).toHaveLength(1);

		await db().update(membershipApplication).set({ status: 'declined' });
		await expect(submit(ada, null)).resolves.toMatchObject({
			kind: 'submitted',
		});
		const statuses = (await db().select().from(membershipApplication)).map(
			(row) => row.status,
		);
		expect(statuses.sort()).toEqual(['declined', 'waitlisted']);
	});

	test('a valid Claim Link makes a priority application and kills the link', async () => {
		const { id, token } = await insertInvite({
			inviterSlackUserId: 'U_GRACE',
			inviterName: 'Grace Hopper',
		});

		const submitted = await submit(ada, token);

		expect(submitted).toMatchObject({
			kind: 'submitted',
			claimed: { id, inviterName: 'Grace Hopper' },
		});
		const row = await onlyRow();
		expect(row).toMatchObject({
			source: 'volunteer_invite',
			isPriority: true,
			inviteId: id,
			referrer: 'Grace Hopper',
		});
		await expect(inviteRow(id)).resolves.toMatchObject({
			status: 'accepted',
			tokenHash: null,
		});
		expect(row.agreedToCocAt).toEqual((await inviteRow(id)).claimedAt);
		await expect(applicationEvents(row.id)).resolves.toEqual([
			expect.objectContaining({
				type: 'submitted',
				body: 'Application submitted from an invite by Grace Hopper',
			}),
		]);
	});

	test('an expired link still produces an application, as an ordinary signup', async () => {
		const { id, token } = await insertInvite({
			inviterSlackUserId: 'U_GRACE',
			expiresAt: new Date(Date.now() - 1000),
		});

		await expect(submit(ada, token)).resolves.toMatchObject({
			kind: 'submitted',
			claimed: null,
		});

		await expect(onlyRow()).resolves.toMatchObject({
			source: 'waitlist_signup',
			isPriority: false,
			inviteId: null,
		});
		await expect(inviteRow(id)).resolves.toMatchObject({ status: 'pending' });
	});

	test('a link works once', async () => {
		const { id, token } = await insertInvite({ inviterSlackUserId: 'U_GRACE' });

		await submit(ada, token);
		await submit({ ...ada, email: 'second@example.test' }, token);

		const rows = await db()
			.select({ inviteId: membershipApplication.inviteId })
			.from(membershipApplication);
		expect(rows.filter((r) => r.inviteId === id)).toHaveLength(1);
		expect(rows.filter((r) => r.inviteId === null)).toHaveLength(1);
	});

	test('an ordinary submission is waitlisted and not flagged', async () => {
		await expect(submit(ada, null)).resolves.toMatchObject({
			kind: 'submitted',
			flagged: false,
		});
		const row = await onlyRow();
		expect(row.status).toBe('waitlisted');
		expect(row.waitlistedAt).toEqual(row.submittedAt);
		await expect(applicationEvents(row.id)).resolves.toEqual([
			expect.objectContaining({ type: 'submitted' }),
		]);
	});

	test('a machine-generated name is quarantined, with the reason in History', async () => {
		await expect(
			submit({ ...ada, name: 'HXtBTQgRAfwqQQPyStQoKS' }, null),
		).resolves.toMatchObject({ kind: 'submitted', flagged: true });

		const row = await onlyRow();
		expect(row).toMatchObject({ status: 'suspected_spam', waitlistedAt: null });
		await expect(applicationEvents(row.id)).resolves.toEqual([
			expect.objectContaining({ type: 'submitted' }),
			expect.objectContaining({
				type: 'flagged_as_spam',
				body: 'Name looks machine-generated',
			}),
		]);
		const [submitted] = await db()
			.select({ toStatus: applicationEvent.toStatus })
			.from(applicationEvent)
			.where(
				and(
					eq(applicationEvent.applicationId, row.id),
					eq(applicationEvent.type, 'submitted'),
				),
			);
		expect(submitted.toStatus).toBe('suspected_spam');
	});

	test('a dotted Gmail address is quarantined with the email reason', async () => {
		await submit({ ...ada, email: 'x.x.xx.xxx.xx.x.x42@gmail.com' }, null);

		const row = await onlyRow();
		expect(row.status).toBe('suspected_spam');
		await expect(applicationEvents(row.id)).resolves.toEqual([
			expect.objectContaining({ type: 'submitted' }),
			expect.objectContaining({
				type: 'flagged_as_spam',
				body: 'Email looks like a Gmail dot-trick address',
			}),
		]);
	});

	test('a redeemed Claim Link skips the heuristic', async () => {
		const { id, token } = await insertInvite({ inviterSlackUserId: 'U_GRACE' });

		await expect(
			submit({ ...ada, name: 'HXtBTQgRAfwqQQPyStQoKS' }, token),
		).resolves.toMatchObject({ kind: 'submitted', flagged: false });

		const row = await onlyRow();
		expect(row.status).toBe('waitlisted');
		await expect(inviteRow(id)).resolves.toMatchObject({ status: 'accepted' });
		await expect(applicationEvents(row.id)).resolves.toEqual([
			expect.objectContaining({ type: 'submitted' }),
		]);
	});

	test('a repeat from a quarantined address writes nothing and burns no link', async () => {
		await insertApplication({
			email: 'Bot@Example.test',
			status: 'suspected_spam',
			waitlistedAt: null,
		});
		const { id, token } = await insertInvite({ inviterSlackUserId: 'U_GRACE' });

		await expect(
			submit({ ...ada, email: 'bot@example.test' }, token),
		).resolves.toEqual({ kind: 'quarantined-repeat' });

		expect(await db().select().from(membershipApplication)).toHaveLength(1);
		expect(await db().select().from(applicationEvent)).toEqual([]);
		await expect(inviteRow(id)).resolves.toMatchObject({ status: 'pending' });
	});

	test('a failed insert does not burn the Claim Link', async () => {
		const { id, token } = await insertInvite({ inviterSlackUserId: 'U_GRACE' });
		const fault = await failInserts('application_event');
		try {
			await expect(submit(ada, token)).rejects.toThrow();
		} finally {
			await fault.remove();
		}

		await expect(inviteRow(id)).resolves.toMatchObject({ status: 'pending' });
		expect(await db().select().from(membershipApplication)).toEqual([]);
	});
});
