import type { SubmissionStatus } from '@/db';

const STATUS_LABELS: Record<SubmissionStatus, string> = {
	new: 'New',
	in_progress: 'In progress',
	resolved: 'Resolved',
	dismissed: 'Dismissed',
};

// `dismissed` is muted rather than red: it records a decision that nothing
// needed doing, not that the person was wrong to write in.
const STATUS_CLASSES: Record<SubmissionStatus, string> = {
	new: 'text-bg-warning',
	in_progress: 'text-bg-info',
	resolved: 'text-bg-success',
	dismissed: 'text-bg-light border',
};

export const STATUS_ORDER: SubmissionStatus[] = [
	'new',
	'in_progress',
	'resolved',
	'dismissed',
];

export function SubmissionStatusBadge({
	status,
}: {
	status: SubmissionStatus;
}) {
	return (
		<span className={`badge ${STATUS_CLASSES[status]}`}>
			{STATUS_LABELS[status]}
		</span>
	);
}

export function submissionStatusLabel(status: SubmissionStatus) {
	return STATUS_LABELS[status];
}

export const SUBMISSION_EVENT_LABELS: Record<string, string> = {
	submitted: 'Submitted',
	status_changed: 'Status changed',
	note: 'Note',
	notification_sent: 'Notified',
	notification_failed: 'Notification failed',
	imported: 'Imported from Airtable',
};
