import { eq } from 'drizzle-orm';
import { describe, expect, test, vi } from 'vitest';

import {
	cocReport,
	coffeeTableGroupRequest,
	db,
	submissionEvent,
	volunteerSignup,
} from '@/db';

import { failInserts } from '@/test/db/fixtures';

import { failedNotifications } from './submissions';
import {
	notifyAndRecord,
	persistSubmission,
	recordSubmissionEvent,
} from './submitSubmission';

async function insertCocReport() {
	const [row] = await db()
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
		await notifyAndRecord('coc', id, async () => ({
			ok: true,
			message: 'Posted to #coc',
		}));
		await expect(eventsFor(id)).resolves.toEqual([
			{ type: 'notification_sent', body: 'Posted to #coc' },
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
			notifyAndRecord('coc', id, async () => ({
				ok: false,
				message: 'Slack rejected the message (404).',
			})),
		).resolves.toBeUndefined();
		await expect(eventsFor(id)).resolves.toEqual([
			{
				type: 'notification_failed',
				body: 'Slack rejected the message (404).',
			},
		]);
	});

	test('a notifier that throws is treated the same as one that fails', async () => {
		const id = await insertCocReport();
		await expect(
			notifyAndRecord('coc', id, async () => {
				throw new Error('fetch failed');
			}),
		).resolves.toBeUndefined();
		await expect(eventsFor(id)).resolves.toEqual([
			{ type: 'notification_failed', body: 'fetch failed' },
		]);
	});

	test('what the /admin banner counts', async () => {
		const failed = await insertCocReport();
		const fine = await insertCocReport();
		await notifyAndRecord('coc', failed, async () => ({
			ok: false,
			message: 'x',
		}));
		await notifyAndRecord('coc', fine, async () => ({
			ok: true,
			message: 'x',
		}));

		// Kinds with nothing failed are omitted, so the banner has nothing to say.
		await expect(failedNotifications(['coc', 'volunteers'])).resolves.toEqual({
			coc: 1,
		});
	});

	/**
	 * The banner says "nobody will have seen them come in". Once a maintainer
	 * has moved the submission on, or a later attempt got through, that is
	 * no longer true — and a count that never clears is one nobody reads.
	 */
	test('the banner clears when someone acts on it, or a later attempt succeeds', async () => {
		const seen = await insertCocReport();
		const retried = await insertCocReport();
		const fail = async () => ({ ok: false, message: 'x' });
		await notifyAndRecord('coc', seen, fail);
		await notifyAndRecord('coc', retried, fail);
		await expect(failedNotifications(['coc'])).resolves.toEqual({ coc: 2 });

		await db()
			.update(cocReport)
			.set({ status: 'in_progress' })
			.where(eq(cocReport.id, seen));
		await expect(failedNotifications(['coc'])).resolves.toEqual({ coc: 1 });

		await notifyAndRecord('coc', retried, async () => ({
			ok: true,
			message: 'x',
		}));
		await expect(failedNotifications(['coc'])).resolves.toEqual({});
	});

	test('losing the audit line does not lose the submission', async () => {
		const error = vi.spyOn(console, 'error').mockImplementation(() => {});
		// An id no row has: the event insert fails its foreign key.
		await expect(
			notifyAndRecord(
				'coc',
				'0199404c-2c5e-7000-8000-000000000000',
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
			async (tx) => {
				const [row] = await tx
					.insert(cocReport)
					.values({
						reporteeName: 'Someone',
						timeLocation: 'x',
						description: 'x',
					})
					.returning({ id: cocReport.id });
				return row;
			},
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
					() => insertCocReport().then((id) => ({ id })),
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

describe('recordSubmissionEvent', () => {
	test('sets the foreign key for its kind, and only that one', async () => {
		const [signup] = await db()
			.insert(volunteerSignup)
			.values({
				name: 'Ada',
				email: 'ada@example.test',
				githubUsername: 'ada',
				position: 'Any',
				description: 'x',
			})
			.returning({ id: volunteerSignup.id });
		const [group] = await db()
			.insert(coffeeTableGroupRequest)
			.values({
				name: 'Ada',
				email: 'ada@example.test',
				groupName: 'Rust',
				description: 'x',
			})
			.returning({ id: coffeeTableGroupRequest.id });

		await recordSubmissionEvent({
			kind: 'volunteers',
			submissionId: signup.id,
			type: 'submitted',
		});
		await recordSubmissionEvent({
			kind: 'coffee-tables',
			submissionId: group.id,
			type: 'submitted',
		});

		const rows = await db()
			.select({
				coc: submissionEvent.cocReportId,
				volunteers: submissionEvent.volunteerSignupId,
				lunchAndLearn: submissionEvent.lunchAndLearnIdeaId,
				coffeeTables: submissionEvent.coffeeTableGroupRequestId,
			})
			.from(submissionEvent);
		expect(rows).toEqual(
			expect.arrayContaining([
				{
					coc: null,
					volunteers: signup.id,
					lunchAndLearn: null,
					coffeeTables: null,
				},
				{
					coc: null,
					volunteers: null,
					lunchAndLearn: null,
					coffeeTables: group.id,
				},
			]),
		);
	});

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
