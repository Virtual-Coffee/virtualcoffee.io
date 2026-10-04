import { beforeEach, describe, expect, test } from 'vitest';

import { sendEmail } from '@/test/mocks/spies';
import { staleRead } from '@/test/mocks/wrappers';
import { NOT_FOUND } from '@/test/next';
import { MAYBE_SENT, NOT_SENT, SENT } from '@/test/outbound';
import { signInAs } from '@/test/session';
import { applicationRow, insertApplication } from '@/test/db/fixtures';

import {
	addNote,
	approveMembership,
	declineApplication,
	recordAttendance,
	releaseApplication,
	resendSlackInvite,
	sendCoffeeInvite,
	withdrawApplication,
} from './actions';

/**
 * The invariants — guards, send-first order, token rollback, races — are in
 * `lifecycle.db.test.ts`. This file is who may act, and what each outcome says.
 */

beforeEach(async () => {
	await signInAs('admin');
});

describe('every action', () => {
	test('is refused without waitlist:manage', async () => {
		const { id } = await insertApplication({ status: 'coffee_invited' });
		const spam = await insertApplication({ status: 'suspected_spam' });
		await signInAs('coc_reviewer');

		await expect(releaseApplication(spam.id)).rejects.toMatchObject(NOT_FOUND);
		expect((await applicationRow(spam.id)).status).toBe('suspected_spam');

		for (const act of [
			() => sendCoffeeInvite(id, false),
			() => recordAttendance(id),
			() => approveMembership(id, false),
			() => resendSlackInvite(id, false),
			() => declineApplication(id, null),
			() => withdrawApplication(id, null),
			() => addNote(id, 'hello'),
		]) {
			await expect(act()).rejects.toMatchObject(NOT_FOUND);
		}
		expect(sendEmail).not.toHaveBeenCalled();
		expect((await applicationRow(id)).status).toBe('coffee_invited');
	});
});

describe('outcome copy', () => {
	test('not-found is a soft failure, not a 22P02', async () => {
		await expect(sendCoffeeInvite('not-an-id', false)).resolves.toEqual({
			ok: false,
			message: 'Application not found.',
			emailSent: false,
		});
		await expect(recordAttendance('not-an-id')).resolves.toEqual({
			ok: false,
			message: 'Application not found.',
		});
		await expect(addNote('not-a-uuid', 'hello')).resolves.toMatchObject({
			ok: false,
			message: 'Application not found.',
		});
		await expect(
			addNote('01930000-0000-7000-8000-000000000000', 'hello'),
		).resolves.toMatchObject({ ok: false, message: 'Application not found.' });
	});

	test('wrong-status names the status', async () => {
		const invited = await insertApplication({ status: 'coffee_invited' });
		const waiting = await insertApplication({ status: 'waitlisted' });
		const member = await insertApplication({ status: 'member' });
		const declined = await insertApplication({ status: 'declined' });
		const lapsed = await insertApplication({ status: 'lapsed' });

		await expect(sendCoffeeInvite(invited.id, false)).resolves.toEqual({
			ok: false,
			message:
				'Can only send a Coffee invite from Waitlisted, not coffee_invited.',
			emailSent: false,
		});
		await expect(recordAttendance(declined.id)).resolves.toEqual({
			ok: false,
			message:
				'Can only record attendance after a Coffee invite, not from declined.',
		});
		await expect(approveMembership(waiting.id, false)).resolves.toEqual({
			ok: false,
			message:
				'Can only approve membership from Coffee invited, not waitlisted.',
			emailSent: false,
		});
		await expect(resendSlackInvite(invited.id, false)).resolves.toEqual({
			ok: false,
			message:
				'Only a member can be sent another Slack invite, not coffee_invited. Approving sends the first one.',
			emailSent: false,
		});
		await expect(declineApplication(member.id, null)).resolves.toEqual({
			ok: false,
			message: 'A member cannot be declined or withdrawn.',
		});
		await expect(withdrawApplication(declined.id, null)).resolves.toEqual({
			ok: false,
			message: 'Already declined.',
		});
		await expect(declineApplication(lapsed.id, null)).resolves.toEqual({
			ok: false,
			message: 'Cannot be declined or withdrawn from lapsed.',
		});
		await expect(releaseApplication(waiting.id)).resolves.toEqual({
			ok: false,
			message:
				'Only a suspected-spam application can be released, not waitlisted.',
		});
	});

	test('release moves a suspected-spam application to the Waitlist', async () => {
		const { id } = await insertApplication({ status: 'suspected_spam' });

		await expect(releaseApplication(id)).resolves.toEqual({ ok: true });
		expect((await applicationRow(id)).status).toBe('waitlisted');
		await expect(releaseApplication(id)).resolves.toMatchObject({
			ok: false,
		});
	});

	test('email-failed says whether a retry is safe', async () => {
		const { id } = await insertApplication({ status: 'waitlisted' });

		sendEmail.mockResolvedValueOnce(NOT_SENT);
		await expect(sendCoffeeInvite(id, false)).resolves.toEqual({
			ok: false,
			message: NOT_SENT.message,
			emailSent: false,
		});
		sendEmail.mockResolvedValueOnce(MAYBE_SENT);
		await expect(sendCoffeeInvite(id, false)).resolves.toMatchObject({
			ok: false,
			emailSent: 'unknown',
		});
	});

	test('stranded says the email went and the page is stale', async () => {
		sendEmail.mockResolvedValue(SENT);
		const { id } = await insertApplication({ status: 'declined' });
		staleRead.readAs = 'waitlisted';

		await expect(sendCoffeeInvite(id, false)).resolves.toEqual({
			ok: false,
			message: expect.stringContaining('changed while you were looking'),
			emailSent: true,
		});
	});

	test('already-recorded, changed and invalid-note are refusals with their own copy', async () => {
		const attended = await insertApplication({ status: 'coffee_invited' });
		await recordAttendance(attended.id);
		await expect(recordAttendance(attended.id)).resolves.toEqual({
			ok: false,
			message: 'Attendance is already recorded.',
		});

		const { id } = await insertApplication({ status: 'declined' });
		staleRead.readAs = 'waitlisted';
		await expect(declineApplication(id, null)).resolves.toMatchObject({
			ok: false,
			message: expect.stringContaining('changed while you were looking'),
		});

		await expect(
			withdrawApplication(
				(await insertApplication({ status: 'waitlisted' })).id,
				'x'.repeat(6000),
			),
		).resolves.toMatchObject({
			ok: false,
			message: expect.stringContaining('at most'),
		});
	});

	test('done carries the send warning and nothing else', async () => {
		sendEmail.mockResolvedValue({
			ok: true,
			message: 'Sent.',
			warning: 'Sent, but the copy to dev@localhost was rejected.',
		});
		const { id } = await insertApplication({ status: 'waitlisted' });

		await expect(sendCoffeeInvite(id, true)).resolves.toEqual({
			ok: true,
			message: 'Sent, but the copy to dev@localhost was rejected.',
		});
	});
});
