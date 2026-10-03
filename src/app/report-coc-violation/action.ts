'use server';

import { redirect } from 'next/navigation';

import {
	discardAttachment,
	storeAttachment,
	type StoredAttachment,
} from '@/lib/submissions/attachments';
import { cocSchema } from '@/lib/submissions/formSchemas';
import { submit } from '@/lib/submissions/submitSubmission';
import { intake } from '@/util/forms/intake';
import { invalidFields } from '@/util/forms/parse';
import type { FormState } from '@/util/forms/types';

const THANKS = '/report-coc-violation/thanks';

export async function submitCocReport(
	_state: FormState,
	formData: FormData,
): Promise<FormState> {
	// A stale token is a person who wrote this slowly, and a CoC report is the
	// last thing to lose that way.
	const parsed = intake(formData, { schema: cocSchema, thanks: THANKS });
	if (!parsed.ok) return parsed.state;

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

	const saved = await submit('coc', parsed.data, {
		extra: {
			attachmentBlobKey: attachment?.key ?? null,
			attachmentFilename: attachment?.filename ?? null,
			attachmentContentType: attachment?.contentType ?? null,
			attachmentSize: attachment?.size ?? null,
		},
		// Nothing points at the blob now, and a retry stores its own copy.
		onFailed: async () => {
			if (attachment) await discardAttachment(attachment.key);
		},
	});
	if ('error' in saved) return saved.error;

	redirect(THANKS);
}
