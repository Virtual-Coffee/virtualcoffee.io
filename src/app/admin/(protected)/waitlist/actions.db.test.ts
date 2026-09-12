import { beforeEach, describe, expect, test, vi } from 'vitest';

import { db, inviteToken, user } from '@/db';
import {
	createSlackInviteToken,
	slackInviteForToken,
} from '@/lib/inviteTokens';
import { MAX_NOTE_LENGTH } from '@/lib/notes';
import { NOT_FOUND } from '@/test/next';
import { MAYBE_SENT, NOT_SENT, SENT } from '@/test/email';
import { signInAs } from '@/test/session';
import {
	applicationEvents,
	applicationRow,
	insertApplication,
	insertInvite,
	insertUser,
	inviteRow,
} from '@/test/db/fixtures';

const sendEmail = vi.hoisted(() => vi.fn());
vi.mock('@/lib/email/transport', () => ({ sendEmail }));

/**
 * Stages the race the conditional updates exist for: the action reads one
 * status, but the row has already moved on by the time it writes. Set
 * `readAs` to the status the action should believe it saw.
 */
const staleRead = vi.hoisted(() => ({ readAs: null as string | null }));
vi.mock('@/lib/applications', async (importOriginal) => {
	const actual = await importOriginal<typeof import('@/lib/applications')>();
	return {
		...actual,
		getApplication: async (id: string) => {
			const row = await actual.getApplication(id);
			return row && staleRead.readAs
				? { ...row, status: staleRead.readAs }
				: row;
		},
	};
});

import {
	addNote,
	approveMembership,
	declineApplication,
	recordAttendance,
	resendSlackInvite,
	sendCoffeeInvite,
	withdrawApplication,
} from './actions';

beforeEach(() => {
	sendEmail.mockReset();
	staleRead.readAs = null;
	signInAs('admin');
});

describe('sendCoffeeInvite', () => {
	/**
	 * Send first, then write. Reversed, a failed send leaves an applicant
	 * marked as invited with no email, and nobody can tell.
	 */
	test('a definite failure changes nothing and says a retry is safe', async () => {
		sendEmail.mockResolvedValue(NOT_SENT);
		const { id } = await insertApplication({ status: 'waitlisted' });

		await expect(sendCoffeeInvite(id, false)).resolves.toEqual({
			ok: false,
			message: NOT_SENT.message,
			emailSent: false,
		});
		await expect(applicationRow(id)).resolves.toMatchObject({
			status: 'waitlisted',
			coffeeInvitedAt: null,
		});
		await expect(applicationEvents(id)).resolves.toEqual([
			expect.objectContaining({ type: 'email_failed' }),
		]);
	});

	test('a timeout changes nothing either, but will not promise nothing went out', async () => {
		sendEmail.mockResolvedValue(MAYBE_SENT);
		const { id } = await insertApplication({ status: 'waitlisted' });

		await expect(sendCoffeeInvite(id, false)).resolves.toMatchObject({
			ok: false,
			emailSent: 'unknown',
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

		await expect(sendCoffeeInvite(id, true)).resolves.toEqual({ ok: true });

		expect(sendEmail).toHaveBeenCalledWith({
			to: 'ada@example.test',
			subject: 'You’re invited to a Virtual Coffee',
			text: expect.stringMatching(/^Hi Ada,/),
			cc: 'dev@localhost',
		});
		const row = await applicationRow(id);
		expect(row.status).toBe('coffee_invited');
		expect(row.coffeeInvitedAt).toBeInstanceOf(Date);
		await expect(applicationEvents(id)).resolves.toEqual([
			{
				type: 'coffee_invited',
				body: 'Coffee invite emailed to ada@example.test',
				// The bypass session has no user row, so the event has no actor.
				actorUserId: null,
			},
		]);
	});

	test('the actor is recorded when the session belongs to a real user', async () => {
		sendEmail.mockResolvedValue(SENT);
		// The bypass session's user id is `dev-bypass`; give it a row.
		await db().insert(user).values({
			id: 'dev-bypass',
			name: 'Local dev',
			email: 'dev@localhost',
			role: 'admin',
		});
		const { id } = await insertApplication({ status: 'waitlisted' });

		await sendCoffeeInvite(id, false);
		await expect(applicationEvents(id)).resolves.toEqual([
			expect.objectContaining({ actorUserId: 'dev-bypass' }),
		]);
	});

	test('only from waitlisted, and only with waitlist:manage', async () => {
		sendEmail.mockResolvedValue(SENT);
		const { id } = await insertApplication({ status: 'coffee_invited' });

		await expect(sendCoffeeInvite(id, false)).resolves.toEqual({
			ok: false,
			message:
				'Can only send a Coffee invite from Waitlisted, not coffee_invited.',
			emailSent: false,
		});
		await expect(sendCoffeeInvite('not-an-id', false)).resolves.toMatchObject({
			ok: false,
			message: 'Application not found.',
		});
		expect(sendEmail).not.toHaveBeenCalled();

		signInAs('coc_reviewer');
		await expect(sendCoffeeInvite(id, false)).rejects.toMatchObject(NOT_FOUND);
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

		await expect(approveMembership(id, false)).resolves.toEqual({ ok: true });

		expect(tokensWhenSending).toEqual([1, 1]);
		const [, slackInvite] = sendEmail.mock.calls;
		expect(slackInvite[0]).toMatchObject({
			subject: 'Your Virtual Coffee Slack invite',
			text: expect.stringContaining(
				'https://virtualcoffee.io/join-slack?code=',
			),
		});
		const row = await applicationRow(id);
		expect(row.status).toBe('member');
		expect(row.approvedAt).toBeInstanceOf(Date);
		expect(row.coffeeAttendedAt).toBeInstanceOf(Date);
	});

	test('a failed welcome email writes nothing', async () => {
		sendEmail.mockResolvedValue(NOT_SENT);
		const { id } = await insertApplication({ status: 'coffee_invited' });

		await expect(approveMembership(id, false)).resolves.toMatchObject({
			ok: false,
			emailSent: false,
		});
		await expect(applicationRow(id)).resolves.toMatchObject({
			status: 'coffee_invited',
			approvedAt: null,
		});
		expect(sendEmail).toHaveBeenCalledOnce();
	});

	test('welcome sent but Slack invite not: says so, and does not make them a member', async () => {
		sendEmail.mockResolvedValueOnce(SENT).mockResolvedValueOnce(NOT_SENT);
		const { id } = await insertApplication({
			status: 'coffee_invited',
			name: 'Ada Lovelace',
		});

		await expect(approveMembership(id, false)).resolves.toEqual({
			ok: false,
			message: expect.stringMatching(
				/^The welcome email was sent, but the Slack invite was not: .* Ada Lovelace has not been made a member — approving again will re-send both emails\.$/,
			),
			emailSent: true,
		});
		await expect(applicationRow(id)).resolves.toMatchObject({
			status: 'coffee_invited',
		});
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
});

describe('recordAttendance and addNote', () => {
	test('attendance is only recorded after a Coffee invite', async () => {
		const invited = await insertApplication({ status: 'coffee_invited' });
		await expect(recordAttendance(invited.id)).resolves.toEqual({ ok: true });
		await expect(applicationRow(invited.id)).resolves.toMatchObject({
			coffeeAttendedAt: expect.any(Date),
		});

		const declined = await insertApplication({ status: 'declined' });
		await expect(recordAttendance(declined.id)).resolves.toMatchObject({
			ok: false,
			message: expect.stringContaining('not from declined'),
		});
		await expect(applicationRow(declined.id)).resolves.toMatchObject({
			coffeeAttendedAt: null,
		});
	});

	test('attendance is recorded once; a second click changes nothing', async () => {
		const { id } = await insertApplication({ status: 'coffee_invited' });
		await expect(recordAttendance(id)).resolves.toEqual({ ok: true });
		const { coffeeAttendedAt } = await applicationRow(id);

		await expect(recordAttendance(id)).resolves.toEqual({
			ok: false,
			message: 'Attendance is already recorded.',
		});
		expect((await applicationRow(id)).coffeeAttendedAt).toEqual(
			coffeeAttendedAt,
		);
		await expect(applicationEvents(id)).resolves.toEqual([
			expect.objectContaining({ type: 'attendance_recorded' }),
		]);
	});

	test('a note on a malformed or unknown id is a soft failure, not a 22P02', async () => {
		await expect(addNote('not-a-uuid', 'hello')).resolves.toMatchObject({
			ok: false,
			message: 'Application not found.',
		});
		await expect(
			addNote('01930000-0000-7000-8000-000000000000', 'hello'),
		).resolves.toMatchObject({ ok: false, message: 'Application not found.' });
	});
});

describe('declineApplication and withdrawApplication', () => {
	test('close the application with a timestamp and the note', async () => {
		const { id } = await insertApplication({ status: 'waitlisted' });

		await expect(declineApplication(id, 'Not a developer.')).resolves.toEqual({
			ok: true,
		});
		const row = await applicationRow(id);
		expect(row.status).toBe('declined');
		expect(row.closedAt).toBeInstanceOf(Date);
		await expect(applicationEvents(id)).resolves.toEqual([
			expect.objectContaining({ type: 'declined', body: 'Not a developer.' }),
		]);
	});

	test('a blank note is recorded as none; an over-long one is refused first', async () => {
		const blank = await insertApplication({ status: 'waitlisted' });
		await expect(withdrawApplication(blank.id, '   ')).resolves.toEqual({
			ok: true,
		});
		await expect(applicationEvents(blank.id)).resolves.toEqual([
			expect.objectContaining({ type: 'withdrawn', body: null }),
		]);

		const { id } = await insertApplication({ status: 'waitlisted' });
		await expect(
			declineApplication(id, 'x'.repeat(MAX_NOTE_LENGTH + 1)),
		).resolves.toMatchObject({
			ok: false,
			message: expect.stringContaining('at most'),
		});
		expect((await applicationRow(id)).status).toBe('waitlisted');
		await expect(applicationEvents(id)).resolves.toEqual([]);
	});

	test('a member cannot be declined or withdrawn, and closing twice is refused', async () => {
		const member = await insertApplication({ status: 'member' });
		await expect(declineApplication(member.id, null)).resolves.toMatchObject({
			ok: false,
			message: 'A member cannot be declined or withdrawn.',
		});

		const { id } = await insertApplication({ status: 'coffee_invited' });
		await withdrawApplication(id, null);
		await expect(withdrawApplication(id, null)).resolves.toMatchObject({
			ok: false,
			message: 'Already withdrawn.',
		});
		await expect(applicationEvents(id)).resolves.toHaveLength(1);
		expect(sendEmail).not.toHaveBeenCalled();
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
		const results = await Promise.all([
			withdrawApplication(id, null),
			declineApplication(id, null),
		]);
		expect(results.filter((r) => r.ok)).toHaveLength(1);
		await expect(applicationEvents(id)).resolves.toHaveLength(1);
	});

	test('a Coffee invite that raced a decline says the email went anyway', async () => {
		sendEmail.mockResolvedValue(SENT);
		const { id } = await insertApplication({ status: 'declined' });
		staleRead.readAs = 'waitlisted';

		await expect(sendCoffeeInvite(id, false)).resolves.toEqual({
			ok: false,
			message: expect.stringContaining('changed while you were looking'),
			emailSent: true,
		});
		expect((await applicationRow(id)).status).toBe('declined');
		await expect(applicationEvents(id)).resolves.toEqual([
			expect.objectContaining({
				type: 'email_sent',
				body: expect.stringContaining('had already left Waitlisted'),
			}),
		]);
	});

	test('an approval that raced a withdrawal does not make a member', async () => {
		sendEmail.mockResolvedValue(SENT);
		const { id } = await insertApplication({ status: 'withdrawn' });
		staleRead.readAs = 'coffee_invited';

		await expect(approveMembership(id, false)).resolves.toMatchObject({
			ok: false,
			emailSent: true,
		});
		expect((await applicationRow(id)).status).toBe('withdrawn');
		expect(sendEmail).toHaveBeenCalledTimes(2);
	});

	test('attendance cannot be recorded on a row that already moved', async () => {
		const { id } = await insertApplication({ status: 'member' });
		staleRead.readAs = 'coffee_invited';
		await expect(recordAttendance(id)).resolves.toMatchObject({ ok: false });
		expect((await applicationRow(id)).coffeeAttendedAt).toBeNull();
	});
});

describe('a rejected cc', () => {
	test('is reported as a warning on success, never as a failed send', async () => {
		sendEmail.mockResolvedValue({
			ok: true,
			warning: 'Sent, but the copy to dev@localhost was rejected.',
		});
		const { id } = await insertApplication({ status: 'waitlisted' });
		await expect(sendCoffeeInvite(id, true)).resolves.toEqual({
			ok: true,
			message: 'Sent, but the copy to dev@localhost was rejected.',
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

		await expect(resendSlackInvite(id, false)).resolves.toEqual({ ok: true });

		const tokens = await db().select().from(inviteToken);
		expect(tokens).toHaveLength(2);
		await expect(slackInviteForToken(first)).resolves.toEqual({
			ok: false,
			reason: 'expired',
		});
		expect(sendEmail).toHaveBeenCalledWith(
			expect.objectContaining({
				text: expect.stringContaining('/join-slack?code='),
			}),
		);
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
		await expect(resendSlackInvite(id, false)).resolves.toMatchObject({
			ok: false,
			emailSent: false,
		});
		expect(sendEmail).not.toHaveBeenCalled();
	});

	test('a failed send is recorded and nothing else changes', async () => {
		sendEmail.mockResolvedValue(NOT_SENT);
		const { id } = await insertApplication({ status: 'member' });
		await expect(resendSlackInvite(id, false)).resolves.toMatchObject({
			ok: false,
			emailSent: false,
		});
		await expect(applicationEvents(id)).resolves.toEqual([
			expect.objectContaining({ type: 'email_failed' }),
		]);
	});
});
