'use client';

import type { ReactNode } from 'react';

import type { useModalDialog } from '@/util/useModalDialog';

/**
 * The chrome every `/admin` confirmation shares — title with a close button,
 * a body, Cancel beside the primary action — around a `useModalDialog`. The
 * hook call stays with the caller, whose reset-on-close is its own; `confirm`
 * is the caller's button because its label, colour and type differ each time.
 *
 * With `onSubmit` the whole dialog is a form, so Enter in a field confirms.
 */
export function AdminDialog({
	dialog,
	title,
	pending,
	onCancel,
	onSubmit,
	confirm,
	children,
}: {
	dialog: ReturnType<typeof useModalDialog>;
	title: ReactNode;
	pending: boolean;
	onCancel: () => void;
	onSubmit?: () => void;
	confirm: ReactNode;
	children: ReactNode;
}) {
	const body = (
		<>
			<div className="p-3 border-bottom d-flex justify-content-between align-items-start gap-3">
				<h2 className="h5 mb-0">{title}</h2>
				<button
					type="button"
					className="btn-close"
					aria-label="Close"
					onClick={onCancel}
					disabled={pending}
				/>
			</div>

			<div className="p-3">{children}</div>

			<div className="p-3 border-top d-flex justify-content-end gap-2">
				<button
					type="button"
					className="btn btn-outline-secondary"
					onClick={onCancel}
					disabled={pending}
				>
					Cancel
				</button>
				{confirm}
			</div>
		</>
	);

	return (
		<dialog {...dialog} className="admin-dialog">
			{onSubmit ? (
				<form
					onSubmit={(submit) => {
						submit.preventDefault();
						onSubmit();
					}}
				>
					{body}
				</form>
			) : (
				body
			)}
		</dialog>
	);
}
