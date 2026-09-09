'use client';

import { useCallback, useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import type { AdminRow } from '@/lib/admins';
import { GRANTABLE_ROLES, type RoleName } from '@/lib/permissions';
import { useDropdown } from '../useDropdown';
import { setUserRoles } from './actions';

const LABELS = new Map(
	GRANTABLE_ROLES.map((role) => [role.name as RoleName, role.label]),
);

/**
 * The roles one person holds, as a dropdown of checkboxes.
 *
 * Each change replaces the whole set rather than toggling one role, so the
 * server never has to merge a stale client view with what is actually stored.
 *
 * The held roles are also summarised under the toggle. Six identical "Roles"
 * buttons would otherwise tell a maintainer scanning this table nothing about
 * who can do what.
 */
export function RolesDropdown({
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
	const { open, setOpen, wrapperRef, toggleRef } = useDropdown<
		HTMLDivElement,
		HTMLButtonElement
	>();

	/**
	 * The menu is positioned `fixed` rather than left to sit under the toggle.
	 *
	 * This table lives in `.table-responsive`, which sets `overflow-x: auto` —
	 * and because one axis is non-visible the other computes to `auto` too, so an
	 * absolutely positioned menu is clipped by that scroll container. Taking it
	 * out of flow and anchoring it to the toggle's rect is what Popper would do
	 * if it were loaded.
	 */
	const [anchor, setAnchor] = useState<{ top: number; left: number } | null>(
		null,
	);

	const measure = useCallback(() => {
		const rect = toggleRef.current?.getBoundingClientRect();
		if (rect) setAnchor({ top: rect.bottom + 4, left: rect.left });
	}, [toggleRef]);

	useEffect(() => {
		if (!open) return;

		measure();

		// `true` so a scroll of the table itself is caught, not just the page.
		window.addEventListener('scroll', measure, true);
		window.addEventListener('resize', measure);
		return () => {
			window.removeEventListener('scroll', measure, true);
			window.removeEventListener('resize', measure);
		};
	}, [open, measure]);

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

	const menuId = `${userId}-roles-menu`;

	return (
		<div className="dropdown" ref={wrapperRef}>
			<button
				type="button"
				ref={toggleRef}
				className="btn btn-sm btn-outline-secondary dropdown-toggle"
				aria-expanded={open}
				aria-haspopup="true"
				aria-controls={menuId}
				onClick={() => setOpen((wasOpen) => !wasOpen)}
			>
				Roles
				{roles.length > 0 && (
					<span className="badge text-bg-secondary ms-2">{roles.length}</span>
				)}
			</button>

			{open && (
				<ul
					id={menuId}
					className="dropdown-menu show py-1"
					style={
						{
							position: 'fixed',
							top: anchor?.top ?? 0,
							left: anchor?.left ?? 0,
							// Hidden until measured, so it never flashes at the top-left.
							visibility: anchor ? 'visible' : 'hidden',
							/**
							 * Six roles each carrying a description make a tall menu at
							 * this theme's 18px root. A `.small` class cannot shrink it:
							 * `.dropdown-menu` sets `font-size` from this variable at the
							 * same specificity and later in Bootstrap's source order, so it
							 * wins. Overriding the variable is the way in.
							 */
							'--bs-dropdown-font-size': '0.8125rem',
						} as React.CSSProperties
					}
				>
					{GRANTABLE_ROLES.map((role) => {
						const held = roles.includes(role.name);
						// Removing your own admin role is refused server-side too; the
						// disabled box just avoids offering an action that cannot work.
						const locked = isSelf && role.name === 'admin' && held;
						const inputId = `${userId}-${role.name}`;

						return (
							/**
							 * The inset lives on the `li`, not on the `.form-check`.
							 * Bootstrap pairs `.form-check`'s `padding-left: 1.5em` with
							 * `margin-left: -1.5em` on the input, so overriding that padding
							 * with a `px-*` utility leaves the input pulled further left
							 * than the padding it is cancelling — the checkbox ends up
							 * outside the menu's border.
							 */
							<li key={role.name} className="px-3">
								<div className="form-check py-1 mb-0 lh-sm">
									<input
										className="form-check-input"
										type="checkbox"
										id={inputId}
										checked={held}
										disabled={pending || locked}
										// No `setOpen(false)`: you are usually toggling more
										// than one role, so the menu stays put.
										onChange={() =>
											apply(
												held
													? roles.filter((value) => value !== role.name)
													: [...roles, role.name],
											)
										}
									/>
									<label className="form-check-label" htmlFor={inputId}>
										{role.label}
										{/*
										 * Was a `title` attribute, which never shows on touch.
										 * `.small` works here where it did not on the menu
										 * itself: nothing competes to set a font-size on this
										 * span, so its 0.875em applies to the menu's own size.
										 */}
										<span className="d-block small text-body-secondary">
											{role.description}
										</span>
									</label>
								</div>
							</li>
						);
					})}

					{!isSelf && roles.length > 0 && (
						<>
							<li>
								<hr className="dropdown-divider" />
							</li>
							<li>
								<button
									type="button"
									className="dropdown-item text-danger"
									disabled={pending}
									onClick={() => {
										setOpen(false);
										apply([], `Revoke all access for ${name}?`);
									}}
								>
									Revoke all
								</button>
							</li>
						</>
					)}
				</ul>
			)}

			<div className="mt-1 d-flex flex-wrap gap-1">
				{roles.length === 0 ? (
					<span className="small text-body-secondary">No access</span>
				) : (
					roles.map((role) => (
						<span className="badge text-bg-light border" key={role}>
							{LABELS.get(role) ?? role}
						</span>
					))
				)}
			</div>

			{error && (
				<p className="text-danger small mb-0 mt-1" role="alert">
					{error}
				</p>
			)}
		</div>
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
