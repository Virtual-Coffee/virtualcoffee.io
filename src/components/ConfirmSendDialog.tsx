'use client';

import { useState, type ReactNode } from 'react';

import { useModalDialog } from '@/util/useModalDialog';

/**
 * Shows the actual email that is about to go out, rather than asking "are you
 * sure?". The recipient address is repeated above the body because sending to
 * the wrong person is the mistake this dialog exists to catch.
 *
 * `offerCopy` adds a "Copy me" checkbox; the admin screens want it, the
 * Volunteer's own invites do not.
 */
export function ConfirmSendDialog({
	open,
	title,
	intro,
	to,
	emails,
	confirmLabel,
	pending,
	offerCopy = false,
	onCancel,
	onConfirm,
}: {
	open: boolean;
	title: string;
	intro: ReactNode;
	to: string;
	emails: { subject: string; text: string }[];
	confirmLabel: string;
	pending: boolean;
	offerCopy?: boolean;
	onCancel: () => void;
	onConfirm: (copyMe: boolean) => void;
}) {
	const [copyMe, setCopyMe] = useState(false);
	// A click on the backdrop cancels, which is the safe direction: nothing is
	// sent, and the dialog is reopened by the same button that opened it.
	const dialog = useModalDialog(open, onCancel);

	return (
		<dialog {...dialog} className="admin-dialog">
			<div className="p-3 border-bottom d-flex justify-content-between align-items-start gap-3">
				<h2 className="h5 mb-0">{title}</h2>
				<button
					type="button"
					className="btn-close"
					aria-label="Close"
					onClick={onCancel}
				/>
			</div>

			<div className="p-3">
				<p>{intro}</p>

				{emails.map((email, index) => (
					<div key={index} className="border rounded p-3 mb-3 bg-body-tertiary">
						<p className="small text-body-secondary mb-2">
							To: {to} · Subject: {email.subject}
						</p>
						<p className="admin-answer small mb-0">{email.text}</p>
					</div>
				))}

				{offerCopy && (
					<div className="form-check">
						<input
							className="form-check-input"
							type="checkbox"
							id="copy-me"
							checked={copyMe}
							onChange={(event) => setCopyMe(event.target.checked)}
						/>
						<label className="form-check-label" htmlFor="copy-me">
							Copy me on this email
						</label>
					</div>
				)}
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
					className="btn btn-primary"
					onClick={() => onConfirm(copyMe)}
					disabled={pending}
				>
					{pending ? 'Sending…' : confirmLabel}
				</button>
			</div>
		</dialog>
	);
}
