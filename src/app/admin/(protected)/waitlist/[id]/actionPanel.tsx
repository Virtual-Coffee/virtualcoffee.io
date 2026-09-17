'use client';

import { useId, useState } from 'react';

import type { ApplicationStatus } from '@/db';
import {
	approveMembership,
	declineApplication,
	recordAttendance,
	resendSlackInvite,
	sendCoffeeInvite,
	withdrawApplication,
} from '../actions';
import { ActionDialog, type ActionFailure } from '@/components/ActionDialog';
import { EmailPreview } from '@/components/EmailPreview';
import { ARCHIVE_STATUSES } from '@/lib/applicationStatuses';
import type { EmailStatus } from '@/lib/email/transport';
import { MAX_NOTE_LENGTH } from '@/lib/notes';
import { useAction } from '@/util/forms/useAction';
import { ReadOnlyNotice } from '../../presentation';

type Template = { subject: string; text: string };

type Props = {
	canManage: boolean;
	applicationId: string;
	applicantName: string;
	applicantEmail: string;
	status: ApplicationStatus;
	statusText: string;
	attendedAt: string | null;
	emailStatus: EmailStatus;
	coffeeInvite: Template;
	welcome: Template;
	slackInvite: Template;
};

export function ActionPanel(props: Props) {
	// One draft each, not one per dialog: only one of these can be open, and
	// every close resets them, so a note typed for one decision cannot carry
	// over to the next.
	const [copyMe, setCopyMe] = useState(false);
	const [note, setNote] = useState('');
	// Each action changes the status that decides which buttons render, so a
	// success message beside the trigger would unmount with it. It lives up
	// here instead, where the next confirmation clears it.
	const [notice, setNotice] = useState<string | null>(null);
	const attendance = useAction();

	if (!props.canManage) return <ReadOnlyNotice />;

	/**
	 * Whether anything was emailed is the thing the maintainer needs in order
	 * to decide about retrying, so it is stated outright rather than left to
	 * be inferred.
	 */
	const retryAdvice = (result: ActionFailure) =>
		'emailSent' in result ? (
			<p className="mb-0 small">
				{result.emailSent === false
					? `${props.applicantName} is still ${props.statusText} and nothing was emailed — safe to try again.`
					: result.emailSent === 'unknown'
						? `We can’t confirm whether the email went out. Check with ${props.applicantEmail} before retrying, or you may email them twice.`
						: 'An email was already sent — read the message above before retrying.'}
			</p>
		) : null;

	// Shared by every dialog here: the outcome is reported above rather than
	// beside the trigger, the drafts reset on close, and the screen's numbers
	// may have moved even when the action refused.
	const shared = {
		showFeedback: false,
		refresh: 'always',
		onOpen: () => setNotice(null),
		onClose: () => {
			setCopyMe(false);
			setNote('');
		},
		onSuccess: (result: { message?: string }) =>
			setNotice(result.message ?? null),
		errorDetail: retryAdvice,
	} as const;

	const sendCopy = { copyMe, onCopyMe: setCopyMe };

	return (
		<>
			{notice && (
				<div className="alert alert-warning small" role="alert">
					{notice}
				</div>
			)}

			<DeliveryNotice status={props.emailStatus} />

			<div className="d-grid gap-2">
				{props.status === 'waitlisted' && (
					<ActionDialog
						{...shared}
						className="btn btn-primary"
						label="Send Coffee invite"
						title="Send Coffee invite"
						confirmLabel="Send invite"
						pendingLabel="Sending…"
						action={() => sendCoffeeInvite(props.applicationId, copyMe)}
					>
						<EmailPreview
							{...sendCopy}
							intro={
								<>
									This sends an email to <strong>{props.applicantEmail}</strong>{' '}
									and moves {props.applicantName} to{' '}
									<strong>Coffee invited</strong>.
								</>
							}
							to={props.applicantEmail}
							emails={[props.coffeeInvite]}
						/>
					</ActionDialog>
				)}

				{props.status === 'coffee_invited' && (
					<>
						<ActionDialog
							{...shared}
							className="btn btn-primary"
							label="Approve membership"
							title="Approve membership"
							confirmLabel="Approve &amp; send Slack invite"
							pendingLabel="Sending…"
							action={() => approveMembership(props.applicationId, copyMe)}
						>
							<EmailPreview
								{...sendCopy}
								intro={
									<>
										Two things happen and neither can be taken back:{' '}
										{props.applicantName} gets a welcome email, and a Slack
										invite goes out to <strong>{props.applicantEmail}</strong>.
										<span className="d-block mt-2 text-body-secondary">
											Coffee invited → Member
											{props.attendedAt
												? ` · Attended ${props.attendedAt}`
												: ''}
										</span>
									</>
								}
								to={props.applicantEmail}
								emails={[props.welcome, props.slackInvite]}
							/>
						</ActionDialog>
						{!props.attendedAt && (
							<button
								type="button"
								className="btn btn-outline-secondary"
								disabled={attendance.pending}
								onClick={() =>
									attendance.run(() => recordAttendance(props.applicationId), {
										refresh: 'always',
									})
								}
							>
								Record attendance
							</button>
						)}
					</>
				)}

				{props.status === 'member' && (
					<ActionDialog
						{...shared}
						className="btn btn-outline-secondary"
						label="Re-send Slack invite"
						title="Re-send Slack invite"
						confirmLabel="Send invite"
						pendingLabel="Sending…"
						action={() => resendSlackInvite(props.applicationId, copyMe)}
					>
						<EmailPreview
							{...sendCopy}
							intro={
								<>
									A new single-use link goes to{' '}
									<strong>{props.applicantEmail}</strong>. Use this when the
									first one was opened by a link scanner, expired, or never
									arrived. Nothing else changes.
								</>
							}
							to={props.applicantEmail}
							emails={[props.slackInvite]}
						/>
					</ActionDialog>
				)}

				{/* The archive links here too; a closed application has nothing left to close. */}
				{!ARCHIVE_STATUSES.includes(props.status) && (
					<>
						<ActionDialog
							{...shared}
							className="btn btn-outline-danger"
							label="Decline"
							title="Decline application"
							danger
							action={() => declineApplication(props.applicationId, note)}
						>
							<CloseBody
								applicantName={props.applicantName}
								outcome="declined"
								note={note}
								onNote={setNote}
							/>
						</ActionDialog>
						<ActionDialog
							{...shared}
							className="btn btn-outline-secondary"
							label="Mark withdrawn"
							title="Mark withdrawn"
							danger
							action={() => withdrawApplication(props.applicationId, note)}
						>
							<CloseBody
								applicantName={props.applicantName}
								outcome="marked withdrawn"
								note={note}
								onNote={setNote}
							/>
						</ActionDialog>
					</>
				)}
			</div>

			{attendance.feedback}

			{props.status === 'coffee_invited' && (
				<p className="text-body-secondary small mt-3 mb-0">
					Approving also sends the Slack invite.
				</p>
			)}
		</>
	);
}

/**
 * The body of the two terminal closes. Neither sends anything, but neither can
 * be undone either. The optional note lands on the close event itself, so the
 * reason is on the same History line as the decision rather than a separate
 * note someone may not leave.
 */
function CloseBody({
	applicantName,
	outcome,
	note,
	onNote,
}: {
	applicantName: string;
	outcome: string;
	note: string;
	onNote: (note: string) => void;
}) {
	const noteId = useId();

	return (
		<>
			<p>
				{applicantName} will be <strong>{outcome}</strong> and moved to the
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
				onChange={(event) => onNote(event.target.value)}
				placeholder="Recorded in the history alongside the decision"
			/>
		</>
	);
}

/**
 * Which Delivery Mode this deploy is in, when it is not the ordinary one.
 * Captured and Redirected are the non-production modes (docs/adr/0013);
 * missing credentials only matter when a send would actually go out.
 */
function DeliveryNotice({ status }: { status: EmailStatus }) {
	if (status.mode === 'captured') {
		return (
			<div className="alert alert-info small" role="status">
				Email is captured on this deploy ({status.context}): every send is
				logged and recorded as sent, and nothing reaches an inbox.
			</div>
		);
	}

	if (status.mode === 'redirected') {
		return (
			<div className="alert alert-info small" role="status">
				Email from this deploy ({status.context}) is redirected to{' '}
				{status.redirectTo}
				{!status.configured &&
					' — but email isn’t configured, so nothing can be sent yet'}
				.
			</div>
		);
	}

	if (!status.configured) {
		return (
			<div className="alert alert-warning small" role="alert">
				Email isn&rsquo;t configured, so nothing can be sent from here yet.
			</div>
		);
	}

	return null;
}
