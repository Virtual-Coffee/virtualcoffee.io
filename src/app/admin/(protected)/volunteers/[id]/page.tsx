import Link from 'next/link';
import { notFound } from 'next/navigation';

import { isId } from '@/db/ids';
import { requirePermission, sessionCan } from '@/lib/access/adminAccess';
import { history } from '@/lib/history/eventLog';
import {
	getVolunteerById,
	volunteerInvites,
	volunteerLedger,
	volunteerSubject,
} from '@/lib/volunteers/volunteers';
import { HistoryTimeline } from '../../historyTimeline';
import {
	Breadcrumb,
	formatDate,
	formatDateTime,
	ReadOnlyNotice,
} from '../../presentation';
import {
	AdminInviteBadge,
	LEDGER_LABELS,
	RoleChips,
	VolunteerStateBadge,
} from '../presentation';
import {
	ActiveToggle,
	AdjustBalanceForm,
	ResendInviteButton,
	VolunteerEmailEditor,
	VolunteerRolesEditor,
} from '../volunteerControls';

export const dynamic = 'force-dynamic';

export const metadata = {
	title: 'Volunteer · Admin',
	robots: { index: false, follow: false },
};

export default async function VolunteerDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const session = await requirePermission('volunteers', 'read');

	// The link goes to another Section's screen; ask rather than assume.
	const canOpenApplications = sessionCan(session, 'waitlist', 'read');
	// The actions re-check for themselves; this only keeps a read-only viewer
	// from being shown controls that would 404 on them.
	const canManage = sessionCan(session, 'volunteers', 'manage');

	const { id } = await params;

	if (!isId(id)) notFound();

	const volunteer = await getVolunteerById(id);
	if (!volunteer) notFound();

	const [ledger, invites, entries] = await Promise.all([
		volunteerLedger(volunteer.slackUserId),
		volunteerInvites(volunteer.slackUserId),
		history(volunteerSubject(volunteer.id)),
	]);

	const balance = ledger.reduce((sum, entry) => sum + entry.delta, 0);

	return (
		<div className="container-fluid px-3 px-lg-4 py-4">
			<Breadcrumb
				parent={{ href: '/admin/volunteers', label: 'Volunteers' }}
				current={volunteer.slackDisplayName}
			/>

			<div className="d-flex flex-wrap align-items-center gap-2 mb-1">
				<h1 className="h4 mb-0">{volunteer.slackDisplayName}</h1>
				<VolunteerStateBadge deactivatedAt={volunteer.deactivatedAt} />
			</div>
			<p className="text-body-secondary mb-2">
				{volunteer.slackHandle ? `@${volunteer.slackHandle}` : 'No handle'}
				{' · '}
				{volunteer.email ?? 'no email'}
				{volunteer.userId === null && ' · hasn’t signed in yet'}
			</p>
			<div className="mb-4">
				<RoleChips roleLabels={volunteer.roleLabels} />
			</div>

			<div className="row g-4">
				<div className="col-lg-7">
					<h2 className="h6 text-body-secondary mb-3">Invites sent</h2>

					{invites.length === 0 ? (
						<p className="text-body-secondary">
							They haven&rsquo;t sent any invites yet.
						</p>
					) : (
						<div className="table-responsive">
							<table className="table table-hover align-middle mb-0">
								<thead>
									<tr>
										<th scope="col">Who</th>
										<th scope="col">Sent</th>
										<th scope="col">State</th>
										<th scope="col">
											<span className="visually-hidden">Actions</span>
										</th>
									</tr>
								</thead>
								<tbody>
									{invites.map((row) => (
										<tr key={row.id}>
											<td>
												{/*
												 * Linked only where the Invite was actually claimed:
												 * a pending, expired or cancelled one has no
												 * application behind it to open.
												 */}
												{row.applicationId && canOpenApplications ? (
													<Link href={`/admin/waitlist/${row.applicationId}`}>
														{row.inviteeName || 'View application'}
													</Link>
												) : (
													<div>{row.inviteeName || '—'}</div>
												)}
												<div className="text-body-secondary small">
													{row.inviteeEmail || '—'}
													{row.applicationReference !== null &&
														` · Application ${row.applicationReference}`}
												</div>
											</td>
											<td>{formatDate(row.createdAt)}</td>
											<td>
												<AdminInviteBadge status={row.status} />
											</td>
											<td className="text-end">
												{canManage &&
													row.status === 'pending' &&
													row.inviteeEmail &&
													row.tokenExpiresAt && (
														<ResendInviteButton
															inviteId={row.id}
															volunteerId={volunteer.id}
															inviteeEmail={row.inviteeEmail}
														/>
													)}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}

					<h2 className="h6 text-body-secondary mt-4 mb-3">
						Allowance history
					</h2>
					<ol className="list-unstyled mb-0">
						{ledger.map((entry) => (
							<li key={entry.id} className="border-bottom py-2">
								<div className="d-flex justify-content-between gap-3">
									<span>
										{LEDGER_LABELS[entry.reason]}
										{entry.periodKey && (
											<span className="text-body-secondary">
												{' '}
												({entry.periodKey})
											</span>
										)}
									</span>
									<span
										className={
											entry.delta > 0 ? 'text-success' : 'text-body-secondary'
										}
									>
										{entry.delta > 0 ? `+${entry.delta}` : entry.delta}
									</span>
								</div>
								{entry.body && (
									<div className="text-body-secondary small">{entry.body}</div>
								)}
								<div className="text-body-secondary small">
									{formatDateTime(entry.createdAt)}
								</div>
							</li>
						))}
					</ol>

					<h2 className="h6 text-body-secondary mt-4 mb-3">History</h2>
					<HistoryTimeline history={entries} />
				</div>

				<div className="col-lg-5">
					<div className="card mb-4">
						<div className="card-body">
							<h2 className="h6 text-body-secondary">Invites available</h2>
							<p className="display-6 mb-3">{balance}</p>
							{canManage ? (
								<AdjustBalanceForm volunteerId={volunteer.id} />
							) : (
								<ReadOnlyNotice />
							)}
						</div>
					</div>

					<div className="card mb-4">
						<div className="card-body">
							<h2 className="h6 text-body-secondary">Community roles</h2>
							<p className="small text-body-secondary">
								Just a note for other maintainers. These grant nothing.
							</p>
							{canManage ? (
								<VolunteerRolesEditor
									volunteerId={volunteer.id}
									roleLabels={volunteer.roleLabels}
								/>
							) : (
								<ReadOnlyNotice />
							)}
						</div>
					</div>

					<div className="card mb-4">
						<div className="card-body">
							<h2 className="h6 text-body-secondary">Contact</h2>
							<p className="small text-body-secondary">
								Where the monthly invite goes. Leave it empty to fall back to
								the email on their account once they have signed in.
							</p>
							{canManage ? (
								<VolunteerEmailEditor
									volunteerId={volunteer.id}
									email={volunteer.email}
								/>
							) : (
								<ReadOnlyNotice />
							)}
						</div>
					</div>

					<div className="card">
						<div className="card-body">
							<h2 className="h6 text-body-secondary">Volunteering</h2>
							<p className="small text-body-secondary">
								Pausing removes their access to /invites and stops the monthly
								invite. Their balance and history are kept.
							</p>
							{canManage ? (
								<ActiveToggle
									volunteerId={volunteer.id}
									name={volunteer.slackDisplayName}
									active={volunteer.deactivatedAt === null}
								/>
							) : (
								<ReadOnlyNotice />
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
