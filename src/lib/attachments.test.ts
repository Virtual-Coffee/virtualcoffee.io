import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { z } from 'zod';

const blobs = vi.hoisted(() => {
	const set = vi.fn();
	const getStore = vi.fn(() => ({ set }));
	return { set, getStore };
});

vi.mock('@netlify/blobs', () => ({ getStore: blobs.getStore }));

import { MAX_ATTACHMENT_BYTES, storeAttachment } from './attachments';

const PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const JPEG = [0xff, 0xd8, 0xff, 0xe0];
const GIF = [0x47, 0x49, 0x46, 0x38, 0x39, 0x61];
const PDF = [0x25, 0x50, 0x44, 0x46, 0x2d];
const RIFF = [0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0];
const WEBP = [...RIFF, 0x57, 0x45, 0x42, 0x50];
const WAVE = [...RIFF, 0x57, 0x41, 0x56, 0x45];

function file(bytes: number[] | string, name: string, type: string): File {
	const body = typeof bytes === 'string' ? bytes : new Uint8Array(bytes);
	return new File([body], name, { type });
}

beforeEach(() => {
	blobs.set.mockReset();
	blobs.getStore.mockClear();
});

afterEach(() => vi.unstubAllEnvs());

describe('storeAttachment rejects before touching the store', () => {
	test.each([
		['an empty file', file([], 'a.png', 'image/png'), 'That file is empty.'],
		[
			'a file over the limit',
			{ name: 'big.png', size: MAX_ATTACHMENT_BYTES + 1 } as File,
			'Files must be 10MB or smaller.',
		],
		[
			'text declared as PNG',
			file('hello', 'a.png', 'image/png'),
			'Attachments must be an image (PNG, JPEG, GIF, WebP) or a PDF.',
		],
		[
			'a RIFF container that is not WebP',
			file(WAVE, 'a.webp', 'image/webp'),
			'Attachments must be an image (PNG, JPEG, GIF, WebP) or a PDF.',
		],
	])('%s', async (_label, upload, error) => {
		await expect(storeAttachment(upload)).resolves.toEqual({ error });
		expect(blobs.getStore).not.toHaveBeenCalled();
	});
});

describe('storeAttachment accepts by leading bytes, not by declaration', () => {
	test.each([
		[PNG, 'shot.PNG', 'image/png', 'shot.png'],
		[JPEG, 'photo.jpeg', 'image/jpeg', 'photo.jpg'],
		[GIF, 'anim.gif', 'image/gif', 'anim.gif'],
		[PDF, 'report.pdf', 'application/pdf', 'report.pdf'],
		[WEBP, 'pic.webp', 'image/webp', 'pic.webp'],
	])('%j → %s', async (bytes, name, contentType, filename) => {
		// Declared as something else entirely; the bytes decide.
		const result = await storeAttachment(file(bytes, name, 'text/plain'));
		expect(result).toEqual({
			key: expect.schemaMatching(z.uuid()),
			filename,
			contentType,
			size: bytes.length,
		});
		expect(blobs.getStore).toHaveBeenCalledWith('coc-attachments');
		expect(blobs.set).toHaveBeenCalledWith(
			(result as { key: string }).key,
			expect.any(ArrayBuffer),
			{ metadata: { filename, contentType } },
		);
	});

	test('the filename is sanitised and its extension comes from the sniff', async () => {
		// Separators and markup go; dots, spaces and dashes are kept. The blob
		// key is random, so the name only ever labels the download.
		const result = await storeAttachment(
			file(PNG, 'a/b\\c pass wd<script>.exe', 'x'),
		);
		expect(result).toMatchObject({ filename: 'abc pass wdscript.png' });

		const long = await storeAttachment(
			file(PNG, `${'x'.repeat(100)}.png`, 'x'),
		);
		expect(long).toMatchObject({ filename: `${'x'.repeat(80)}.png` });

		const blank = await storeAttachment(file(PNG, '¡¡¡.png', 'x'));
		expect(blank).toMatchObject({ filename: 'attachment.png' });
	});

	test('two uploads of the same file get different keys', async () => {
		const a = await storeAttachment(file(PNG, 'a.png', 'x'));
		const b = await storeAttachment(file(PNG, 'a.png', 'x'));
		expect((a as { key: string }).key).not.toBe((b as { key: string }).key);
	});
});
