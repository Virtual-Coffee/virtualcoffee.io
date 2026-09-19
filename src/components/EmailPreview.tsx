'use client';

import { useId, type ReactNode } from 'react';

/**
 * The body of a confirmation that is about to email someone: the actual email,
 * rather than "are you sure?". The recipient address is repeated above each
 * one because sending to the wrong person is the mistake this exists to catch.
 *
 * `onCopyMe` adds the "Copy me" checkbox; the admin screens want it, the
 * Volunteer's own invites do not. The tick is the caller's state, so it is
 * reset by whatever resets the rest of the dialog's draft.
 */
export function EmailPreview({
	intro,
	to,
	emails,
	copyMe = false,
	onCopyMe,
}: {
	intro: ReactNode;
	to: string;
	emails: { subject: string; text: string }[];
	copyMe?: boolean;
	onCopyMe?: (copyMe: boolean) => void;
}) {
	// Several dialogs are mounted at once (the waitlist action panel has five)
	// and a closed native dialog is still in the DOM, so a fixed id would let
	// one label toggle another dialog's checkbox.
	const copyId = useId();

	return (
		<>
			<p>{intro}</p>

			{emails.map((email, index) => (
				<div key={index} className="border rounded p-3 mb-3 bg-body-tertiary">
					<p className="small text-body-secondary mb-2">
						To: {to} · Subject: {email.subject}
					</p>
					<p className="admin-answer small mb-0">{email.text}</p>
				</div>
			))}

			{onCopyMe && (
				<div className="form-check">
					<input
						className="form-check-input"
						type="checkbox"
						id={copyId}
						checked={copyMe}
						onChange={(event) => onCopyMe(event.target.checked)}
					/>
					<label className="form-check-label" htmlFor={copyId}>
						Copy me on this email
					</label>
				</div>
			)}
		</>
	);
}
