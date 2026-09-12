import { beforeEach, describe, expect, test, vi } from 'vitest';

import { db, inviteToken, user } from '@/db';
import { NOT_FOUND } from '@/test/next';
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

import {
	addNote,
	approveMembership,
	declineApplication,
	recordAttendance,
	sendCoffeeInvite,
	withdrawApplication,
} from './actions';

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

beforeEach(() => {
	sendEmail.mockReset();
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

	test('a member cannot be declined or withdrawn, and closing twice is refused', async () => {
		const member = await insertApplication({ status: 'member' });
		await expect(declineApplication(member.id, null)).resolves.toMatchObject({
			ok: false,
			message: 'A member cannot be declined or withdrawn.',
		});

		const { id } = await insertApplication({ status: 'coffee_invited' });
		await withdrawApplication(id);
		await expect(withdrawApplication(id)).resolves.toMatchObject({
			ok: false,
			message: 'Already withdrawn.',
		});
		await expect(applicationEvents(id)).resolves.toHaveLength(1);
		expect(sendEmail).not.toHaveBeenCalled();
	});
});
