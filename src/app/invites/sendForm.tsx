'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { useModalDialog } from '@/util/useModalDialog';
import { previewInvite, sendInvite } from './actions';

type Preview = { to: string; subject: string; text: string };

/**
 * Invite someone, with the real email shown before it goes.
 *
 * The same idea as the waitlist's `ConfirmSendDialog` — show the words, not an
 * "are you sure?" — but built here rather than imported from it. That component
 * lives inside the admin tree and carries a "Copy me on this email" checkbox
 * that means nothing here, and /invites deliberately does not depend on /admin:
 * that whole tree 404s on deploy previews.
 *
 * The preview is fetched from the server because the text depends on a name the
 * Volunteer has only just typed, so it cannot be rendered ahead of time the way
 * the waitlist templates are.
 */
export function SendInviteForm({ balance }: { balance: number }) {
	const router = useRouter();
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [preview, setPreview] = useState<Preview | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [notice, setNotice] = useState<string | null>(null);
	const [pending, startTransition] = useTransition();
	// A click on the backdrop discards the preview and sends nothing.
	const dialog = useModalDialog(preview !== null, () => setPreview(null));

	const spent = balance < 1;

	function review() {
		setError(null);
		setNotice(null);
		startTransition(async () => {
			const result = await previewInvite(name, email);
			if (result.ok) {
				setPreview({
					to: result.to,
					subject: result.subject,
					text: result.text,
				});
			} else {
				setError(result.message);
			}
		});
	}

	function confirm() {
		startTransition(async () => {
			const result = await sendInvite(name, email);
			setPreview(null);

			if (result.ok) {
				setName('');
				setEmail('');
				setNotice(result.message ?? 'Invite sent.');
				router.refresh();
			} else {
				setError(result.message);
				// A definitely-failed send gives the invite back, so the balance on
				// screen is stale either way.
				router.refresh();
			}
		});
	}

	return (
		<div className="card">
			<div className="card-body">
				<h2 className="h6 text-body-secondary">Invite someone</h2>

				{error && (
					<div className="alert alert-danger" role="alert">
						{error}
					</div>
				)}
				{notice && (
					<div className="alert alert-success" role="status">
						{notice}
					</div>
				)}

				{spent ? (
					<p className="text-body-secondary mb-0">
						You&rsquo;ve used all your invites. You&rsquo;ll get another on the
						1st of the month.
					</p>
				) : (
					<form
						onSubmit={(event) => {
							event.preventDefault();
							review();
						}}
						noValidate
					>
						<div className="mb-3">
							<label className="form-label" htmlFor="invitee-name">
								Their name
							</label>
							<input
								id="invitee-name"
								className="form-control"
								value={name}
								onChange={(event) => setName(event.target.value)}
								autoComplete="off"
								required
							/>
						</div>

						<div className="mb-3">
							<label className="form-label" htmlFor="invitee-email">
								Their email
							</label>
							<input
								id="invitee-email"
								type="email"
								className="form-control"
								value={email}
								onChange={(event) => setEmail(event.target.value)}
								autoComplete="off"
								required
							/>
							<div className="form-text">
								We&rsquo;ll email them a link that skips the waitlist. Check it
								carefully — a wrong address uses up an invite until you cancel
								it.
							</div>
						</div>

						<button
							type="submit"
							className="btn btn-primary"
							disabled={pending || !name.trim() || !email.trim()}
						>
							{pending ? 'Just a moment…' : 'Review invite'}
						</button>
					</form>
				)}
			</div>

			<dialog {...dialog} className="admin-dialog">
				<div className="p-3 border-bottom d-flex justify-content-between align-items-start gap-3">
					<h2 className="h5 mb-0">Send this invite?</h2>
					<button
						type="button"
						className="btn-close"
						aria-label="Close"
						onClick={() => setPreview(null)}
					/>
				</div>

				<div className="p-3">
					<p>
						This is exactly what {preview?.to} will receive. It uses one of your
						invites.
					</p>
					{preview && (
						<div className="border rounded p-3 bg-body-tertiary">
							<p className="small text-body-secondary mb-2">
								To: {preview.to} · Subject: {preview.subject}
							</p>
							<p className="admin-answer small mb-0">{preview.text}</p>
						</div>
					)}
				</div>

				<div className="p-3 border-top d-flex justify-content-end gap-2">
					<button
						type="button"
						className="btn btn-outline-secondary"
						onClick={() => setPreview(null)}
						disabled={pending}
					>
						Cancel
					</button>
					<button
						type="button"
						className="btn btn-primary"
						onClick={confirm}
						disabled={pending}
					>
						{pending ? 'Sending…' : 'Send invite'}
					</button>
				</div>
			</dialog>
		</div>
	);
}
