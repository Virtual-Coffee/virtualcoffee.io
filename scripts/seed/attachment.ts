import { ATTACHMENT } from './shared';

/** The blob store surface the seed needs; `getStore()` satisfies it. */
export type AttachmentStore = {
	set(
		key: string,
		data: ArrayBuffer,
		options: { metadata: Record<string, string> },
	): Promise<unknown>;
};

/**
 * A 1×1 transparent PNG — the smallest file that passes `sniff()` in
 * `src/lib/attachments.ts` and that a browser will open when the
 * attachment link is followed.
 */
export const SEED_PNG = Uint8Array.from(
	Buffer.from(
		'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
		'base64',
	),
);

/**
 * Write the seeded CoC report's attachment under the key its row names,
 * with the metadata `readAttachment()` serves it with.
 */
export async function writeAttachment(store: AttachmentStore) {
	await store.set(ATTACHMENT.key, SEED_PNG.buffer as ArrayBuffer, {
		metadata: {
			filename: ATTACHMENT.filename,
			contentType: ATTACHMENT.contentType,
		},
	});
}
