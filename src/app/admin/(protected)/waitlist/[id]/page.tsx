import Link from 'next/link';
import { notFound } from 'next/navigation';

import { isId } from '@/db/ids';
import { requirePermission } from '@/lib/adminAccess';
import { getApplication, getApplicationHistory } from '@/lib/applications';
import {
	coffeeInviteEmail,
	slackInviteEmail,
	welcomeEmail,
} from '@/lib/email/templates';
import { emailConfigured } from '@/lib/email/transport';
import { ActionPanel } from './actionPanel';
import { NoteComposer } from './noteComposer';
import {
	SourceBadge,
	StatusBadge,
	formatDate,
	formatDateTime,
	statusLabel,
} from '../../presentation';

export const dynamic = 'force-dynamic';

export const metadata = {
	robots: { index: false, follow: false },
};

const EVENT_LABELS: Record<string, string> = {
	submitted: 'Application submitted',
	imported: 'Imported from Airtable',
	waitlisted: 'Added to the waitlist',
	coffee_invited: 'Sent a Coffee invite',
	attendance_recorded: 'Recorded attendance',
	approved: 'Approved membership',
	declined: 'Declined',
	withdrawn: 'Marked withdrawn',
	lapsed: 'Marked lapsed',
	note: 'added a note',
	email_sent: 'Email sent',
	email_failed: 'Email failed',
};

export default async function ApplicationDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	await requirePermission('waitlist', 'read');

	const { id: applicationId } = await params;

	// Checked before the query, not for politeness: Postgres raises on a
	// malformed literal against a uuid column rather than matching nothing.
	if (!isId(applicationId)) {
		notFound();
	}

	const application = await getApplication(applicationId);
	if (!application) {
		notFound();
	}

	const history = await getApplicationHistory(applicationId);

	return (
		<div className="container-fluid px-3 px-lg-4 py-4">
			<nav aria-label="Breadcrumb" className="mb-3">
				<ol className="breadcrumb mb-0 small">
					<li className="breadcrumb-item">
						<Link href="/admin/waitlist">Queue</Link>
					</li>
					<li className="breadcrumb-item active" aria-current="page">
						Application {application.reference}
					</li>
				</ol>
			</nav>

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
						<dd className="col-sm-8">{application.source}</dd>
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
								emailConfigured={emailConfigured()}
								coffeeInvite={coffeeInviteEmail(application.name)}
								welcome={welcomeEmail(application.name)}
								slackInvite={slackInviteEmail(
									application.name,
									'https://virtualcoffee.io/join-slack?code=…',
								)}
							/>
						</div>
					</section>

					<section>
						<h2 className="h6">History</h2>
						<NoteComposer applicationId={application.id} />
						<ol className="list-unstyled mt-3 mb-0">
							{history.map((entry) => (
								<li key={entry.id} className="border-bottom py-2">
									<div className="small">
										{entry.type === 'note' ? (
											<>
												<strong>{entry.actorName ?? 'Someone'}</strong> added a
												note: <em>&ldquo;{entry.body}&rdquo;</em>
											</>
										) : (
											<>
												{entry.actorName ? (
													<strong>{entry.actorName} </strong>
												) : null}
												{EVENT_LABELS[entry.type] ?? entry.type}
												{entry.body ? (
													<span className="text-body-secondary">
														{' '}
														— {entry.body}
													</span>
												) : null}
											</>
										)}
									</div>
									<div className="text-body-secondary small">
										{formatDateTime(entry.createdAt)}
									</div>
								</li>
							))}
						</ol>
					</section>
				</div>
			</div>
		</div>
	);
}

function Answer({ label, value }: { label: string; value: string | null }) {
	return (
		<section className="mb-4">
			<h2 className="h6 text-body-secondary">{label}</h2>
			{value ? (
				<p className="admin-answer mb-0">{value}</p>
			) : (
				<p className="text-body-secondary fst-italic mb-0">No answer given</p>
			)}
		</section>
	);
}
