'use client';

import { useState } from 'react';

import { ConfirmSendDialog } from '@/components/ConfirmSendDialog';
import type { EmailActionResult } from '@/lib/actionResult';
import { useAction } from '@/util/forms/useAction';
import { volunteerInviteEmail } from '@/lib/email/templates';
import { sendInvite } from './actions';

/**
 * Invite someone, with the real email shown before it goes. The preview is
 * the template rendered here with the link elided — the token is minted at
 * send time, and a working invite has no business in a dialog nobody has
 * confirmed yet.
 */
export function SendInviteForm({
	balance,
	inviterName,
	claimUrlPreview,
}: {
	balance: number;
	inviterName: string;
	claimUrlPreview: string;
}) {
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [reviewing, setReviewing] = useState(false);
	const { run, pending, result, clear } = useAction<EmailActionResult>();
	const error = result && !result.ok ? result.message : null;
	const notice = result?.ok ? (result.message ?? 'Invite sent.') : null;

	const spent = balance < 1;
	const preview = volunteerInviteEmail(
		inviterName,
		name.trim(),
		claimUrlPreview,
	);

	function review() {
		clear();
		setReviewing(true);
	}

	function confirm() {
		run(() => sendInvite(name, email.trim()), {
			settle: () => setReviewing(false),
			onSuccess: () => {
				setName('');
				setEmail('');
			},
			// A definitely-failed send gives the invite back, so the balance on
			// screen is stale either way.
			refresh: 'always',
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

			<ConfirmSendDialog
				open={reviewing}
				title="Send this invite?"
				intro={
					<>
						This previews what {email.trim()} will receive. The private invite
						link is hidden until you send it.
					</>
				}
				to={email.trim()}
				emails={[preview]}
				confirmLabel="Send invite"
				pending={pending}
				onCancel={() => setReviewing(false)}
				onConfirm={confirm}
			/>
		</div>
	);
}
