'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import type { AdminRow } from '@/lib/admins';
import { grantAdmin, revokeAdmin } from './actions';

export function AdminRowActions({
	userId,
	name,
}: {
	userId: string;
	name: string;
}) {
	const router = useRouter();
	const [error, setError] = useState<string | null>(null);
	const [pending, startTransition] = useTransition();

	return (
		<>
			<button
				type="button"
				className="btn btn-sm btn-outline-danger"
				disabled={pending}
				onClick={() => {
					if (!window.confirm(`Revoke admin access for ${name}?`)) {
						return;
					}
					startTransition(async () => {
						const result = await revokeAdmin(userId);
						if (result.ok) router.refresh();
						else setError(result.message);
					});
				}}
			>
				Revoke
			</button>
			{error && (
				<p className="text-danger small mb-0" role="alert">
					{error}
				</p>
			)}
		</>
	);
}

export function GrantAdminForm({ candidates }: { candidates: AdminRow[] }) {
	const router = useRouter();
	const [userId, setUserId] = useState('');
	const [pending, startTransition] = useTransition();

	if (candidates.length === 0) {
		return (
			<p className="text-body-secondary small mb-0">
				Only people who have signed in at least once can be granted admin.
			</p>
		);
	}

	return (
		<form
			className="d-flex gap-2"
			onSubmit={(event) => {
				event.preventDefault();
				if (!userId) return;
				startTransition(async () => {
					await grantAdmin(userId);
					setUserId('');
					router.refresh();
				});
			}}
		>
			<label className="visually-hidden" htmlFor="grant-admin">
				Person to grant admin to
			</label>
			<select
				id="grant-admin"
				className="form-select form-select-sm"
				value={userId}
				onChange={(event) => setUserId(event.target.value)}
			>
				<option value="">Choose someone…</option>
				{candidates.map((candidate) => (
					<option key={candidate.id} value={candidate.id}>
						{candidate.name} ({candidate.email})
					</option>
				))}
			</select>
			<button
				type="submit"
				className="btn btn-sm btn-primary text-nowrap"
				disabled={pending || !userId}
			>
				Grant admin
			</button>
		</form>
	);
}
