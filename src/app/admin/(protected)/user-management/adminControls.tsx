'use client';

import { useMemo, useState } from 'react';

import { filterSlackMembers } from '@/data/slackMembers';
import type { GrantCandidate } from '@/lib/access/admins';
import {
	GRANTABLE_ROLE_NAMES,
	GRANTABLE_ROLES,
	ROLE_LABELS,
	type RoleName,
} from '@/lib/access/permissions';
import { useAction } from '@/util/forms/useAction';
import { type CheckboxMenuOption, RoleCheckboxMenu } from '../roleCheckboxMenu';
import { useDropdown } from '../useDropdown';
import {
	grantPendingAccess,
	revokePendingGrant,
	setPendingGrantRoles,
	setUserRoles,
} from './actions';

/**
 * The roles one person holds, as a dropdown of checkboxes. Changes are staged
 * and written together on Save as the whole grantable set, so the server never
 * merges a stale client view; Cancel, Escape and clicking away discard the
 * draft. `volunteer` is not grantable here and is carried over by
 * `preserveUngrantedRoles`. A row is backed by a user or a Pending Grant —
 * same control, different action.
 *
 * A stranded row shows the Grant that failed to apply at sign-in; saving it,
 * changed or not, is what applies it.
 */
export function RolesDropdown({
	kind,
	id,
	name,
	roles,
	stranded,
	isSelf,
}: {
	kind: 'user' | 'pending';
	id: string;
	name: string;
	roles: RoleName[];
	stranded: boolean;
	isSelf: boolean;
}) {
	const { run, pending, error } = useAction();

	const grantable = roles.filter((role) => GRANTABLE_ROLE_NAMES.has(role));

	/**
	 * Seeded from `grantable` each time the menu opens, not in an effect: the
	 * menu closes on Escape and outside clicks without telling us, and reseeding
	 * on open is what makes those discard the draft.
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

	/**
	 * The menu stays open on failure: the error renders under the chips, and
	 * the draft is still there to fix and retry.
	 */
	function save(close: () => void) {
		run(
			() =>
				kind === 'user'
					? setUserRoles(id, draft)
					: setPendingGrantRoles(id, draft),
			{ onSuccess: close },
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
		if (!window.confirm(`Revoke every /admin role for ${name}?`)) return;

		run(() =>
			kind === 'user' ? setUserRoles(id, []) : revokePendingGrant(id),
		);
	}

	const options: CheckboxMenuOption<RoleName>[] = GRANTABLE_ROLES.map(
		(role) => ({
			value: role.name,
			label: ROLE_LABELS[role.name],
			description: role.description,
			// Removing your own admin role is refused server-side too; the
			// disabled box just avoids offering an action that cannot work.
			disabled:
				pending || (isSelf && role.name === 'admin' && roles.includes('admin')),
		}),
	);

	return (
		<RoleCheckboxMenu
			id={id}
			menuId={`${id}-roles-menu`}
			size="sm"
			label={
				<>
					Roles
					{roles.length > 0 && (
						<span className="badge text-bg-secondary ms-2">{roles.length}</span>
					)}
				</>
			}
			options={options}
			selected={draft}
			onToggle={toggleDraft}
			onOpen={() => setDraft(grantable)}
			footer={(close) => (
				<>
					<li>
						<hr className="dropdown-divider" />
					</li>
					<li className="px-3 py-1 d-flex gap-2">
						<button
							type="button"
							className="btn btn-sm btn-primary"
							disabled={pending || (!dirty && !stranded)}
							onClick={() => save(close)}
						>
							{stranded ? 'Apply' : 'Save'}
						</button>
						<button
							type="button"
							className="btn btn-sm btn-outline-secondary"
							disabled={pending}
							onClick={close}
						>
							Cancel
						</button>
					</li>

					{!isSelf &&
						(kind === 'user'
							? grantable.length > 0
							: roles.length === grantable.length) && (
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
											close();
											revokeAll();
										}}
									>
										Revoke /admin roles
									</button>
								</li>
							</>
						)}
				</>
			)}
		>
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
		</RoleCheckboxMenu>
	);
}

/**
 * Give a Role to someone in the Slack workspace who is not yet in the table:
 * pre-provisioned if they have never signed in, applied directly if they have.
 * Candidates come from Slack, not `user`: the point is to reach someone who
 * has never visited the site.
 */
export function GrantAccessForm({
	candidates,
}: {
	candidates: GrantCandidate[];
}) {
	const [query, setQuery] = useState('');
	const [selected, setSelected] = useState<GrantCandidate | null>(null);
	const [role, setRole] = useState<RoleName>('admin');
	const { run, pending, error, clear } = useAction();
	const { open, setOpen, wrapperRef, toggleRef } = useDropdown<
		HTMLDivElement,
		HTMLInputElement
	>();

	const matches = useMemo(
		() => filterSlackMembers(candidates, query),
		[candidates, query],
	);

	function choose(candidate: GrantCandidate) {
		setSelected(candidate);
		setQuery(candidate.displayName);
		clear();
		setOpen(false);
	}

	// The error the hook keeps is load-bearing here: the server can still
	// refuse (a sign-in or a grant that landed since the page loaded), and a
	// silent refusal reads as the button being broken.
	function submit(event: React.FormEvent) {
		event.preventDefault();
		if (!selected) return;

		run(() => grantPendingAccess(selected.id, [role]), {
			onSuccess: () => {
				setSelected(null);
				setQuery('');
			},
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
							 * Someone already in the table is edited there. Shown rather
							 * than omitted: a maintainer searching for a name they know is
							 * in Slack should find them and be told why they cannot be
							 * picked here, not find nothing. Someone who signed in holding
							 * nothing is not in the table, so they are offered here and
							 * granted directly rather than pre-provisioned.
							 */
							const unavailable =
								candidate.account === 'hasRoles' || candidate.hasPendingGrant;
							const note = candidate.hasPendingGrant
								? 'already has access pending'
								: candidate.account === 'hasRoles'
									? 'has signed in — set their roles below'
									: candidate.account === 'noRoles'
										? 'signed in — granted immediately'
										: null;

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
										{note && (
											<span className="text-body-secondary small text-nowrap">
												{note}
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
