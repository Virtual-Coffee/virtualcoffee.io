import { randomUUID } from 'node:crypto';

import { getStore } from '@netlify/blobs';

/**
 * Storage for CoC report attachments.
 *
 * The form's file input had been commented out since the Netlify Forms era with
 * a `TODO: hook up file upload - probably using Netlify Blob`. The four
 * historical attachments in Airtable are rehosted into the same store by
 * `scripts/airtable/importSubmissions.ts`.
 *
 * Files are never served from a public URL — `/admin/submissions/coc/[id]/
 * attachment` reads them back after checking `coc:read`.
 */

export const ATTACHMENT_STORE = 'coc-attachments';

/** A screenshot is the actual use case; a PDF is the plausible second one. */
const ALLOWED = [
	{ type: 'image/png', ext: 'png', magic: [0x89, 0x50, 0x4e, 0x47] },
	{ type: 'image/jpeg', ext: 'jpg', magic: [0xff, 0xd8, 0xff] },
	{ type: 'image/gif', ext: 'gif', magic: [0x47, 0x49, 0x46, 0x38] },
	{ type: 'application/pdf', ext: 'pdf', magic: [0x25, 0x50, 0x44, 0x46] },
	// WebP is RIFF....WEBP; the second marker is checked separately below.
	{ type: 'image/webp', ext: 'webp', magic: [0x52, 0x49, 0x46, 0x46] },
] as const;

export const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;

export type StoredAttachment = {
	key: string;
	filename: string;
	contentType: string;
	size: number;
};

export type AttachmentError = { error: string };

/**
 * Identify a file by its leading bytes rather than its declared type.
 *
 * The browser-supplied `Content-Type` and the filename extension are both
 * attacker-controlled, so neither can decide what gets written to the store.
 */
function sniff(bytes: Uint8Array): (typeof ALLOWED)[number] | null {
	for (const candidate of ALLOWED) {
		if (candidate.magic.every((byte, index) => bytes[index] === byte)) {
			if (candidate.type === 'image/webp') {
				// "WEBP" at offset 8, or it is some other RIFF container.
				const webp = [0x57, 0x45, 0x42, 0x50];
				if (!webp.every((byte, index) => bytes[8 + index] === byte)) continue;
			}
			return candidate;
		}
	}
	return null;
}

/** Keep the reporter's filename recognisable without letting it name the blob. */
function safeFilename(name: string, ext: string): string {
	const base = name
		.replace(/\.[^.]*$/, '')
		.replace(/[^a-zA-Z0-9 ._-]/g, '')
		.trim()
		.slice(0, 80);
	return `${base || 'attachment'}.${ext}`;
}

export async function storeAttachment(
	file: File,
): Promise<StoredAttachment | AttachmentError> {
	if (file.size === 0) {
		return { error: 'That file is empty.' };
	}

	if (file.size > MAX_ATTACHMENT_BYTES) {
		return { error: 'Files must be 10MB or smaller.' };
	}

	const bytes = await file.arrayBuffer();
	const buffer = new Uint8Array(bytes);
	const kind = sniff(buffer);

	if (!kind) {
		return {
			error: 'Attachments must be an image (PNG, JPEG, GIF, WebP) or a PDF.',
		};
	}

	// A random key, so nothing about the reporter or the filename is guessable
	// from the blob name.
	const key = randomUUID();

	await getStore(ATTACHMENT_STORE).set(key, bytes, {
		metadata: {
			filename: safeFilename(file.name, kind.ext),
			contentType: kind.type,
		},
	});

	return {
		key,
		filename: safeFilename(file.name, kind.ext),
		contentType: kind.type,
		size: file.size,
	};
}

/**
 * Drop a stored attachment whose report never got written. Best-effort: the
 * report has already failed, and an orphaned blob is a leak to note, not a
 * reason to hide the form error behind a second one.
 */
export async function discardAttachment(key: string): Promise<void> {
	try {
		await getStore(ATTACHMENT_STORE).delete(key);
	} catch (error) {
		console.error('Orphaned CoC attachment could not be deleted', {
			key,
			error,
		});
	}
}

export async function readAttachment(
	key: string,
): Promise<{ body: ArrayBuffer; metadata: Record<string, unknown> } | null> {
	const result = await getStore(ATTACHMENT_STORE).getWithMetadata(key, {
		type: 'arrayBuffer',
	});

	if (!result) return null;

	return { body: result.data, metadata: result.metadata };
}
