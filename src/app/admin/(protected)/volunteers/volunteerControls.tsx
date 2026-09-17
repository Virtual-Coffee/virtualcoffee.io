'use client';

import { useState } from 'react';

import { ActionDialog } from '@/components/ActionDialog';
import type { SlackMember } from '@/lib/slackMemberPicker';
import {
	COMMUNITY_ROLES,
	type CommunityRole,
	parseRoleLabels,
} from '@/lib/volunteerRoles';
import { useAction } from '@/util/forms/useAction';
import { RoleCheckboxMenu } from '../roleCheckboxMenu';
import { SlackMemberCombobox } from '../slackMemberCombobox';
import {
	addVolunteer,
	adjustBalance,
	resendInvite,
	setEmail,
	setRoleLabels,
	setVolunteerActive,
} from './actions';

type Candidate = SlackMember & { alreadyVolunteer: boolean };

/**
 * Make someone a Volunteer, picked out of the Slack directory. Existing
 * Volunteers are shown disabled with the reason rather than hidden.
 */
export function AddVolunteerForm({ candidates }: { candidates: Candidate[] }) {
	const { run, pending, feedback } = useAction();
	const [selected, setSelected] = useState<Candidate | null>(null);
	const [roleLabels, setRoleLabels] = useState<CommunityRole[]>([]);
	const [email, setEmail] = useState('');

	return (
		<div className="card">
			<div className="card-body">
				<h2 className="h6 text-body-secondary">Add a volunteer</h2>

				<div className="mb-3">
					<SlackMemberCombobox
						id="volunteer-search"
						label="Search Slack"
						placeholder="Name or @handle"
						candidates={candidates}
						selected={selected}
						disabled={pending}
						onSelect={(member) => {
							setSelected(member);
							// Prefilled, not locked: Slack's address is a good guess, and
							// the maintainer can still type over it.
							if (member?.email) setEmail(member.email);
						}}
						unavailable={(member) =>
							member.alreadyVolunteer ? 'already a volunteer' : null
						}
					/>
				</div>

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
						Filled in from their Slack profile when it has one. Without an
						address we can&rsquo;t tell them they can invite people, or nudge
						them each month.
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
						run(() => addVolunteer(selected.id, roleLabels, email), {
							onSuccess: () => {
								setSelected(null);
								setRoleLabels([]);
								setEmail('');
							},
						});
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
 * The Airtable roles list as a dropdown of checkboxes. `id` prefixes every
 * element id, so two on one page do not collide.
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
	return (
		<RoleCheckboxMenu
			id={id}
			labelledBy={`${id}-label`}
			size={size}
			disabled={disabled}
			scrollable
			label={selected.length === 0 ? 'Pick roles' : selected.join(', ')}
			options={COMMUNITY_ROLES.map((role) => ({ value: role, label: role }))}
			selected={selected}
			onToggle={(role) =>
				onChange(
					selected.includes(role)
						? selected.filter((entry) => entry !== role)
						: [...selected, role],
				)
			}
		/>
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

export function VolunteerEmailEditor({
	volunteerId,
	email,
}: {
	volunteerId: string;
	email: string | null;
}) {
	const { run, pending, feedback } = useAction();
	const saved = email ?? '';
	const [draft, setDraft] = useState(saved);
	const dirty = draft.trim().toLowerCase() !== saved;

	return (
		<form
			onSubmit={(event) => {
				event.preventDefault();
				run(() => setEmail(volunteerId, draft));
			}}
		>
			<label className="form-label small" htmlFor="edit-email">
				Email
			</label>
			<input
				id="edit-email"
				type="email"
				className="form-control form-control-sm"
				value={draft}
				disabled={pending}
				onChange={(event) => setDraft(event.target.value)}
			/>
			<button
				type="submit"
				className="btn btn-sm btn-outline-primary mt-2"
				disabled={pending || !dirty}
			>
				{pending ? 'Saving…' : 'Save email'}
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
	return (
		<ActionDialog
			className={`btn btn-sm ${
				active ? 'btn-outline-secondary' : 'btn-outline-primary'
			}`}
			label={active ? 'Pause' : 'Restart'}
			title={active ? `Pause ${name}?` : `Restart ${name}?`}
			action={() => setVolunteerActive(volunteerId, !active)}
		>
			<p className="mb-0">
				{active
					? 'They keep their balance but stop earning and can’t send invites.'
					: 'They can send invites again and will earn one on the 1st.'}
			</p>
		</ActionDialog>
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
				// The reason stays for a retry if the action refuses it.
				run(() => adjustBalance(volunteerId, parsedDelta, reason), {
					onSuccess: () => setReason(''),
				});
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
	return (
		<ActionDialog
			className="btn btn-sm btn-outline-secondary"
			label="Re-send"
			title={`Re-send to ${inviteeEmail}?`}
			pendingLabel="Sending…"
			action={() => resendInvite(inviteId, volunteerId)}
		>
			<p className="mb-0">
				This issues a new link and stops the old one working.
			</p>
		</ActionDialog>
	);
}
