'use client';

import { useId, useState } from 'react';

import { MAX_NOTE_LENGTH } from '@/lib/notes';
import { useModalDialog } from '@/util/useModalDialog';

const COPY = {
	decline: {
		title: 'Decline application',
		confirm: 'Decline',
		outcome: 'declined',
	},
	withdraw: {
		title: 'Mark withdrawn',
		confirm: 'Mark withdrawn',
		outcome: 'marked withdrawn',
	},
} as const;

/**
 * Confirms the two terminal closes. Neither sends anything — the emailing
 * actions have `ConfirmSendDialog` — but neither can be undone either, and
 * a one-click button was an accident waiting to happen. The optional note
 * lands on the close event itself, so the reason is on the same History
 * line as the decision rather than a separate note someone may not leave.
 */
export function CloseDialog({
	open,
	verb,
	applicantName,
	pending,
	onCancel,
	onConfirm,
}: {
	open: boolean;
	verb: keyof typeof COPY;
	applicantName: string;
	pending: boolean;
	onCancel: () => void;
	onConfirm: (note: string) => void;
}) {
	const [note, setNote] = useState('');
	const noteId = useId();
	const copy = COPY[verb];

	// Every close resets the draft, so a note typed for one decision cannot
	// carry over to the next. Same locking as ConfirmSendDialog: nothing
	// dismisses this while the action is in flight.
	const dialog = useModalDialog(
		open,
		() => {
			setNote('');
			if (!pending) onCancel();
		},
		pending,
	);

	return (
		<dialog {...dialog} className="admin-dialog">
			<div className="p-3 border-bottom d-flex justify-content-between align-items-start gap-3">
				<h2 className="h5 mb-0">{copy.title}</h2>
				<button
					type="button"
					className="btn-close"
					aria-label="Close"
					onClick={onCancel}
					disabled={pending}
				/>
			</div>

			<div className="p-3">
				<p>
					{applicantName} will be <strong>{copy.outcome}</strong> and moved to
					the archive. This can&rsquo;t be undone; they would have to apply
					again.
				</p>
				<label className="form-label small" htmlFor={noteId}>
					Why? <span className="text-body-secondary">(optional)</span>
				</label>
				<textarea
					id={noteId}
					className="form-control form-control-sm"
					rows={3}
					maxLength={MAX_NOTE_LENGTH}
					value={note}
					onChange={(event) => setNote(event.target.value)}
					placeholder="Recorded in the history alongside the decision"
				/>
			</div>

			<div className="p-3 border-top d-flex justify-content-end gap-2">
				<button
					type="button"
					className="btn btn-outline-secondary"
					onClick={onCancel}
					disabled={pending}
				>
					Cancel
				</button>
				<button
					type="button"
					className="btn btn-danger"
					onClick={() => onConfirm(note)}
					disabled={pending}
				>
					{pending ? 'Working…' : copy.confirm}
				</button>
			</div>
		</dialog>
	);
}
