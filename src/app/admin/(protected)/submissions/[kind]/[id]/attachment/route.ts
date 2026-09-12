import { notFound } from 'next/navigation';

import { isId } from '@/db/ids';
import { readAttachment } from '@/lib/attachments';
import { requirePermission } from '@/lib/adminAccess';
import { getSubmission } from '@/lib/submissions';

/**
 * Serves a CoC report's attachment after checking `coc:read`.
 *
 * Netlify Blobs are not publicly addressable, and this is the only way to read
 * one back — so an attachment is exactly as restricted as the report it belongs
 * to. `Content-Disposition: attachment` stops an uploaded SVG or HTML file
 * being rendered in the admin origin; the stored type is always an image or a
 * PDF, but serving user-supplied bytes inline is not worth the risk.
 */
export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ kind: string; id: string }> },
) {
	const { kind, id } = await params;

	// Only CoC reports have attachments.
	if (kind !== 'coc') notFound();

	await requirePermission('coc', 'read');

	if (!isId(id)) notFound();

	const report = await getSubmission('coc', id);
	const key = report?.attachmentBlobKey as string | null | undefined;

	if (!key) notFound();

	const stored = await readAttachment(key);
	if (!stored) notFound();

	const filename =
		(report?.attachmentFilename as string | null) ??
		(stored.metadata.filename as string | undefined) ??
		'attachment';

	const contentType =
		(report?.attachmentContentType as string | null) ??
		(stored.metadata.contentType as string | undefined) ??
		'application/octet-stream';

	return new Response(stored.body, {
		headers: {
			'content-type': contentType,
			'content-disposition': `attachment; filename="${filename.replace(/"/g, '')}"`,
			// Never let a shared cache hold a CoC attachment.
			'cache-control': 'private, no-store',
		},
	});
}
