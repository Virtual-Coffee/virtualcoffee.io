import { eq } from 'drizzle-orm';
import { describe, expect, test, vi } from 'vitest';

import {
	cocReport,
	db,
	submissionEvent,
	volunteerSignup,
	type Database,
	type Transaction,
} from '@/db';

import { failInserts } from '@/test/db/fixtures';

import { neverAnnouncedAmong, notifyAndRecord } from '@/lib/history/eventLog';

import {
	failedNotifications,
	listSubmissions,
	submissionScope,
	submissionSubject,
} from './submissions';
import { persistSubmission } from './submitSubmission';

const NOTIFIED = { channel: 'slack' as const, what: 'Notified' };

async function insertCocReport(executor: Database | Transaction = db()) {
	const [row] = await executor
		.insert(cocReport)
		.values({
			reporteeName: 'Someone',
			timeLocation: 'Slack',
			description: 'x',
		})
		.returning({ id: cocReport.id });
	return row.id;
}

async function eventsFor(id: string) {
	return db()
		.select({ type: submissionEvent.type, body: submissionEvent.body })
		.from(submissionEvent)
		.where(eq(submissionEvent.cocReportId, id))
		.orderBy(submissionEvent.createdAt);
}

describe('notifyAndRecord', () => {
	test('a delivered notification is recorded as sent', async () => {
		const id = await insertCocReport();
		await notifyAndRecord(submissionSubject('coc', id), NOTIFIED, async () => ({
			ok: true,
			message: 'Posted to #coc',
		}));
		await expect(eventsFor(id)).resolves.toEqual([
			{ type: 'notification_sent', body: 'Notified' },
		]);
	});

	/**
	 * ADR 0005: the row is already committed by the time this runs, so a
	 * failure is recorded and surfaced, never raised — losing a CoC report
	 * because Slack was down is the worse outcome.
	 */
	test('a failed notification is recorded, and never thrown', async () => {
		const id = await insertCocReport();
		await expect(
			notifyAndRecord(submissionSubject('coc', id), NOTIFIED, async () => ({
				ok: false,
				definitelyNotSent: true,
				message: 'Slack rejected the message (404).',
			})),
		).resolves.toBeUndefined();
		await expect(eventsFor(id)).resolves.toEqual([
			{
				type: 'notification_failed',
				body: 'Notified failed: Slack rejected the message (404).',
			},
		]);
	});

	test('a notifier that throws is treated the same as one that fails', async () => {
		const id = await insertCocReport();
		await expect(
			notifyAndRecord(submissionSubject('coc', id), NOTIFIED, async () => {
				throw new Error('fetch failed');
			}),
		).resolves.toBeUndefined();
		await expect(eventsFor(id)).resolves.toEqual([
			{ type: 'notification_failed', body: 'Notified failed: fetch failed' },
		]);
	});

	/** The list marker and `?failed=1` show the rows the banner counts. */
	test('the list marks and filters the same rows the banner counts', async () => {
		const failed = await insertCocReport();
		const fine = await insertCocReport();
		const moved = await insertCocReport();
		await notifyAndRecord(
			submissionSubject('coc', failed),
			NOTIFIED,
			async () => ({ ok: false, definitelyNotSent: true, message: 'x' }),
		);
		await notifyAndRecord(
			submissionSubject('coc', fine),
			NOTIFIED,
			async () => ({ ok: true, message: 'x' }),
		);
		await db()
			.update(cocReport)
			.set({ status: 'resolved' })
			.where(eq(cocReport.id, moved));

		await expect(
			neverAnnouncedAmong(submissionScope('coc'), [failed, fine, moved]),
		).resolves.toEqual([failed]);
		const { rows, rowCount } = await listSubmissions('coc', { failed: true });
		expect(rows.map((row) => row.id)).toEqual([failed]);
		expect(rowCount).toBe(1);
		await expect(failedNotifications(['coc'])).resolves.toEqual({ coc: 1 });
	});

	test('losing the audit line does not lose the submission', async () => {
		const error = vi.spyOn(console, 'error').mockImplementation(() => {});
		// An id no row has: the event insert fails its foreign key.
		await expect(
			notifyAndRecord(
				submissionSubject('coc', '0199404c-2c5e-7000-8000-000000000000'),
				NOTIFIED,
				async () => ({
					ok: true,
					message: 'x',
				}),
			),
		).resolves.toBeUndefined();
		expect(error).toHaveBeenCalledOnce();
		error.mockRestore();
	});
});

describe('persistSubmission', () => {
	const copy = { submitted: 'Report submitted', failed: 'Try again.' };

	test('writes the row and its `submitted` event', async () => {
		const saved = await persistSubmission(
			'coc',
			(tx) => insertCocReport(tx).then((id) => ({ id })),
			copy,
		);
		expect(saved).toEqual({ id: expect.any(String) });
		if ('error' in saved) throw new Error('unreachable');
		await expect(eventsFor(saved.id)).resolves.toEqual([
			{ type: 'submitted', body: 'Report submitted' },
		]);
	});

	/**
	 * The submitter is told to try again on failure, so a row that outlived
	 * its failed event would be duplicated by that retry.
	 */
	test('a row whose event fails is rolled back with it', async () => {
		const error = vi.spyOn(console, 'error').mockImplementation(() => {});
		const fault = await failInserts('submission_event');
		try {
			await expect(
				persistSubmission(
					'coc',
					(tx) => insertCocReport(tx).then((id) => ({ id })),
					copy,
				),
			).resolves.toEqual({
				error: expect.objectContaining({ is_error: true }),
			});
		} finally {
			await fault.remove();
			error.mockRestore();
		}
		await expect(db().select().from(cocReport)).resolves.toEqual([]);
	});
});

/** Drizzle wraps driver errors; the constraint name is on the cause. */
const violates = (constraint: string) => ({ cause: { constraint } });

describe('submission_event', () => {
	test('the database refuses an event with two subjects, or none', async () => {
		const coc = await insertCocReport();
		const [signup] = await db()
			.insert(volunteerSignup)
			.values({
				name: 'Ada',
				email: 'a@b.test',
				githubUsername: 'ada',
				position: 'x',
				description: 'x',
			})
			.returning({ id: volunteerSignup.id });

		await expect(
			db().insert(submissionEvent).values({
				cocReportId: coc,
				volunteerSignupId: signup.id,
				type: 'note',
			}),
		).rejects.toMatchObject(violates('submission_event_exactly_one_subject'));
		await expect(
			db().insert(submissionEvent).values({ type: 'note' }),
		).rejects.toMatchObject(violates('submission_event_exactly_one_subject'));
	});
});
