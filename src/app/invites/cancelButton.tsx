'use client';

import { ActionDialog } from '@/components/ActionDialog';

import { cancelInvite } from './actions';

/** Give an unclaimed Invite back — the remedy for a mistyped address. */
export function CancelInviteButton({
	inviteId,
	inviteeName,
}: {
	inviteId: string;
	inviteeName: string;
}) {
	return (
		<ActionDialog
			className="btn btn-sm btn-outline-secondary"
			label="Cancel"
			title={`Cancel the invite to ${inviteeName}?`}
			// Not "Cancel": the dialog's own dismissal is already called that.
			confirmLabel="Cancel invite"
			pendingLabel="Cancelling…"
			action={() => cancelInvite(inviteId)}
		>
			<p className="mb-0">
				This stops the link from working. If the invite was charged to your
				allowance, you get it back to use on someone else.
			</p>
		</ActionDialog>
	);
}
