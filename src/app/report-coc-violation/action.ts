'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';

import { cocReport, db } from '@/db';
import { storeAttachment, type StoredAttachment } from '@/lib/attachments';
import { cocReportMessage, notifySlack } from '@/lib/slack/notify';
import { notifyAndRecord, recordSubmissionEvent } from '@/lib/submitSubmission';
import { formValue, fieldErrorsFrom } from '@/util/forms/parse';
import { looksLikeSpam } from '@/util/forms/spamGuard';
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
	// Dropped silently, and deliberately reported back as success: telling a bot
	// which check caught it only helps it try again.
	if (looksLikeSpam(formData)) {
		redirect('/report-coc-violation/thanks');
	}

	const parsed = schema.safeParse({
		name: formValue(formData, 'name'),
		email: formValue(formData, 'email'),
		reportee_name: formData.get('reportee_name') ?? '',
		time_location: formData.get('time_location') ?? '',
		description: formData.get('description') ?? '',
		anyone_else_involved: formValue(formData, 'anyone_else_involved'),
		agree: formData.get('agree') ?? '',
	});

	if (!parsed.success) {
		return {
			is_error: true,
			message: 'Please check the highlighted fields.',
			fieldErrors: fieldErrorsFrom(parsed.error),
		};
	}

	// The upload is validated before the row is written, so a rejected file is a
	// form error the reporter can fix rather than a half-saved report.
	const upload = formData.get('uploadedFiles');
	let attachment: StoredAttachment | null = null;

	if (upload instanceof File && upload.size > 0) {
		const result = await storeAttachment(upload);

		if ('error' in result) {
			return {
				is_error: true,
				message: 'Please check the highlighted fields.',
				fieldErrors: { uploadedFiles: result.error },
			};
		}

		attachment = result;
	}

	let reportId: string;

	try {
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

		reportId = row.id;

		await recordSubmissionEvent({
			kind: 'coc',
			submissionId: reportId,
			type: 'submitted',
			body: 'Report submitted',
		});
	} catch (error) {
		// Deliberately not surfaced: the upstream message can name tables and
		// columns, and there is nothing the reporter could do with it.
		console.error('CoC report failed to save', error);
		return {
			is_error: true,
			message:
				'Something went wrong saving your report. Please try again, or email hello@virtualcoffee.io.',
		};
	}

	await notifyAndRecord('coc', reportId, async () => {
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
