import Link from 'next/link';
import { notFound } from 'next/navigation';

import { isId } from '@/db/ids';
import { requirePermission, sessionCan } from '@/lib/access/adminAccess';
import {
	applicationSubject,
	getApplication,
	getApplicationInviter,
} from '@/lib/waitlist/applications';
import { coffeeInvite } from '@/emails/coffeeInvite';
import { slackInvite } from '@/emails/slackInvite';
import { welcome } from '@/emails/welcome';
import { ARCHIVE_STATUSES } from '@/lib/waitlist/applicationStatuses';
import { history } from '@/lib/history/eventLog';
import { emailStatus } from '@/lib/email/transport';
import { ActionPanel } from './actionPanel';
import { HistoryTimeline } from '../../historyTimeline';
import { NoteComposer } from '../../noteComposer';
import { addNote } from '../actions';
import {
	Answer,
	Breadcrumb,
	SourceBadge,
	StatusBadge,
	formatDate,
	sourceLabel,
	STATUS_LABELS,
	statusLabel,
} from '../../presentation';

export const dynamic = 'force-dynamic';

export const metadata = {
	robots: { index: false, follow: false },
};

export default async function ApplicationDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const session = await requirePermission('waitlist', 'read');

	const { id: applicationId } = await params;

	if (!isId(applicationId)) {
		notFound();
	}

	const application = await getApplication(applicationId);
	if (!application) {
		notFound();
	}

	const [entries, inviter] = await Promise.all([
		history(applicationSubject(applicationId)),
		getApplicationInviter(application.inviteId),
	]);

	// A `waitlist_reviewer` holds this Section and not the roster, so the link
	// would 404 for them.
	const canOpenVolunteers = sessionCan(session, 'volunteers', 'read');
	// The actions re-check for themselves; this only keeps a read-only viewer
	// from being shown buttons that would 404 on them.
	const canManage = sessionCan(session, 'waitlist', 'manage');
	const isArchived = ARCHIVE_STATUSES.includes(application.status);

	return (
		<div className="container-fluid px-3 px-lg-4 py-4">
			<Breadcrumb
				className="mb-3"
				parent={
					isArchived
						? { href: '/admin/waitlist/archive', label: 'Archive' }
						: { href: '/admin/waitlist', label: 'Queue' }
				}
				current={`Application ${application.reference}`}
			/>

			<div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
				<div>
					<h1 className="h4 mb-1">{application.name}</h1>
					<p className="text-body-secondary small mb-2">
						{[
							application.pronouns,
							application.email,
							application.githubUsername
								? `@${application.githubUsername}`
								: null,
							`submitted ${formatDate(application.submittedAt)}`,
						]
							.filter(Boolean)
							.join(' · ')}
					</p>
					<div className="d-flex flex-wrap gap-1">
						<StatusBadge status={application.status} />
						<SourceBadge source={application.source} />
					</div>
				</div>
			</div>

			<div className="row g-4">
				<div className="col-lg-7">
					<Answer
						label="How did you hear about us?"
						value={application.howDidYouHear}
					/>
					<Answer
						label="Tell us about your coding journey"
						value={application.journey}
					/>
					<Answer
						label="What are your coding interests?"
						value={application.codeInterests}
					/>
					<Answer
						label="What are you hoping to get from Virtual Coffee?"
						value={application.virtualCoffee}
					/>

					<h2 className="h6 text-body-secondary mt-4">Details</h2>
					<dl className="row small mb-0">
						<dt className="col-sm-4">Source</dt>
						<dd className="col-sm-8">{sourceLabel(application.source)}</dd>
						{/* Separate from Referrer below: that is free text the applicant
						 * typed, this is the Volunteer who spent an Invite on them. */}
						{application.source === 'volunteer_invite' && (
							<>
								<dt className="col-sm-4">Invited by</dt>
								<dd className="col-sm-8">
									{inviter ? (
										inviter.volunteerId && canOpenVolunteers ? (
											<Link href={`/admin/volunteers/${inviter.volunteerId}`}>
												{inviter.name}
											</Link>
										) : (
											inviter.name
										)
									) : (
										'—'
									)}
								</dd>
							</>
						)}
						<dt className="col-sm-4">Referrer</dt>
						<dd className="col-sm-8">{application.referrer ?? '—'}</dd>
						<dt className="col-sm-4">Twitter</dt>
						<dd className="col-sm-8">
							{application.twitterUsername
								? `@${application.twitterUsername}`
								: '—'}
						</dd>
						<dt className="col-sm-4">Code of Conduct</dt>
						<dd className="col-sm-8">
							{application.agreedToCocAt
								? `agreed ${formatDate(application.agreedToCocAt)}`
								: 'not recorded'}
						</dd>
						<dt className="col-sm-4">Attended a Coffee</dt>
						<dd className="col-sm-8">
							{formatDate(application.coffeeAttendedAt)}
						</dd>
					</dl>
				</div>

				<div className="col-lg-5">
					<section className="card mb-4">
						<div className="card-body">
							<h2 className="h6 card-title">Actions</h2>
							<ActionPanel
								canManage={canManage}
								applicationId={application.id}
								applicantName={application.name}
								applicantEmail={application.email}
								status={application.status}
								statusText={statusLabel(application.status)}
								attendedAt={
									application.coffeeAttendedAt
										? formatDate(application.coffeeAttendedAt)
										: null
								}
								emailStatus={emailStatus()}
								coffeeInvite={{
									subject: coffeeInvite.subject({ name: application.name }),
									body: <coffeeInvite.Content name={application.name} />,
								}}
								welcome={{
									subject: welcome.subject({ name: application.name }),
									body: <welcome.Content name={application.name} />,
								}}
								slackInvite={{
									subject: slackInvite.subject({
										name: application.name,
										inviteUrl: '',
									}),
									// The real link is minted at send time; a placeholder
									// stands in so the preview reads as it will.
									body: (
										<slackInvite.Content
											name={application.name}
											inviteUrl="https://virtualcoffee.io/join-slack?code=…"
										/>
									),
								}}
							/>
						</div>
					</section>

					<section>
						<h2 className="h6">History</h2>
						{canManage && (
							<NoteComposer onSubmit={addNote.bind(null, application.id)} />
						)}
						<div className="mt-3">
							<HistoryTimeline history={entries} statusLabels={STATUS_LABELS} />
						</div>
					</section>
				</div>
			</div>
		</div>
	);
}
