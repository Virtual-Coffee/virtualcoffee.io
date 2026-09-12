'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import type { SlackMember } from '@/data/slackMembers';
import {
	addVolunteer,
	adjustBalance,
	resendInvite,
	setVolunteerActive,
} from './actions';
import type { ActionResult } from '@/lib/actionResult';

/** Run an action, show its message, refresh — shared by the four buttons here. */
function useAction() {
	const router = useRouter();
	const [result, setResult] = useState<ActionResult | null>(null);
	const [pending, startTransition] = useTransition();

	function run(action: () => Promise<ActionResult>) {
		startTransition(async () => {
			const outcome = await action();
			setResult(outcome);
			if (outcome.ok) router.refresh();
		});
	}

	const feedback = result && (
		<div
			className={`alert ${result.ok ? 'alert-success' : 'alert-danger'} mt-3`}
			role={result.ok ? 'status' : 'alert'}
		>
			{result.message}
		</div>
	);

	return { run, pending, feedback };
}

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
	const [roleLabels, setRoleLabels] = useState('');
	const [email, setEmail] = useState('');

	const matches = candidates
		.filter((member) =>
			`${member.displayName} ${member.name} ${member.handle}`
				.toLowerCase()
				.includes(query.trim().toLowerCase()),
		)
		.slice(0, 50);

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
					<label className="form-label" htmlFor="volunteer-roles">
						Community roles{' '}
						<span className="text-body-secondary">(optional)</span>
					</label>
					<input
						id="volunteer-roles"
						className="form-control"
						value={roleLabels}
						onChange={(event) => setRoleLabels(event.target.value)}
						placeholder="VC Host, Notetaker"
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
						setRoleLabels('');
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
	const [reason, setReason] = useState('');

	return (
		<form
			onSubmit={(event) => {
				event.preventDefault();
				run(() => adjustBalance(volunteerId, Number(delta), reason));
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
				disabled={pending || !reason.trim() || !delta.trim()}
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
