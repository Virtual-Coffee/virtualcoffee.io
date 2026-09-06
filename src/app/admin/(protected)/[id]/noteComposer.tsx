'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { addNote } from '../actions';

export function NoteComposer({ applicationId }: { applicationId: number }) {
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
					const result = await addNote(applicationId, body);
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
			<label className="form-label small" htmlFor="note">
				Add a note
			</label>
			<textarea
				id="note"
				className="form-control form-control-sm"
				rows={2}
				value={body}
				onChange={(event) => setBody(event.target.value)}
				placeholder="Context for whoever reviews this next"
			/>
			{error && (
				<p className="text-danger small mt-1 mb-0" role="alert">
					{error}
				</p>
			)}
			<button
				type="submit"
				className="btn btn-sm btn-outline-secondary mt-2"
				disabled={pending || !body.trim()}
			>
				{pending ? 'Saving…' : 'Add note'}
			</button>
		</form>
	);
}
