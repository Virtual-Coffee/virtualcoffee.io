import { eq } from 'drizzle-orm';
import { beforeEach, describe, expect, test } from 'vitest';

import { cocReport, db, submissionEvent } from '@/db';
import { signInAs } from '@/test/session';

import { addSubmissionNote } from './actions';

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
