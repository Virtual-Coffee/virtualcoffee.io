'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';

import { cocReport, db } from '@/db';
import {
	discardAttachment,
	storeAttachment,
	type StoredAttachment,
} from '@/lib/attachments';
import { cocReportMessage, notifySlack } from '@/lib/slack/notify';
import { notifyAndRecord, persistSubmission } from '@/lib/submitSubmission';
import { formObject, invalidFields, staleForm } from '@/util/forms/parse';
import { checkSpam } from '@/util/forms/spamGuard';
import type { FormState } from '@/util/forms/types';

/**
 * Name and email are optional by design: the form tells reporters to skip both
 * if they want to remain anonymous, and some historical reports did.
 */
const schema = z.object({
	name: z.string().trim().max(200).optional(),
	email: z
		.email('That doesn’t look like an email address.')
		.max(320)
		.optional(),
	reportee_name: z
		.string()
		.trim()
		.min(1, 'Please tell us who you’re reporting.')
		.max(200),
	time_location: z
		.string()
		.trim()
		.min(1, 'Please tell us roughly when and where.')
		.max(2000),
	description: z
		.string()
		.trim()
		.min(1, 'Please describe what happened.')
		.max(10000),
	anyone_else_involved: z.string().trim().max(5000).optional(),
	agree: z.literal('agree', {
		message: 'Please confirm you’ve read the Code of Conduct.',
	}),
});

export async function submitCocReport(
	_state: FormState,
	formData: FormData,
): Promise<FormState> {
	// A bot is dropped silently and deliberately shown success: telling it which
	// check caught it only helps it try again. A stale token is a person who
	// wrote this slowly, and a CoC report is the last thing to lose that way.
	const guard = checkSpam(formData);
	if (guard === 'stale') return staleForm();
	if (guard !== 'ok') redirect('/report-coc-violation/thanks');

	const parsed = schema.safeParse(formObject(formData, schema));

	if (!parsed.success) {
		return invalidFields(parsed.error);
	}

	// The upload is validated before the row is written, so a rejected file is a
	// form error the reporter can fix rather than a half-saved report.
	const upload = formData.get('uploadedFiles');
	let attachment: StoredAttachment | null = null;

	if (upload instanceof File && upload.size > 0) {
		const result = await storeAttachment(upload);

		if ('error' in result) {
			return invalidFields({ uploadedFiles: result.error });
		}

		attachment = result;
	}

	const saved = await persistSubmission(
		'coc',
		async () => {
			const [row] = await db()
				.insert(cocReport)
				.values({
					name: parsed.data.name ?? null,
					email: parsed.data.email ?? null,
					reporteeName: parsed.data.reportee_name,
					timeLocation: parsed.data.time_location,
					description: parsed.data.description,
					anyoneElseInvolved: parsed.data.anyone_else_involved ?? null,
					attachmentBlobKey: attachment?.key ?? null,
					attachmentFilename: attachment?.filename ?? null,
					attachmentContentType: attachment?.contentType ?? null,
					attachmentSize: attachment?.size ?? null,
				})
				.returning({ id: cocReport.id });
			return row;
		},
		{
			submitted: 'Report submitted',
			failed:
				'Something went wrong saving your report. Please try again, or email hello@virtualcoffee.io.',
		},
	);
	if ('error' in saved) {
		// Nothing points at the blob now, and a retry stores its own copy.
		if (attachment) await discardAttachment(attachment.key);
		return saved.error;
	}

	await notifyAndRecord('coc', saved.id, async () => {
		return notifySlack(
			'coc',
			cocReportMessage({
				name: parsed.data.name ?? null,
				email: parsed.data.email ?? null,
				reporteeName: parsed.data.reportee_name,
				timeLocation: parsed.data.time_location,
				description: parsed.data.description,
				anyoneElseInvolved: parsed.data.anyone_else_involved ?? null,
				hasAttachment: attachment !== null,
			}),
		);
	});

	redirect('/report-coc-violation/thanks');
}
