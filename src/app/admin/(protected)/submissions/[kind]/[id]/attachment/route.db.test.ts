import { beforeEach, describe, expect, test } from 'vitest';

import { cocReport, db } from '@/db';
import { NOT_FOUND } from '@/test/next';
import { signInAs } from '@/test/session';
import { readAttachment } from '@/test/mocks/spies';

import { GET } from './route';

async function insertReport(fields: {
	attachmentBlobKey?: string;
	attachmentContentType?: string;
}) {
	const [row] = await db()
		.insert(cocReport)
		.values({
			reporteeName: 'Someone',
			timeLocation: 'Slack',
			description: 'x',
			attachmentFilename: 'evidence.png',
			...fields,
		})
		.returning({ id: cocReport.id });
	return row.id;
}

const get = (kind: string, id: string) =>
	GET(new Request('http://localhost/'), {
		params: Promise.resolve({ kind, id }),
	});

describe('GET /admin/submissions/coc/[id]/attachment', () => {
	beforeEach(async () => {
		await signInAs('coc_reviewer');
		readAttachment.mockReset();
	});

	test('serves the bytes as a download the browser may not sniff or cache', async () => {
		const id = await insertReport({
			attachmentBlobKey: 'k1',
			attachmentContentType: 'image/png',
		});
		readAttachment.mockResolvedValue({
			body: new Uint8Array([1, 2, 3]).buffer,
			metadata: {},
		});

		const response = await get('coc', id);

		expect(readAttachment).toHaveBeenCalledWith('k1');
		expect(Object.fromEntries(response.headers)).toEqual({
			'content-type': 'image/png',
			'content-disposition': 'attachment; filename="evidence.png"',
			'x-content-type-options': 'nosniff',
			'cache-control': 'private, no-store',
		});
		expect(new Uint8Array(await response.arrayBuffer())).toEqual(
			new Uint8Array([1, 2, 3]),
		);
	});

	test('a report without an attachment is a 404, not a store read', async () => {
		const id = await insertReport({});
		await expect(get('coc', id)).rejects.toMatchObject(NOT_FOUND);
		expect(readAttachment).not.toHaveBeenCalled();
	});

	test('only CoC reports have attachments', async () => {
		await expect(
			get('lunch-and-learn', '0199404c-2c5e-7000-8000-000000000000'),
		).rejects.toMatchObject(NOT_FOUND);
	});
});
