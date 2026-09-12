import { eq } from 'drizzle-orm';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { cocReport, db, submissionEvent } from '@/db';
import { signInAs } from '@/test/session';

/** Stages a read that is stale by the time the action writes. */
const staleRead = vi.hoisted(() => ({ readAs: null as string | null }));
vi.mock('@/lib/submissions', async (importOriginal) => {
	const actual = await importOriginal<typeof import('@/lib/submissions')>();
	return {
		...actual,
		getSubmission: async (...args: Parameters<typeof actual.getSubmission>) => {
			const row = await actual.getSubmission(...args);
			return row && staleRead.readAs
				? { ...row, status: staleRead.readAs }
				: row;
		},
	};
});

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
	beforeEach(() => {
		staleRead.readAs = null;
		signInAs('coc_reviewer');
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
