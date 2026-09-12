'use client';

import { useAction } from '@/util/forms/useAction';

import { cancelInvite } from './actions';

/** Give an unclaimed Invite back — the remedy for a mistyped address. */
export function CancelInviteButton({
	inviteId,
	inviteeName,
}: {
	inviteId: string;
	inviteeName: string;
}) {
	const { run, pending, error } = useAction();

	return (
		<>
			<button
				type="button"
				className="btn btn-sm btn-outline-secondary"
				disabled={pending}
				onClick={() => {
					if (
						!window.confirm(
							`Cancel the invite to ${inviteeName}? You'll get it back to use on someone else.`,
						)
					) {
						return;
					}

					run(() => cancelInvite(inviteId));
				}}
			>
				{pending ? 'Cancelling…' : 'Cancel'}
			</button>
			{error && (
				<p className="text-danger small mb-0 mt-1" role="alert">
					{error}
				</p>
			)}
		</>
	);
}
