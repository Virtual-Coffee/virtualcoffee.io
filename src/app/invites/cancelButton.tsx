'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { cancelInvite } from './actions';

/** Give an unclaimed Invite back — the remedy for a mistyped address. */
export function CancelInviteButton({
	inviteId,
	inviteeName,
}: {
	inviteId: string;
	inviteeName: string;
}) {
	const router = useRouter();
	const [error, setError] = useState<string | null>(null);
	const [pending, startTransition] = useTransition();

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

					startTransition(async () => {
						const result = await cancelInvite(inviteId);
						if (result.ok) {
							setError(null);
							router.refresh();
						} else {
							setError(result.message);
						}
					});
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
