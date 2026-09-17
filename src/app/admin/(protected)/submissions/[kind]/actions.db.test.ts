import { eq } from 'drizzle-orm';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { cocReport, db, submissionEvent } from '@/db';
import { failInserts } from '@/test/db/fixtures';
import { staleRead } from '@/test/mocks/staleRead';
import { NOT_FOUND } from '@/test/next';
import { signInAs } from '@/test/session';

/** `staleRead.readAs` stages the race — see `@/test/mocks/staleRead`. */
vi.mock('@/lib/submissions', async (importOriginal) =>
	(await import('@/test/mocks/staleRead')).withStaleRead(
		await importOriginal<typeof import('@/lib/submissions')>(),
		'getSubmission',
	),
);

import { addSubmissionNote, setSubmissionStatus } from './actions';

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

describe('authorisation is per kind', () => {
	test('an unknown kind is refused before any permission check', async () => {
		// No session at all: reaching requirePermission() would redirect.
		await expect(setSubmissionStatus('nope', 'x', 'new')).resolves.toEqual({
			ok: false,
			message: 'Unknown submission type.',
		});
		await expect(addSubmissionNote('nope', 'x', 'hi')).resolves.toEqual({
			ok: false,
			message: 'Unknown submission type.',
		});
	});

	test('a role for one section 404s on another', async () => {
		await signInAs('volunteer_coordinator');
		await expect(
			setSubmissionStatus('coc', 'x', 'resolved'),
		).rejects.toMatchObject(NOT_FOUND);
	});

	test('the status and the id are checked before the database', async () => {
		await signInAs('coc_reviewer');
		await expect(setSubmissionStatus('coc', 'x', 'done')).resolves.toEqual({
			ok: false,
			message: 'Unknown status.',
		});
		await expect(
			setSubmissionStatus('coc', 'not-an-id', 'resolved'),
		).resolves.toEqual({
			ok: false,
			message: 'That submission no longer exists.',
		});
	});
});

describe('addSubmissionNote', () => {
	beforeEach(() => signInAs('coc_reviewer'));

	test('records a note against the submission', async () => {
		const id = await insertCocReport();
		await expect(
			addSubmissionNote('coc', id, '  Spoke to them.  '),
		).resolves.toEqual({ ok: true });
		await expect(
			db()
				.select({ type: submissionEvent.type, body: submissionEvent.body })
				.from(submissionEvent)
				.where(eq(submissionEvent.cocReportId, id)),
		).resolves.toEqual([{ type: 'note', body: 'Spoke to them.' }]);
	});

	test('a well-formed id nothing has is a soft failure, not a foreign-key throw', async () => {
		await expect(
			addSubmissionNote('coc', '0199404c-2c5e-7000-8000-000000000000', 'hi'),
		).resolves.toEqual({
			ok: false,
			message: 'That submission no longer exists.',
		});
	});
});

describe('setSubmissionStatus', () => {
	beforeEach(() => signInAs('coc_reviewer'));

	test('a status change whose event fails to write is rolled back with it', async () => {
		const id = await insertCocReport();
		const fault = await failInserts('submission_event');
		try {
			await expect(
				setSubmissionStatus('coc', id, 'resolved'),
			).rejects.toThrow();
		} finally {
			await fault.remove();
		}
		await expect(
			db()
				.select({ status: cocReport.status })
				.from(cocReport)
				.where(eq(cocReport.id, id)),
		).resolves.toEqual([{ status: 'new' }]);
		await expect(
			db()
				.select({ type: submissionEvent.type })
				.from(submissionEvent)
				.where(eq(submissionEvent.cocReportId, id)),
		).resolves.toEqual([]);
	});

	test('moving between the closed statuses keeps the original closedAt; reopening clears it', async () => {
		const id = await insertCocReport();
		const closedAt = async () => {
			const [row] = await db()
				.select({ closedAt: cocReport.closedAt })
				.from(cocReport)
				.where(eq(cocReport.id, id));
			return row.closedAt;
		};

		await setSubmissionStatus('coc', id, 'resolved');
		const resolvedAt = await closedAt();
		expect(resolvedAt).toBeInstanceOf(Date);

		await setSubmissionStatus('coc', id, 'dismissed');
		await expect(closedAt()).resolves.toEqual(resolvedAt);

		await setSubmissionStatus('coc', id, 'in_progress');
		await expect(closedAt()).resolves.toBeNull();
	});

	test('a change that raced another maintainer is refused, not written over', async () => {
		const id = await insertCocReport();
		await setSubmissionStatus('coc', id, 'dismissed');
		// This call read the row before the dismissal landed.
		staleRead.readAs = 'new';

		await expect(setSubmissionStatus('coc', id, 'resolved')).resolves.toEqual({
			ok: false,
			message:
				'That submission changed while you were looking at it. Reload the page.',
		});
		await expect(
			db()
				.select({ status: cocReport.status })
				.from(cocReport)
				.where(eq(cocReport.id, id)),
		).resolves.toEqual([{ status: 'dismissed' }]);
		await expect(
			db()
				.select({ type: submissionEvent.type })
				.from(submissionEvent)
				.where(eq(submissionEvent.cocReportId, id)),
		).resolves.toHaveLength(1);
	});
});
