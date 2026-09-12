'use client';

import { useState } from 'react';

import type { ActionResult } from '@/lib/actionResult';
import { MAX_NOTE_LENGTH } from '@/lib/notes';
import { useAction } from '@/util/forms/useAction';

/** A note on a detail screen; `onSubmit` is the section's own action, bound to its row. */
export function NoteComposer({
	onSubmit,
}: {
	onSubmit: (body: string) => Promise<ActionResult>;
}) {
	const [body, setBody] = useState('');
	const { run, pending, error } = useAction();

	return (
		<form
			className="mt-2"
			onSubmit={(event) => {
				event.preventDefault();
				run(() => onSubmit(body), { onSuccess: () => setBody('') });
			}}
		>
			<label className="form-label small" htmlFor="note">
				Add a note
			</label>
			<textarea
				id="note"
				className="form-control form-control-sm"
				rows={2}
				maxLength={MAX_NOTE_LENGTH}
				value={body}
				onChange={(event) => setBody(event.target.value)}
				placeholder="Context for whoever picks this up next"
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
