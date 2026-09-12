import type { InviteStatus } from '@/db/schema';

// The Volunteer's words for their own Invites, deliberately vaguer than the
// admin's: "Applied" covers everything up to a decision, so a decline never
// surfaces here as a decline.
const STATUS_LABELS: Record<InviteStatus, string> = {
	pending: 'Sent',
	accepted: 'Applied',
	completed: 'Joined',
	expired: 'Expired',
	cancelled: 'Cancelled',
};

const STATUS_CLASSES: Record<InviteStatus, string> = {
	pending: 'text-bg-info',
	accepted: 'text-bg-primary',
	completed: 'text-bg-success',
	expired: 'text-bg-light border',
	cancelled: 'text-bg-light border',
};

export function inviteStatusLabel(status: InviteStatus): string {
	return STATUS_LABELS[status];
}

export function InviteStatusBadge({ status }: { status: InviteStatus }) {
	return (
		<span className={`badge ${STATUS_CLASSES[status]}`}>
			{STATUS_LABELS[status]}
		</span>
	);
}

export { formatDate } from '@/app/admin/(protected)/presentation';
