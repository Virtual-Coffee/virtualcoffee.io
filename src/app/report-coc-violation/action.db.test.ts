import { eq } from 'drizzle-orm';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { cocReport, db, submissionEvent } from '@/db';
import { failedNotifications } from '@/lib/submissions';
import { failInserts } from '@/test/db/fixtures';
import { fieldErrors, formDataWith } from '@/test/forms';
import { redirectTo } from '@/test/next';

const notifySlack = vi.hoisted(() => vi.fn());
vi.mock('@/lib/slack/notify', async (importOriginal) => ({
	...(await importOriginal<typeof import('@/lib/slack/notify')>()),
	notifySlack,
}));

const blobs = vi.hoisted(() => ({ set: vi.fn(), delete: vi.fn() }));
vi.mock('@netlify/blobs', () => ({ getStore: () => blobs }));

import { submitCocReport } from './action';

const valid = {
	reportee_name: 'Someone',
	time_location: 'Tuesday coffee',
	description: 'What happened.',
	agree: 'agree',
};

async function submit(fields: Record<string, string | File>) {
	await expect(
		submitCocReport(null, formDataWith(fields)),
	).rejects.toMatchObject(redirectTo('/report-coc-violation/thanks'));
	const [row] = await db().select().from(cocReport);
	const events = await db()
		.select({ type: submissionEvent.type, body: submissionEvent.body })
		.from(submissionEvent)
		.where(eq(submissionEvent.cocReportId, row.id))
		.orderBy(submissionEvent.createdAt);
	return { row, events };
}

beforeEach(() => {
	notifySlack.mockReset();
	blobs.set.mockReset();
	blobs.delete.mockReset();
});

describe('submitCocReport', () => {
	test('an anonymous report is stored with no name or email, and announced', async () => {
		notifySlack.mockResolvedValue({ ok: true, message: 'Posted to Slack.' });

		const { row, events } = await submit(valid);

		expect(row).toMatchObject({
			name: null,
			email: null,
			reporteeName: 'Someone',
			status: 'new',
			attachmentBlobKey: null,
		});
		expect(row.reference).toBe(1);
		expect(events).toEqual([
			{ type: 'submitted', body: 'Report submitted' },
			{ type: 'notification_sent', body: 'Posted to Slack.' },
		]);
		expect(notifySlack).toHaveBeenCalledWith(
			'coc',
			expect.stringContaining('*Name:* (anonymous)'),
		);
	});

	/**
	 * ADR 0005: persist first, notify second. A Slack outage must never lose a
	 * report — the reporter still sees thanks, and /admin shows the failure.
	 */
	test('a Slack failure keeps the report and is visible in /admin', async () => {
		notifySlack.mockResolvedValue({
			ok: false,
			message: 'Slack rejected the message (404: no_service).',
		});

		const { row, events } = await submit(valid);

		expect(row.status).toBe('new');
		expect(events).toEqual([
			{ type: 'submitted', body: 'Report submitted' },
			{
				type: 'notification_failed',
				body: 'Slack rejected the message (404: no_service).',
			},
		]);
		await expect(failedNotifications(['coc'])).resolves.toEqual({ coc: 1 });
	});

	test('an attachment is stored before the row, and the row points at it', async () => {
		notifySlack.mockResolvedValue({ ok: true, message: 'Posted to Slack.' });
		const png = new File(
			[new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])],
			'screenshot.png',
			{ type: 'image/png' },
		);

		const { row } = await submit({ ...valid, uploadedFiles: png });

		expect(row).toMatchObject({
			attachmentFilename: 'screenshot.png',
			attachmentContentType: 'image/png',
			attachmentSize: 8,
		});
		expect(blobs.set).toHaveBeenCalledWith(
			row.attachmentBlobKey,
			expect.any(ArrayBuffer),
			expect.anything(),
		);
		expect(notifySlack).toHaveBeenCalledWith(
			'coc',
			expect.stringContaining('A file was attached'),
		);
	});

	/**
	 * The upload is validated and stored before the row is written, so a store
	 * that is down means no half-saved report — the reporter gets a field
	 * error on the file and keeps everything else they typed.
	 */
	test('a blob store failure is a form error that leaves no report behind', async () => {
		const error = vi.spyOn(console, 'error').mockImplementation(() => {});
		blobs.set.mockRejectedValueOnce(new Error('blobs unavailable'));
		const png = new File(
			[new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])],
			'screenshot.png',
			{ type: 'image/png' },
		);

		await expect(
			submitCocReport(null, formDataWith({ ...valid, uploadedFiles: png })),
		).resolves.toEqual(
			fieldErrors({
				uploadedFiles: expect.stringContaining('store the attachment'),
			}),
		);
		error.mockRestore();

		await expect(db().select().from(cocReport)).resolves.toEqual([]);
		expect(notifySlack).not.toHaveBeenCalled();
	});

	/**
	 * The other order of failure: the blob went in, the row did not. The form
	 * error is what the reporter sees; the blob nothing points at is deleted
	 * rather than left holding CoC evidence nobody can reach.
	 */
	test('a row that fails to save takes its stored attachment with it', async () => {
		const png = new File(
			[new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])],
			'screenshot.png',
			{ type: 'image/png' },
		);

		const fault = await failInserts('coc_report');
		try {
			await expect(
				submitCocReport(null, formDataWith({ ...valid, uploadedFiles: png })),
			).resolves.toMatchObject({ is_error: true });
		} finally {
			await fault.remove();
		}

		const [key] = blobs.set.mock.calls[0];
		expect(blobs.delete).toHaveBeenCalledWith(key);
		await expect(db().select().from(cocReport)).resolves.toEqual([]);
		expect(notifySlack).not.toHaveBeenCalled();
	});
});
