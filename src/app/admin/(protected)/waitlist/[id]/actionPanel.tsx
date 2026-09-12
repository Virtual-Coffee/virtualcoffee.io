'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import type { ApplicationStatus } from '@/db';
import {
	approveMembership,
	declineApplication,
	recordAttendance,
	resendSlackInvite,
	sendCoffeeInvite,
	withdrawApplication,
} from '../actions';
import type { ActionResult, EmailActionResult } from '@/lib/actionResult';
import { ConfirmSendDialog } from '@/components/ConfirmSendDialog';
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
	emailConfigured: boolean;
	coffeeInvite: Template;
	welcome: Template;
	slackInvite: Template;
};

type Dialog = 'coffee' | 'approve' | 'resend' | null;

export function ActionPanel(props: Props) {
	const router = useRouter();
	const [dialog, setDialog] = useState<Dialog>(null);
	const [result, setResult] = useState<ActionResult | EmailActionResult | null>(
		null,
	);
	const [pending, startTransition] = useTransition();

	function run(action: () => Promise<ActionResult | EmailActionResult>) {
		startTransition(async () => {
			const outcome = await action();
			setResult(outcome);
			if (outcome.ok) {
				setDialog(null);
				router.refresh();
			}
		});
	}

	if (!props.canManage) return <ReadOnlyNotice />;

	return (
		<>
			{result && !result.ok && (
				<div className="alert alert-danger" role="alert">
					<h3 className="h6 alert-heading">That didn&rsquo;t work</h3>
					<p className="mb-1">{result.message}</p>
					{/* Whether anything was emailed is the thing the maintainer needs
					    in order to decide about retrying, so it is stated outright
					    rather than left to be inferred. */}
					{'emailSent' in result && (
						<p className="mb-0 small">
							{result.emailSent === false
								? `${props.applicantName} is still ${props.statusText} and nothing was emailed — safe to try again.`
								: result.emailSent === 'unknown'
									? `We can’t confirm whether the email went out. Check with ${props.applicantEmail} before retrying, or you may email them twice.`
									: 'An email was already sent — read the message above before retrying.'}
						</p>
					)}
				</div>
			)}

			{result?.ok && result.message && (
				<div className="alert alert-warning small" role="alert">
					{result.message}
				</div>
			)}

			{!props.emailConfigured && (
				<div className="alert alert-warning small" role="alert">
					Email isn&rsquo;t configured, so nothing can be sent from here yet.
				</div>
			)}

			<div className="d-grid gap-2">
				{props.status === 'waitlisted' && (
					<button
						type="button"
						className="btn btn-primary"
						disabled={pending}
						onClick={() => setDialog('coffee')}
					>
						Send Coffee invite
					</button>
				)}

				{props.status === 'coffee_invited' && (
					<>
						<button
							type="button"
							className="btn btn-primary"
							disabled={pending}
							onClick={() => setDialog('approve')}
						>
							Approve membership
						</button>
						<button
							type="button"
							className="btn btn-outline-secondary"
							disabled={pending}
							onClick={() => run(() => recordAttendance(props.applicationId))}
						>
							Record attendance
						</button>
					</>
				)}

				{props.status === 'member' && (
					<button
						type="button"
						className="btn btn-outline-secondary"
						disabled={pending}
						onClick={() => setDialog('resend')}
					>
						Re-send Slack invite
					</button>
				)}

				{props.status !== 'member' && (
					<>
						<button
							type="button"
							className="btn btn-outline-danger"
							disabled={pending}
							onClick={() =>
								run(() => declineApplication(props.applicationId, null))
							}
						>
							Decline
						</button>
						<button
							type="button"
							className="btn btn-outline-secondary"
							disabled={pending}
							onClick={() =>
								run(() => withdrawApplication(props.applicationId))
							}
						>
							Mark withdrawn
						</button>
					</>
				)}
			</div>

			{props.status === 'coffee_invited' && (
				<p className="text-body-secondary small mt-3 mb-0">
					Approving also sends the Slack invite.
				</p>
			)}

			<ConfirmSendDialog
				open={dialog === 'coffee'}
				title="Send Coffee invite"
				intro={
					<>
						This sends an email to <strong>{props.applicantEmail}</strong> and
						moves {props.applicantName} to <strong>Coffee invited</strong>.
					</>
				}
				to={props.applicantEmail}
				emails={[props.coffeeInvite]}
				confirmLabel="Send invite"
				pending={pending}
				offerCopy
				onCancel={() => setDialog(null)}
				onConfirm={(copyMe) =>
					run(() => sendCoffeeInvite(props.applicationId, copyMe))
				}
			/>

			<ConfirmSendDialog
				open={dialog === 'approve'}
				title="Approve membership"
				intro={
					<>
						Two things happen and neither can be taken back:{' '}
						{props.applicantName} gets a welcome email, and a Slack invite goes
						out to <strong>{props.applicantEmail}</strong>.
						<span className="d-block mt-2 text-body-secondary">
							Coffee invited → Member
							{props.attendedAt ? ` · Attended ${props.attendedAt}` : ''}
						</span>
					</>
				}
				to={props.applicantEmail}
				emails={[props.welcome, props.slackInvite]}
				confirmLabel="Approve &amp; send Slack invite"
				pending={pending}
				offerCopy
				onCancel={() => setDialog(null)}
				onConfirm={(copyMe) =>
					run(() => approveMembership(props.applicationId, copyMe))
				}
			/>

			<ConfirmSendDialog
				open={dialog === 'resend'}
				title="Re-send Slack invite"
				intro={
					<>
						A new single-use link goes to{' '}
						<strong>{props.applicantEmail}</strong>. Use this when the first one
						was opened by a link scanner, expired, or never arrived. Nothing
						else changes.
					</>
				}
				to={props.applicantEmail}
				emails={[props.slackInvite]}
				confirmLabel="Send invite"
				pending={pending}
				offerCopy
				onCancel={() => setDialog(null)}
				onConfirm={(copyMe) =>
					run(() => resendSlackInvite(props.applicationId, copyMe))
				}
			/>
		</>
	);
}
