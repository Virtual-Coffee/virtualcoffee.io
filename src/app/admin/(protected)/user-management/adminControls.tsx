'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import type { GrantCandidate } from '@/lib/admins';
import {
	GRANTABLE_ROLE_NAMES,
	GRANTABLE_ROLES,
	ROLE_LABELS,
	type RoleName,
} from '@/lib/permissions';
import { useDropdown } from '../useDropdown';
import {
	grantPendingAccess,
	revokePendingGrant,
	setPendingGrantRoles,
	setUserRoles,
} from './actions';
import type { ActionResult } from '@/lib/actionResult';

/**
 * The roles one person holds, as a dropdown of checkboxes. Changes are staged
 * and written together on Save as the whole grantable set, so the server never
 * merges a stale client view; Cancel, Escape and clicking away discard the
 * draft. `volunteer` is not grantable here and is carried over by
 * `preserveUngrantedRoles`. A row is backed by a user or a Pending Grant —
 * same control, different action.
 */
export function RolesDropdown({
	kind,
	id,
	name,
	roles,
	isSelf,
}: {
	kind: 'user' | 'pending';
	id: string;
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

	const grantable = roles.filter((role) => GRANTABLE_ROLE_NAMES.has(role));

	/**
	 * Seeded from `grantable` each time the menu opens, not in an effect: the
	 * hook closes the menu on Escape and outside clicks without telling us, and
	 * reseeding on open is what makes those discard the draft.
	 */
	const [draft, setDraft] = useState<RoleName[]>([]);

	const dirty =
		draft.length !== grantable.length ||
		draft.some((role) => !grantable.includes(role));

	function toggleDraft(role: RoleName) {
		setDraft((current) =>
			current.includes(role)
				? current.filter((value) => value !== role)
				: [...current, role],
		);
	}

	function run(action: () => Promise<ActionResult>, onSuccess?: () => void) {
		startTransition(async () => {
			const result = await action();

			if (result.ok) {
				setError(null);
				onSuccess?.();
				router.refresh();
			} else {
				setError(result.message);
			}
		});
	}

	/**
	 * The menu stays open on failure: the error renders under the chips, and
	 * the draft is still there to fix and retry.
	 */
	function save() {
		run(
			() =>
				kind === 'user'
					? setUserRoles(id, draft)
					: setPendingGrantRoles(id, draft),
			() => setOpen(false),
		);
	}

	/**
	 * Revoking a Pending Grant deletes it rather than setting it to no roles: it
	 * never took effect, so there is nothing to keep, and a grant holding nothing
	 * would sit in the table meaning nothing.
	 *
	 * Only this button deletes, and it is not staged. Unticking every checkbox
	 * and saving goes through `save` with an empty set, because a Volunteer's
	 * grant still holds `volunteer` after that and is not empty.
	 */
	function revokeAll() {
		if (!window.confirm(`Revoke all access for ${name}?`)) return;

		run(() =>
			kind === 'user' ? setUserRoles(id, []) : revokePendingGrant(id),
		);
	}

	const menuId = `${id}-roles-menu`;

	return (
		<div className="dropdown" ref={wrapperRef}>
			<button
				type="button"
				ref={toggleRef}
				className="btn btn-sm btn-outline-secondary dropdown-toggle"
				aria-expanded={open}
				aria-haspopup="true"
				aria-controls={menuId}
				onClick={() => {
					if (!open) setDraft(grantable);
					setOpen((wasOpen) => !wasOpen);
				}}
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
							// `.small` loses to `.dropdown-menu`'s own font-size; the variable wins.
							'--bs-dropdown-font-size': '0.8125rem',
						} as React.CSSProperties
					}
				>
					{GRANTABLE_ROLES.map((role) => {
						// Removing your own admin role is refused server-side too; the
						// disabled box just avoids offering an action that cannot work.
						const locked =
							isSelf && role.name === 'admin' && roles.includes('admin');
						const inputId = `${id}-${role.name}`;

						return (
							// Inset on the `li`: `.form-check`'s padding pairs with a negative
							// margin on the input, so a `px-*` there pushes the box outside.
							<li key={role.name} className="px-3">
								<div className="form-check py-1 mb-0 lh-sm">
									<input
										className="form-check-input"
										type="checkbox"
										id={inputId}
										checked={draft.includes(role.name)}
										disabled={pending || locked}
										onChange={() => toggleDraft(role.name)}
									/>
									<label className="form-check-label" htmlFor={inputId}>
										{ROLE_LABELS[role.name]}
										<span className="d-block small text-body-secondary">
											{role.description}
										</span>
									</label>
								</div>
							</li>
						);
					})}

					<li>
						<hr className="dropdown-divider" />
					</li>
					<li className="px-3 py-1 d-flex gap-2">
						<button
							type="button"
							className="btn btn-sm btn-primary"
							disabled={pending || !dirty}
							onClick={save}
						>
							Save
						</button>
						<button
							type="button"
							className="btn btn-sm btn-outline-secondary"
							disabled={pending}
							onClick={() => setOpen(false)}
						>
							Cancel
						</button>
					</li>

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
										revokeAll();
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
							{ROLE_LABELS[role]}
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

/**
 * Pre-provision a Role for someone in the Slack workspace. Candidates come
 * from Slack, not `user`: the point is to give access to someone who has
 * never visited the site.
 */
export function GrantAccessForm({
	candidates,
}: {
	candidates: GrantCandidate[];
}) {
	const router = useRouter();
	const [query, setQuery] = useState('');
	const [selected, setSelected] = useState<GrantCandidate | null>(null);
	const [role, setRole] = useState<RoleName>('admin');
	const [error, setError] = useState<string | null>(null);
	const [pending, startTransition] = useTransition();
	const { open, setOpen, wrapperRef, toggleRef } = useDropdown<
		HTMLDivElement,
		HTMLInputElement
	>();

	const matches = useMemo(() => {
		const needle = query.trim().toLowerCase();
		const pool = needle
			? candidates.filter((candidate) =>
					`${candidate.displayName} ${candidate.name} ${candidate.handle}`
						.toLowerCase()
						.includes(needle),
				)
			: candidates;

		// Enough to scroll, few enough to render: the workspace is far larger
		// than anyone scrolls through, and the search is what narrows it.
		return pool.slice(0, 50);
	}, [candidates, query]);

	function choose(candidate: GrantCandidate) {
		setSelected(candidate);
		setQuery(candidate.displayName);
		setError(null);
		setOpen(false);
	}

	function submit(event: React.FormEvent) {
		event.preventDefault();
		if (!selected) return;

		startTransition(async () => {
			const result = await grantPendingAccess(selected.id, [role]);

			if (result.ok) {
				setSelected(null);
				setQuery('');
				setError(null);
				router.refresh();
			} else {
				// Surfacing this is load-bearing: picking someone who has already
				// signed in is refused, and a silent refusal reads as the button
				// being broken.
				setError(result.message);
			}
		});
	}

	return (
		<form
			className="d-flex flex-wrap gap-2 align-items-start"
			onSubmit={submit}
		>
			<div className="dropdown" ref={wrapperRef}>
				<label className="visually-hidden" htmlFor="grant-person">
					Person to grant access to
				</label>
				<input
					id="grant-person"
					ref={toggleRef}
					type="text"
					className="form-control form-control-sm"
					role="combobox"
					aria-expanded={open}
					aria-controls="grant-person-listbox"
					aria-autocomplete="list"
					autoComplete="off"
					placeholder="Search Slack…"
					value={query}
					onChange={(event) => {
						setQuery(event.target.value);
						setSelected(null);
						setOpen(true);
					}}
					onFocus={() => setOpen(true)}
				/>

				{open && (
					<ul
						id="grant-person-listbox"
						className="dropdown-menu show py-1"
						role="listbox"
						style={
							{
								maxHeight: '18rem',
								overflowY: 'auto',
								'--bs-dropdown-font-size': '0.8125rem',
							} as React.CSSProperties
						}
					>
						{matches.length === 0 && (
							<li className="px-3 py-1 text-body-secondary small">
								Nobody in Slack matches that.
							</li>
						)}

						{matches.map((candidate) => {
							/**
							 * Someone who has signed in has a user row, so a Grant against
							 * their Slack id would never be claimed. Shown rather than
							 * omitted: a maintainer searching for a name they know is in
							 * Slack should find them and be told why they cannot be picked
							 * here, not find nothing.
							 */
							const unavailable =
								candidate.hasAccount || candidate.hasPendingGrant;
							const reason = candidate.hasAccount
								? 'has signed in — set their roles below'
								: 'already has access pending';

							return (
								<li key={candidate.id}>
									<button
										type="button"
										role="option"
										aria-selected={selected?.id === candidate.id}
										className="dropdown-item d-flex justify-content-between gap-3"
										disabled={unavailable}
										onClick={() => choose(candidate)}
									>
										<span>
											{candidate.displayName}
											{candidate.handle && (
												<span className="text-body-secondary">
													{' '}
													@{candidate.handle}
												</span>
											)}
										</span>
										{unavailable && (
											<span className="text-body-secondary small text-nowrap">
												{reason}
											</span>
										)}
									</button>
								</li>
							);
						})}
					</ul>
				)}
			</div>

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
						{ROLE_LABELS[option.name]}
					</option>
				))}
			</select>

			<button
				type="submit"
				className="btn btn-sm btn-primary text-nowrap"
				disabled={pending || !selected}
			>
				Grant access
			</button>

			{error && (
				<p className="text-danger small mb-0 w-100" role="alert">
					{error}
				</p>
			)}
		</form>
	);
}
