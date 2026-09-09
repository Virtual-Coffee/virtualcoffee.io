'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import type { AdminRow } from '@/lib/admins';
import { GRANTABLE_ROLES, type RoleName } from '@/lib/permissions';
import { setUserRoles } from './actions';

/**
 * The roles one person holds, as checkboxes.
 *
 * Each change replaces the whole set rather than toggling one role, so the
 * server never has to merge a stale client view with what is actually stored.
 */
export function RoleCheckboxes({
	userId,
	name,
	roles,
	isSelf,
}: {
	userId: string;
	name: string;
	roles: RoleName[];
	isSelf: boolean;
}) {
	const router = useRouter();
	const [error, setError] = useState<string | null>(null);
	const [pending, startTransition] = useTransition();

	function apply(next: RoleName[], confirmMessage?: string) {
		if (confirmMessage && !window.confirm(confirmMessage)) return;

		startTransition(async () => {
			const result = await setUserRoles(userId, next);
			if (result.ok) {
				setError(null);
				router.refresh();
			} else {
				setError(result.message);
			}
		});
	}

	return (
		<>
			<div className="d-flex flex-wrap gap-3">
				{GRANTABLE_ROLES.map((role) => {
					const held = roles.includes(role.name);
					// Removing your own admin role is refused server-side too; the
					// disabled box just avoids offering an action that cannot work.
					const locked = isSelf && role.name === 'admin' && held;

					return (
						<div className="form-check" key={role.name}>
							<input
								className="form-check-input"
								type="checkbox"
								id={`${userId}-${role.name}`}
								checked={held}
								disabled={pending || locked}
								onChange={() =>
									apply(
										held
											? roles.filter((value) => value !== role.name)
											: [...roles, role.name],
									)
								}
							/>
							<label
								className="form-check-label small"
								htmlFor={`${userId}-${role.name}`}
								title={role.description}
							>
								{role.label}
							</label>
						</div>
					);
				})}
			</div>

			{!isSelf && roles.length > 0 && (
				<button
					type="button"
					className="btn btn-sm btn-outline-danger mt-2"
					disabled={pending}
					onClick={() => apply([], `Revoke all access for ${name}?`)}
				>
					Revoke all
				</button>
			)}

			{error && (
				<p className="text-danger small mb-0 mt-1" role="alert">
					{error}
				</p>
			)}
		</>
	);
}

export function GrantAccessForm({ candidates }: { candidates: AdminRow[] }) {
	const router = useRouter();
	const [userId, setUserId] = useState('');
	const [role, setRole] = useState<RoleName>('admin');
	const [pending, startTransition] = useTransition();

	if (candidates.length === 0) {
		return (
			<p className="text-body-secondary small mb-0">
				Only people who have signed in at least once can be granted access.
			</p>
		);
	}

	return (
		<form
			className="d-flex flex-wrap gap-2"
			onSubmit={(event) => {
				event.preventDefault();
				if (!userId) return;
				startTransition(async () => {
					await setUserRoles(userId, [role]);
					setUserId('');
					router.refresh();
				});
			}}
		>
			<label className="visually-hidden" htmlFor="grant-user">
				Person to grant access to
			</label>
			<select
				id="grant-user"
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

			<label className="visually-hidden" htmlFor="grant-role">
				Role to grant
			</label>
			<select
				id="grant-role"
				className="form-select form-select-sm"
				value={role}
				onChange={(event) => setRole(event.target.value as RoleName)}
			>
				{GRANTABLE_ROLES.map((option) => (
					<option key={option.name} value={option.name}>
						{option.label}
					</option>
				))}
			</select>

			<button
				type="submit"
				className="btn btn-sm btn-primary text-nowrap"
				disabled={pending || !userId}
			>
				Grant access
			</button>
		</form>
	);
}
