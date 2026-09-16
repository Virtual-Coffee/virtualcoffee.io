import { eq, isNull } from 'drizzle-orm';
import { describe, expect, test, vi } from 'vitest';

import { cocReport, db, membershipApplication, submissionEvent } from '@/db';
import { newId } from '@/db/ids';
import {
	applicationEvents,
	applicationRow,
	failInserts,
	insertApplication,
	insertUser,
} from '@/test/db/fixtures';

import {
	recordEvent,
	recordOutcome,
	transitionAndRecord,
	type Outcome,
	type SubmissionSubject,
} from './eventLog';

const SENT: Outcome = { ok: true, message: 'Sent.' };
const CAPTURED: Outcome = {
	ok: true,
	message: 'Captured, not delivered (test).',
	warning: 'Captured, not delivered (test).',
};
const FAILED: Outcome = { ok: false, message: 'The server said no.' };

async function insertCocReport() {
	const [row] = await db()
		.insert(cocReport)
		.values({
			reporteeName: 'Someone',
			timeLocation: 'Tuesday Coffee',
			description: 'A report.',
		})
		.returning({ id: cocReport.id });
	return {
		kind: 'submission',
		id: row.id,
		table: cocReport,
		eventKey: 'cocReportId',
	} as const satisfies SubmissionSubject;
}

async function submissionEvents(subject: SubmissionSubject) {
	return db()
		.select({
			type: submissionEvent.type,
			body: submissionEvent.body,
			actorUserId: submissionEvent.actorUserId,
			fromStatus: submissionEvent.fromStatus,
			toStatus: submissionEvent.toStatus,
			cocReportId: submissionEvent.cocReportId,
		})
		.from(submissionEvent)
		.where(eq(submissionEvent[subject.eventKey], subject.id))
		.orderBy(submissionEvent.createdAt);
}

describe('recordEvent', () => {
	test('writes an application event', async () => {
		const { id } = await insertApplication({});
		const actor = await insertUser({});

		await recordEvent(
			{ kind: 'application', id },
			{ type: 'note', body: 'Hello', actorUserId: actor.id },
		);

		expect(await applicationEvents(id)).toEqual([
			{ type: 'note', body: 'Hello', actorUserId: actor.id },
		]);
	});

	test('writes a submission event against the kind’s own column', async () => {
		const subject = await insertCocReport();
		const backdated = new Date('2024-01-02T03:04:05Z');

		await recordEvent(subject, {
			type: 'imported',
			body: 'Imported',
			createdAt: backdated,
		});

		const [row] = await db()
			.select({
				cocReportId: submissionEvent.cocReportId,
				volunteerSignupId: submissionEvent.volunteerSignupId,
				createdAt: submissionEvent.createdAt,
			})
			.from(submissionEvent);
		expect(row).toEqual({
			cocReportId: subject.id,
			volunteerSignupId: null,
			createdAt: backdated,
		});
	});
});

describe('recordOutcome', () => {
	test('an email that went is email_sent, one that did not is email_failed', async () => {
		const { id } = await insertApplication({});
		const subject = { kind: 'application', id } as const;

		await recordOutcome(subject, {
			channel: 'email',
			outbound: SENT,
			what: 'Coffee invite to a@example.test',
		});
		await recordOutcome(subject, {
			channel: 'email',
			outbound: FAILED,
			what: 'Coffee invite to a@example.test',
		});

		expect(await applicationEvents(id)).toEqual([
			{
				type: 'email_sent',
				body: 'Coffee invite to a@example.test',
				actorUserId: null,
			},
			{
				type: 'email_failed',
				body: 'Coffee invite to a@example.test failed: The server said no.',
				actorUserId: null,
			},
		]);
	});

	test('a Captured send is still sent, and the body says how', async () => {
		const { id } = await insertApplication({});

		await recordOutcome(
			{ kind: 'application', id },
			{ channel: 'slack', outbound: CAPTURED, what: 'Slack notified' },
		);

		expect(await applicationEvents(id)).toEqual([
			{
				type: 'notification_sent',
				body: 'Slack notified — Captured, not delivered (test).',
				actorUserId: null,
			},
		]);
	});

	test('a Submission’s outcomes are notifications on either channel', async () => {
		const subject = await insertCocReport();

		await recordOutcome(subject, {
			channel: 'slack',
			outbound: SENT,
			what: 'Slack notified of a CoC report',
		});
		await recordOutcome(subject, {
			channel: 'github issue',
			outbound: FAILED,
			what: 'GitHub issue',
		});
		// Nothing emails about a Submission; the type says so, so this never runs.
		const notEmail = () =>
			// @ts-expect-error email is not a Submission channel
			recordOutcome(subject, { channel: 'email', outbound: SENT, what: '' });
		expect(notEmail).toBeTypeOf('function');

		expect(await submissionEvents(subject)).toMatchObject([
			{ type: 'notification_sent', body: 'Slack notified of a CoC report' },
			{
				type: 'notification_failed',
				body: 'GitHub issue failed: The server said no.',
			},
		]);
	});

	test('a lost audit line is logged and reported, never thrown', async () => {
		const error = vi.spyOn(console, 'error').mockImplementation(() => {});
		const failing = await failInserts('application_event');
		try {
			const { id } = await insertApplication({});

			await expect(
				recordOutcome(
					{ kind: 'application', id },
					{ channel: 'email', outbound: SENT, what: 'Coffee invite' },
				),
			).resolves.toBe(false);

			expect(error).toHaveBeenCalledOnce();
			expect(await applicationEvents(id)).toEqual([]);
		} finally {
			await failing.remove();
			error.mockRestore();
		}
	});
});

describe('transitionAndRecord', () => {
	test('moves the row and records it together', async () => {
		const { id } = await insertApplication({ status: 'waitlisted' });
		const actor = await insertUser({});

		const moved = await transitionAndRecord(
			{ kind: 'application', id },
			'waitlisted',
			{ status: 'coffee_invited' },
			{
				type: 'coffee_invited',
				fromStatus: 'waitlisted',
				toStatus: 'coffee_invited',
				actorUserId: actor.id,
			},
		);

		expect(moved).toBe(true);
		expect((await applicationRow(id)).status).toBe('coffee_invited');
		expect(await applicationEvents(id)).toEqual([
			{ type: 'coffee_invited', body: null, actorUserId: actor.id },
		]);
	});

	test('a stale `from` writes nothing', async () => {
		const { id } = await insertApplication({ status: 'coffee_invited' });

		const moved = await transitionAndRecord(
			{ kind: 'application', id },
			'waitlisted',
			{ status: 'declined' },
			{ type: 'declined', fromStatus: 'waitlisted', toStatus: 'declined' },
		);

		expect(moved).toBe(false);
		expect((await applicationRow(id)).status).toBe('coffee_invited');
		expect(await applicationEvents(id)).toEqual([]);
	});

	test('`guard` fences a write that leaves the status alone', async () => {
		const { id } = await insertApplication({ status: 'coffee_invited' });
		const subject = { kind: 'application', id } as const;
		const record = () =>
			transitionAndRecord(
				subject,
				'coffee_invited',
				{ coffeeAttendedAt: new Date() },
				{ type: 'attendance_recorded' },
				isNull(membershipApplication.coffeeAttendedAt),
			);

		expect(await record()).toBe(true);
		expect(await record()).toBe(false);
		expect(await applicationEvents(id)).toHaveLength(1);
	});

	test('a failed event insert rolls the status change back', async () => {
		const { id } = await insertApplication({ status: 'waitlisted' });
		const failing = await failInserts('application_event');
		try {
			await expect(
				transitionAndRecord(
					{ kind: 'application', id },
					'waitlisted',
					{ status: 'declined' },
					{ type: 'declined', fromStatus: 'waitlisted', toStatus: 'declined' },
				),
			).rejects.toThrow();
			expect((await applicationRow(id)).status).toBe('waitlisted');
		} finally {
			await failing.remove();
		}
	});

	test('fences a Submission on its own table', async () => {
		const subject = await insertCocReport();

		const moved = await transitionAndRecord(
			subject,
			'new',
			{ status: 'in_progress' },
			{ type: 'status_changed', fromStatus: 'new', toStatus: 'in_progress' },
		);
		const again = await transitionAndRecord(
			subject,
			'new',
			{ status: 'resolved' },
			{ type: 'status_changed', fromStatus: 'new', toStatus: 'resolved' },
		);

		expect([moved, again]).toEqual([true, false]);
		const [row] = await db()
			.select({ status: cocReport.status })
			.from(cocReport)
			.where(eq(cocReport.id, subject.id));
		expect(row.status).toBe('in_progress');
		expect(await submissionEvents(subject)).toMatchObject([
			{ type: 'status_changed', fromStatus: 'new', toStatus: 'in_progress' },
		]);
	});

	test('an unknown id moves nothing', async () => {
		expect(
			await transitionAndRecord(
				{ kind: 'application', id: newId() },
				'waitlisted',
				{ status: 'declined' },
				{ type: 'declined' },
			),
		).toBe(false);
	});
});
