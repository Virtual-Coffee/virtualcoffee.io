import type { InviteStatus, VolunteerLedgerReason } from '@/db/schema';

// The admin vocabulary for Invites and ledger movements — blunter than the
// Volunteer's own in `/invites/presentation.tsx`, on purpose.
const INVITE_LABELS: Record<InviteStatus, string> = {
	pending: 'Unclaimed',
	accepted: 'Claimed',
	completed: 'Joined',
	expired: 'Expired',
	cancelled: 'Cancelled',
};

const INVITE_CLASSES: Record<InviteStatus, string> = {
	pending: 'text-bg-info',
	accepted: 'text-bg-primary',
	completed: 'text-bg-success',
	expired: 'text-bg-light border',
	cancelled: 'text-bg-light border',
};

export function AdminInviteBadge({ status }: { status: InviteStatus }) {
	return (
		<span className={`badge ${INVITE_CLASSES[status]}`}>
			{INVITE_LABELS[status]}
		</span>
	);
}

/** Why a movement happened, as a sentence rather than an enum value. */
export const LEDGER_LABELS: Record<VolunteerLedgerReason, string> = {
	monthly_accrual: 'Monthly invite',
	imported: 'Imported from Airtable',
	admin_grant: 'Added by an admin',
	admin_revoke: 'Removed by an admin',
	spend: 'Invite sent',
	refund_cancelled: 'Invite cancelled',
	refund_expired: 'Invite expired',
};

export function VolunteerStateBadge({
	deactivatedAt,
}: {
	deactivatedAt: Date | null;
}) {
	return deactivatedAt ? (
		<span className="badge text-bg-light border">Paused</span>
	) : (
		<span className="badge text-bg-success">Active</span>
	);
}
