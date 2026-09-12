import Link from 'next/link';

import type { ActivityEntry } from '@/lib/dashboard';
import { formatDateTime } from './presentation';

/**
 * Terser than the detail screens' labels: this feed mixes application and
 * submission events, so an entry already carries its subject beside the badge.
 */
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
 * The newest `ACTIVITY_LIMIT` entries of a much larger log, in the order the
 * server returned them. Not sortable: reordering fifteen rows of a bounded
 * feed would claim to sort a history it does not hold.
 */
export function ActivityFeed({ entries }: { entries: ActivityEntry[] }) {
	if (entries.length === 0) {
		return <p className="text-body-secondary">Nothing has happened yet.</p>;
	}

	return (
		<ul className="list-group">
			{entries.map((entry) => (
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
						<p className="small text-body-secondary mb-0 mt-1">{entry.body}</p>
					)}
				</li>
			))}
		</ul>
	);
}
