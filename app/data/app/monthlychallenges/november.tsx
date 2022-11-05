import { json, redirect } from '@remix-run/node';
import type { ActionArgs } from '@remix-run/node';
import { Form, useTransition } from '@remix-run/react';
import { authenticate } from '~/auth/auth.server';
import { CmsActions } from '~/api/cms.server';

import { TextInput, TextAreaInput, FieldSet } from '~/components/app/Forms';
import { Button } from '~/components/app/Button';
import Alert from '~/components/app/Alert';

export type ActionData = {
	formError?: string;
	fieldErrors?: {
		title: string | undefined;
		shortDescriptionMarkDown?: string | undefined;
		id?: string | undefined;
		urlValue: string | undefined;
		wordCount: string | undefined;
		topics?: string | undefined;
		date: string | undefined;
	};
	fields?: {
		title: string | undefined;
		shortDescriptionMarkDown?: string | undefined;
		id?: string | undefined | null;
		urlValue: string | undefined;
		wordCount: string | undefined;
		topics?: string | undefined;
		date: string | undefined;
	};
};

const badRequest = (data: ActionData) => json(data, { status: 400 });

export const action = async ({ request }: ActionArgs) => {
	const formData = await request.formData();

	const title = formData.get('title');
	const shortDescriptionMarkDown = formData.get('shortDescriptionMarkDown');
	const id = formData.get('id');
	const urlValue = formData.get('urlValue');
	const wordCount = formData.get('wordCount');
	const topics = formData.get('topics');
	const date = formData.get('date');

	if (
		typeof title !== 'string' ||
		typeof shortDescriptionMarkDown !== 'string' ||
		(id && typeof id !== 'string') ||
		typeof urlValue !== 'string' ||
		typeof wordCount !== 'string' ||
		typeof topics !== 'string' ||
		typeof date !== 'string'
	) {
		console.log({
			title: typeof title !== 'string',
			shortDescriptionMarkDown: typeof shortDescriptionMarkDown !== 'string',
			id: id && typeof id !== 'string',
			urlValue: typeof urlValue !== 'string',
			wordCount: typeof wordCount !== 'string',
			topics: typeof topics !== 'string',
			date: typeof date !== 'string',
		});
		return badRequest({
			formError: `Form not submitted correctly.`,
		});
	}

	const parsedWordCount = parseInt(wordCount, 10);

	const fieldErrors = {
		title: title ? undefined : 'Title is required',
		urlValue: urlValue ? undefined : 'URL is required',
		wordCount:
			parsedWordCount && !isNaN(parsedWordCount)
				? undefined
				: 'Word count is required and must be a number',
		date: date ? undefined : 'Date is required',
	};

	const fields = {
		title,
		shortDescriptionMarkDown,
		id,
		urlValue,
		wordCount,
		topics,
		date,
	};
	if (Object.values(fieldErrors).some(Boolean)) {
		return badRequest({ fieldErrors, fields });
	}

	const auth = await authenticate(request);

	if (!auth) {
		throw new Error('Not authenticated');
	}

	let api = new CmsActions();
	await api.authenticate(request);

	await api.saveNovemberChallengeEntry({
		title,
		shortDescriptionMarkDown,
		id,
		urlValue,
		wordCount: parsedWordCount,
		topics,
		date,
	});

	return redirect('/membership/monthly-challenges/november');
};

export const ChallengeForm = ({
	initialValues,
	fieldErrors,
	formError,
}: {
	initialValues?: ActionData['fields'];
	fieldErrors?: ActionData['fieldErrors'];
	formError?: ActionData['formError'];
}) => {
	const transition = useTransition();
	const isCreating = Boolean(transition.submission);
	console.log(initialValues?.date);
	return (
		<div className="mt-8">
			<Form method="post" className="space-y-6">
				{formError && (
					<Alert title="Form Error" type="danger">
						{formError}
					</Alert>
				)}
				<FieldSet legend="Add a new article">
					{initialValues?.id && (
						<input type="hidden" name="id" value={initialValues.id} />
					)}
					<TextInput
						label="Title"
						id="title"
						required
						defaultValue={initialValues?.title}
						errorMessage={fieldErrors?.title}
					/>
					<TextInput
						label="URL"
						id="urlValue"
						type="url"
						required
						defaultValue={initialValues?.urlValue}
						errorMessage={fieldErrors?.urlValue}
					/>
					<TextInput
						label="Post Date"
						id="date"
						type="date"
						required
						defaultValue={initialValues?.date}
						errorMessage={fieldErrors?.date}
					/>
					<TextInput
						label="Word Count"
						id="wordCount"
						type="number"
						required
						defaultValue={initialValues?.wordCount}
						errorMessage={fieldErrors?.wordCount}
					/>
					<TextInput
						label="Topics"
						id="topics"
						defaultValue={initialValues?.urlValue}
						errorMessage={fieldErrors?.urlValue}
					/>
					<TextAreaInput
						label="Short Description"
						id="shortDescriptionMarkDown"
						defaultValue={initialValues?.urlValue}
						errorMessage={fieldErrors?.urlValue}
					/>
					<div className="flex justify-end">
						<Button size="lg" type="submit" disabled={isCreating}>
							{isCreating ? 'Saving...' : 'Submit'}
						</Button>
					</div>
				</FieldSet>
			</Form>
		</div>
	);
};
