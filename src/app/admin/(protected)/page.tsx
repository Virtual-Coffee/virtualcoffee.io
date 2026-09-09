import Link from 'next/link';

import { requireSession, visibleSections } from '@/lib/adminAccess';
import { dashboardCards, recentActivity } from '@/lib/dashboard';
import {
	failedNotifications,
	SUBMISSION_KINDS,
	type SubmissionKind,
} from '@/lib/submissions';
import { formatDateTime } from './presentation';

export const dynamic = 'force-dynamic';

export const metadata = {
	title: 'Admin',
	robots: { index: false, follow: false },
};

const EVENT_LABELS: Record<string, string> = {
	submitted: 'Submitted',
	waitlisted: 'Waitlisted',
	coffee_invited: 'Coffee invited',
	attendance_recorded: 'Attendance recorded',
	approved: 'Approved',
	declined: 'Declined',
	withdrawn: 'Withdrawn',
	lapsed: 'Lapsed',
	note: 'Note',
	email_sent: 'Email sent',
	email_failed: 'Email failed',
	imported: 'Imported',
	status_changed: 'Status changed',
	notification_sent: 'Notified',
	notification_failed: 'Notification failed',
};

/**
 * The landing screen for /admin.
 *
 * Everything here is scoped to the sections the viewer holds a permission on,
 * so a volunteer with one narrow role sees one card and the activity for it —
 * the same page, not a different one.
 */
export default async function AdminDashboardPage() {
	const session = await requireSession();
	const sections = visibleSections(session);

	const visibleKinds = (
		Object.keys(SUBMISSION_KINDS) as SubmissionKind[]
	).filter((kind) => sections.includes(SUBMISSION_KINDS[kind].section));

	const [cards, activity, failures] = await Promise.all([
		dashboardCards(sections),
		recentActivity(sections),
		failedNotifications(visibleKinds),
	]);

	const failureEntries = Object.entries(failures);

	return (
		<div className="container-fluid px-3 px-lg-4 py-4">
			<h1 className="h4 mb-4">
				Welcome back, {session.user.name || session.user.email}
			</h1>

			{failureEntries.length > 0 && (
				/**
				 * Submissions are stored before they are announced, so a Slack or
				 * GitHub outage leaves a real submission that nobody has been told
				 * about. This is deliberately shown on arrival as well as inside the
				 * affected section — see docs/adr/0005.
				 */
				<div className="alert alert-warning" role="alert">
					<h2 className="h6 alert-heading">
						Some submissions were never announced
					</h2>
					<p className="mb-2">
						These were saved successfully, but notifying Slack failed. Nobody
						will have seen them come in.
					</p>
					<ul className="mb-0">
						{failureEntries.map(([kind, total]) => (
							<li key={kind}>
								<Link href={`/admin/submissions/${kind}`}>
									{SUBMISSION_KINDS[kind as SubmissionKind].label}
								</Link>
								: {total} {total === 1 ? 'submission' : 'submissions'}
							</li>
						))}
					</ul>
				</div>
			)}

			{cards.length > 0 && (
				<div className="row row-cols-1 row-cols-sm-2 row-cols-lg-4 g-3 mb-4">
					{cards.map((card) => (
						<div className="col" key={card.section}>
							<Link
								href={card.href}
								className="card h-100 text-decoration-none text-body"
							>
								<div className="card-body">
									<h2 className="h6 card-title text-body-secondary">
										{card.label}
									</h2>
									<p className="display-6 mb-0">
										{card.openCount.toLocaleString()}
									</p>
									<p className="small text-body-secondary mb-0">
										{card.countLabel}
									</p>
								</div>
							</Link>
						</div>
					))}
				</div>
			)}

			<h2 className="h5">Recent activity</h2>
			{activity.length === 0 ? (
				<p className="text-body-secondary">Nothing has happened yet.</p>
			) : (
				<ul className="list-group">
					{activity.map((entry) => (
						<li className="list-group-item" key={entry.key}>
							<div className="d-flex flex-wrap gap-2 align-items-baseline">
								<span className="badge text-bg-light border">
									{EVENT_LABELS[entry.type] ?? entry.type}
								</span>
								{entry.href ? (
									<Link href={entry.href}>{entry.subject}</Link>
								) : (
									<span>{entry.subject}</span>
								)}
								<span className="ms-auto small text-body-secondary">
									{formatDateTime(entry.createdAt)}
									{entry.actorName ? ` · ${entry.actorName}` : ''}
								</span>
							</div>
							{entry.body && (
								<p className="small text-body-secondary mb-0 mt-1">
									{entry.body}
								</p>
							)}
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
