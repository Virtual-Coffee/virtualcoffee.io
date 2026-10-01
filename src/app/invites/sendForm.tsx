'use client';

import { useState } from 'react';

import { ActionDialog } from '@/components/ActionDialog';
import { EmailPreview } from '@/components/EmailPreview';
import { volunteerInvite } from '@/emails/volunteerInvite';
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
	// Spending the last invite replaces the form the trigger sits in, so the
	// outcome is reported up here rather than beside it.
	const [notice, setNotice] = useState<string | null>(null);

	const spent = balance < 1;
	const previewProps = {
		inviterName,
		inviteeName: name.trim(),
		claimUrl: claimUrlPreview,
	};
	const preview = {
		subject: volunteerInvite.subject(previewProps),
		body: <volunteerInvite.Content {...previewProps} />,
	};

	return (
		<div className="card">
			<div className="card-body">
				<h2 className="h6 text-body-secondary">Invite someone</h2>

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
					<form>
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

						{/* A submit trigger, so Enter in either field reviews the invite
						    and the fields' own validation still runs first. */}
						<ActionDialog
							className="btn btn-primary"
							label="Review invite"
							triggerType="submit"
							disabled={!name.trim() || !email.trim()}
							title="Send this invite?"
							confirmLabel="Send invite"
							pendingLabel="Sending…"
							showFeedback={false}
							// A definitely-failed send gives the invite back, so the balance
							// on screen is stale either way.
							refresh="always"
							onOpen={() => setNotice(null)}
							onSuccess={(result) => {
								setNotice(result.message ?? 'Invite sent.');
								setName('');
								setEmail('');
							}}
							action={() => sendInvite(name, email.trim())}
						>
							<EmailPreview
								intro={
									<>
										This previews what {email.trim()} will receive. The private
										invite link is hidden until you send it.
									</>
								}
								to={email.trim()}
								emails={[preview]}
							/>
						</ActionDialog>
					</form>
				)}
			</div>
		</div>
	);
}
