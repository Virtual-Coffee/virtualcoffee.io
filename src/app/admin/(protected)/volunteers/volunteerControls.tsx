'use client';

import { useState } from 'react';

import { filterSlackMembers, type SlackMember } from '@/lib/slackMemberPicker';
import {
	COMMUNITY_ROLES,
	type CommunityRole,
	parseRoleLabels,
} from '@/lib/volunteerRoles';
import { useAction } from '@/util/forms/useAction';
import { useDropdown } from '../useDropdown';
import {
	addVolunteer,
	adjustBalance,
	resendInvite,
	setRoleLabels,
	setVolunteerActive,
} from './actions';

/**
 * Make someone a Volunteer, picked out of the Slack directory. Existing
 * Volunteers are shown disabled with the reason rather than hidden.
 */
export function AddVolunteerForm({
	candidates,
}: {
	candidates: (SlackMember & { alreadyVolunteer: boolean })[];
}) {
	const { run, pending, feedback } = useAction();
	const [query, setQuery] = useState('');
	const [selected, setSelected] = useState<string | null>(null);
	const [roleLabels, setRoleLabels] = useState<CommunityRole[]>([]);
	const [email, setEmail] = useState('');

	const matches = filterSlackMembers(candidates, query);

	return (
		<div className="card">
			<div className="card-body">
				<h2 className="h6 text-body-secondary">Add a volunteer</h2>

				<div className="mb-3">
					<label className="form-label" htmlFor="volunteer-search">
						Search Slack
					</label>
					<input
						id="volunteer-search"
						className="form-control"
						value={query}
						onChange={(event) => {
							setQuery(event.target.value);
							setSelected(null);
						}}
						placeholder="Name or @handle"
					/>
				</div>

				{query.trim() && (
					<ul
						className="list-unstyled border rounded mb-3 overflow-auto"
						style={{ maxHeight: '14rem' }}
					>
						{matches.length === 0 && (
							<li className="px-3 py-2 text-body-secondary small">
								Nobody matches that.
							</li>
						)}
						{matches.map((member) => (
							<li key={member.id} className="border-bottom">
								<button
									type="button"
									className={`btn btn-link text-decoration-none text-start w-100 px-3 py-2${
										selected === member.id ? ' fw-semibold' : ''
									}`}
									disabled={member.alreadyVolunteer || pending}
									onClick={() => setSelected(member.id)}
								>
									{member.displayName}
									<span className="d-block small text-body-secondary">
										@{member.handle}
										{member.alreadyVolunteer && ' · already a volunteer'}
									</span>
								</button>
							</li>
						))}
					</ul>
				)}

				<div className="mb-3">
					<label className="form-label" htmlFor="volunteer-email">
						Email <span className="text-body-secondary">(optional)</span>
					</label>
					<input
						id="volunteer-email"
						type="email"
						className="form-control"
						value={email}
						onChange={(event) => setEmail(event.target.value)}
					/>
					<div className="form-text">
						Slack doesn&rsquo;t give us addresses, so without one we can&rsquo;t
						tell them they can invite people, or nudge them each month.
					</div>
				</div>

				<div className="mb-3">
					<div className="form-label" id="volunteer-roles-label">
						Community roles{' '}
						<span className="text-body-secondary">(optional)</span>
					</div>
					<CommunityRolesDropdown
						id="volunteer-roles"
						selected={roleLabels}
						disabled={pending}
						onChange={setRoleLabels}
					/>
					<div className="form-text">
						Just a note for other maintainers. These grant nothing.
					</div>
				</div>

				<button
					type="button"
					className="btn btn-primary"
					disabled={!selected || pending}
					onClick={() => {
						if (!selected) return;
						run(() => addVolunteer(selected, roleLabels, email));
						setSelected(null);
						setQuery('');
						setRoleLabels([]);
						setEmail('');
					}}
				>
					{pending ? 'Adding…' : 'Add volunteer'}
				</button>

				{feedback}
			</div>
		</div>
	);
}

/**
 * The Airtable roles list as a dropdown of checkboxes, the same shape as the
 * User Management `RolesDropdown` minus the Save step: this is form state, and
 * the enclosing form's button is the commit. `id` prefixes every element id,
 * so two on one page do not collide.
 */
function CommunityRolesDropdown({
	id,
	selected,
	disabled,
	size,
	onChange,
}: {
	id: string;
	selected: CommunityRole[];
	disabled: boolean;
	size?: 'sm';
	onChange: (roles: CommunityRole[]) => void;
}) {
	const { open, setOpen, wrapperRef, toggleRef } = useDropdown<
		HTMLDivElement,
		HTMLButtonElement
	>();
	const menuId = `${id}-menu`;

	return (
		<div className="dropdown" ref={wrapperRef}>
			<button
				type="button"
				ref={toggleRef}
				className={`btn btn-outline-secondary dropdown-toggle${
					size === 'sm' ? ' btn-sm' : ''
				}`}
				aria-labelledby={`${id}-label`}
				aria-expanded={open}
				aria-haspopup="true"
				aria-controls={menuId}
				disabled={disabled}
				onClick={() => setOpen((wasOpen) => !wasOpen)}
			>
				{selected.length === 0 ? 'Pick roles' : selected.join(', ')}
			</button>

			{open && (
				<ul
					id={menuId}
					className="dropdown-menu show py-1 overflow-auto"
					style={
						{
							'--bs-dropdown-font-size': '0.8125rem',
							maxHeight: '18rem',
						} as React.CSSProperties
					}
				>
					{COMMUNITY_ROLES.map((role) => {
						const inputId = `${id}-${role.replace(/[^a-z0-9]+/gi, '-')}`;
						return (
							<li key={role} className="px-3">
								<div className="form-check py-1 mb-0 lh-sm">
									<input
										className="form-check-input"
										type="checkbox"
										id={inputId}
										checked={selected.includes(role)}
										onChange={() =>
											onChange(
												selected.includes(role)
													? selected.filter((entry) => entry !== role)
													: [...selected, role],
											)
										}
									/>
									<label className="form-check-label" htmlFor={inputId}>
										{role}
									</label>
								</div>
							</li>
						);
					})}
				</ul>
			)}
		</div>
	);
}

/** A known role is one on the list; the column can hold others, which Save drops. */
function knownRoles(roleLabels: string | null): CommunityRole[] {
	return parseRoleLabels(roleLabels).filter((label): label is CommunityRole =>
		(COMMUNITY_ROLES as readonly string[]).includes(label),
	);
}

export function VolunteerRolesEditor({
	volunteerId,
	roleLabels,
}: {
	volunteerId: string;
	roleLabels: string | null;
}) {
	const { run, pending, feedback } = useAction();
	const saved = knownRoles(roleLabels);
	const [draft, setDraft] = useState<CommunityRole[]>(saved);

	const dirty =
		draft.length !== saved.length ||
		draft.some((role) => !saved.includes(role));

	return (
		<form
			onSubmit={(event) => {
				event.preventDefault();
				run(() => setRoleLabels(volunteerId, draft));
			}}
		>
			{/* The card heading already says it; this only names the toggle. */}
			<div className="visually-hidden" id="edit-roles-label">
				Community roles
			</div>
			<CommunityRolesDropdown
				id="edit-roles"
				size="sm"
				selected={draft}
				disabled={pending}
				onChange={setDraft}
			/>
			<button
				type="submit"
				className="btn btn-sm btn-outline-primary mt-2"
				disabled={pending || !dirty}
			>
				{pending ? 'Saving…' : 'Save roles'}
			</button>
			{feedback}
		</form>
	);
}

export function ActiveToggle({
	volunteerId,
	name,
	active,
}: {
	volunteerId: string;
	name: string;
	active: boolean;
}) {
	const { run, pending, feedback } = useAction();

	return (
		<>
			<button
				type="button"
				className={`btn btn-sm ${
					active ? 'btn-outline-secondary' : 'btn-outline-primary'
				}`}
				disabled={pending}
				onClick={() => {
					const message = active
						? `Pause ${name}? They keep their balance but stop earning and can't send invites.`
						: `Restart ${name}? They can send invites again and will earn one on the 1st.`;
					if (!window.confirm(message)) return;
					run(() => setVolunteerActive(volunteerId, !active));
				}}
			>
				{pending ? '…' : active ? 'Pause' : 'Restart'}
			</button>
			{feedback}
		</>
	);
}

export function AdjustBalanceForm({ volunteerId }: { volunteerId: string }) {
	const { run, pending, feedback } = useAction();
	const [delta, setDelta] = useState('1');
	// The action refuses anything else; the button just says so first.
	const parsedDelta = Number(delta.trim());
	const validDelta =
		delta.trim() !== '' && Number.isInteger(parsedDelta) && parsedDelta !== 0;
	const [reason, setReason] = useState('');

	return (
		<form
			onSubmit={(event) => {
				event.preventDefault();
				run(() => adjustBalance(volunteerId, parsedDelta, reason));
				setReason('');
			}}
		>
			<div className="row g-2 align-items-end">
				<div className="col-4">
					<label className="form-label small" htmlFor="delta">
						Invites
					</label>
					<input
						id="delta"
						type="number"
						step={1}
						className="form-control form-control-sm"
						value={delta}
						onChange={(event) => setDelta(event.target.value)}
					/>
				</div>
				<div className="col-8">
					<label className="form-label small" htmlFor="delta-reason">
						Why
					</label>
					<input
						id="delta-reason"
						className="form-control form-control-sm"
						value={reason}
						onChange={(event) => setReason(event.target.value)}
						placeholder="Recruitment push"
					/>
				</div>
			</div>
			<button
				type="submit"
				className="btn btn-sm btn-outline-primary mt-2"
				disabled={pending || !reason.trim() || !validDelta}
			>
				{pending ? 'Saving…' : 'Adjust balance'}
			</button>
			<div className="form-text">
				A negative number takes invites away. This is recorded in the ledger.
			</div>
			{feedback}
		</form>
	);
}

export function ResendInviteButton({
	inviteId,
	volunteerId,
	inviteeEmail,
}: {
	inviteId: string;
	volunteerId: string;
	inviteeEmail: string;
}) {
	const { run, pending, feedback } = useAction();

	return (
		<>
			<button
				type="button"
				className="btn btn-sm btn-outline-secondary"
				disabled={pending}
				onClick={() => {
					if (
						!window.confirm(
							`Re-send to ${inviteeEmail}? This issues a new link and stops the old one working.`,
						)
					) {
						return;
					}
					run(() => resendInvite(inviteId, volunteerId));
				}}
			>
				{pending ? 'Sending…' : 'Re-send'}
			</button>
			{feedback}
		</>
	);
}
