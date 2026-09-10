'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { addSubmissionNote } from './actions';

export function SubmissionNoteComposer({
	kind,
	id,
}: {
	kind: string;
	id: string;
}) {
	const router = useRouter();
	const [body, setBody] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [pending, startTransition] = useTransition();

	return (
		<form
			className="mt-2"
			onSubmit={(event) => {
				event.preventDefault();
				startTransition(async () => {
					const result = await addSubmissionNote(kind, id, body);
					if (result.ok) {
						setBody('');
						setError(null);
						router.refresh();
					} else {
						setError(result.message);
					}
				});
			}}
		>
			<label className="form-label small" htmlFor="submission-note">
				Add a note
			</label>
			<textarea
				id="submission-note"
				className="form-control form-control-sm"
				rows={2}
				value={body}
				onChange={(event) => setBody(event.target.value)}
				placeholder="Context for whoever picks this up next"
			/>
			{error && (
				<p className="small text-danger mt-1 mb-0" role="alert">
					{error}
				</p>
			)}
			<div className="text-end mt-2">
				<button
					type="submit"
					className="btn btn-sm btn-outline-primary"
					disabled={pending || body.trim().length === 0}
				>
					{pending ? 'Saving…' : 'Add note'}
				</button>
			</div>
		</form>
	);
}
