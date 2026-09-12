import { describe, expect, test } from 'vitest';

import { fieldErrors, formDataWith, staleFormState } from '@/test/forms';
import { redirectTo } from '@/test/next';

import { submitCocReport } from './action';

const valid = {
	reportee_name: 'Someone',
	time_location: 'Tuesday coffee',
	description: 'What happened.',
	agree: 'agree',
};

const submit = (formData: FormData) => submitCocReport(null, formData);

describe('submitCocReport', () => {
	test('a bot sees the thanks page', async () => {
		await expect(
			submit(formDataWith(valid, { spam: true })),
		).rejects.toMatchObject(redirectTo('/report-coc-violation/thanks'));
	});

	test('a form left open too long is asked to submit again, not thanked', async () => {
		// Returned before anything is validated or written, so no database is
		// needed to prove nothing was saved.
		await expect(submit(formDataWith(valid, { stale: true }))).resolves.toEqual(
			staleFormState(),
		);
	});

	test('name and email are optional — anonymous reports are the point', async () => {
		// Nothing is written without a database; a valid form goes on to the
		// insert and fails there, which is not what this asserts. So: prove the
		// optional fields are optional by leaving them out and checking that the
		// *other* errors are the only ones.
		const result = await submit(formDataWith({ ...valid, description: '' }));
		expect(result).toEqual(
			fieldErrors({ description: 'Please describe what happened.' }),
		);
	});

	test('an email, when given, has to be one', async () => {
		await expect(
			submit(formDataWith({ ...valid, email: 'not-an-email' })),
		).resolves.toEqual(
			fieldErrors({ email: 'That doesn’t look like an email address.' }),
		);
	});

	test('the required fields', async () => {
		await expect(submit(formDataWith({}))).resolves.toEqual(
			fieldErrors({
				reportee_name: 'Please tell us who you’re reporting.',
				time_location: 'Please tell us roughly when and where.',
				description: 'Please describe what happened.',
				agree: 'Please confirm you’ve read the Code of Conduct.',
			}),
		);
	});

	test('a rejected upload is a form error, not a half-saved report', async () => {
		const upload = new File(['plain text'], 'evidence.png', {
			type: 'image/png',
		});
		await expect(
			submit(formDataWith({ ...valid, uploadedFiles: upload })),
		).resolves.toEqual(
			fieldErrors({
				uploadedFiles:
					'Attachments must be an image (PNG, JPEG, GIF, WebP) or a PDF.',
			}),
		);
	});
});
