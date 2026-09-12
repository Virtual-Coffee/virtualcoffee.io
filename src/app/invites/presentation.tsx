import type { InviteStatus } from '@/db/schema';

/**
 * How an Invite reads to the Volunteer who sent it.
 *
 * A sibling of `/admin/(protected)/presentation.tsx`, not a reuse of it: these
 * are the *Volunteer's* words for their own Invites, and they are deliberately
 * vaguer than the admin vocabulary. "Applied" covers everything between the
 * application arriving and a decision being made, so a decline never surfaces
 * here as a decline.
 */
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
