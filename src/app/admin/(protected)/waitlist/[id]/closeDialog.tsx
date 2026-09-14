'use client';

import { useId, useState } from 'react';

import { AdminDialog } from '@/components/AdminDialog';
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
		<AdminDialog
			dialog={dialog}
			title={copy.title}
			pending={pending}
			onCancel={onCancel}
			confirm={
				<button
					type="button"
					className="btn btn-danger"
					onClick={() => onConfirm(note)}
					disabled={pending}
				>
					{pending ? 'Working…' : copy.confirm}
				</button>
			}
		>
			<p>
				{applicantName} will be <strong>{copy.outcome}</strong> and moved to the
				archive. This can&rsquo;t be undone; they would have to apply again.
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
		</AdminDialog>
	);
}
