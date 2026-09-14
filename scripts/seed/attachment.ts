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
 * Where the seeded attachment's bytes come from. The CLI fetches a
 * placeholder image; the db test passes bytes of its own; nothing else.
 */
export type AttachmentBytes = Uint8Array;

/**
 * The placeholder served when the CoC attachment link is followed: a real
 * 640×480 PNG from placehold.co, labelled so nobody mistakes it for a
 * screenshot someone actually sent. Fixed dimensions and text, so every run
 * stores the same file.
 */
export const PLACEHOLDER_URL =
	'https://placehold.co/640x480.png?text=Seeded+CoC+attachment';

/**
 * A 1×1 transparent PNG: the smallest file that passes `sniff()` in
 * `src/lib/attachments.ts`. What the row points at when the placeholder
 * cannot be fetched (offline, or the service is down), and what the db test
 * writes, since it never touches the network.
 */
export const FALLBACK_PNG: AttachmentBytes = Uint8Array.from(
	Buffer.from(
		'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
		'base64',
	),
);

/** Fetch the placeholder, or fall back to the 1×1 PNG with a warning. */
export async function fetchPlaceholder(): Promise<AttachmentBytes> {
	try {
		const response = await fetch(PLACEHOLDER_URL, {
			signal: AbortSignal.timeout(10_000),
		});
		if (!response.ok) throw new Error(`${response.status} from placehold.co`);
		return new Uint8Array(await response.arrayBuffer());
	} catch (error) {
		console.warn(
			`Could not fetch the placeholder attachment (${error instanceof Error ? error.message : String(error)}); using a 1×1 PNG.`,
		);
		return FALLBACK_PNG;
	}
}

/**
 * Write the seeded CoC report's attachment under the key its row names,
 * with the metadata `readAttachment()` serves it with.
 */
export async function writeAttachment(
	store: AttachmentStore,
	bytes: AttachmentBytes,
) {
	await store.set(
		ATTACHMENT.key,
		bytes.buffer.slice(
			bytes.byteOffset,
			bytes.byteOffset + bytes.byteLength,
		) as ArrayBuffer,
		{
			metadata: {
				filename: ATTACHMENT.filename,
				contentType: ATTACHMENT.contentType,
			},
		},
	);
}
