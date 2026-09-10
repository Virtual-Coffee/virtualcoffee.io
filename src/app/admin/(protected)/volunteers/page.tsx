import Link from 'next/link';

import { getSlackMembers } from '@/data/slackMembers';
import { requirePermission } from '@/lib/adminAccess';
import { listVolunteers } from '@/lib/volunteers';
import { formatDate } from '../presentation';
import { VolunteerStateBadge } from './presentation';
import { AddVolunteerForm } from './volunteerControls';

export const dynamic = 'force-dynamic';

export const metadata = {
	title: 'Volunteers · Admin',
	robots: { index: false, follow: false },
};

export default async function VolunteersPage() {
	await requirePermission('volunteers', 'read');

	const [volunteers, members] = await Promise.all([
		listVolunteers(),
		getSlackMembers(),
	]);

	const known = new Set(volunteers.map((row) => row.slackUserId));
	const candidates = members.map((member) => ({
		...member,
		alreadyVolunteer: known.has(member.id),
	}));

	const active = volunteers.filter((row) => row.deactivatedAt === null);
	const totalBalance = active.reduce((sum, row) => sum + row.balance, 0);

	return (
		<div className="container-fluid px-3 px-lg-4 py-4">
			<h1 className="h4 mb-1">Volunteers</h1>
			<p className="text-body-secondary">
				{active.length} active, holding {totalBalance} invite
				{totalBalance === 1 ? '' : 's'} between them. Everyone here earns one
				more on the 1st of the month.
			</p>

			<div className="row g-4 mt-0">
				<div className="col-lg-8">
					{volunteers.length === 0 ? (
						<div className="text-center py-5">
							<p className="h5">No volunteers yet</p>
							<p className="text-body-secondary mb-0">
								Add someone from Slack to let them start inviting people.
							</p>
						</div>
					) : (
						<>
							<div className="table-responsive d-none d-md-block">
								<table className="table table-hover align-middle mb-0">
									<thead>
										<tr>
											<th scope="col">Volunteer</th>
											<th scope="col">State</th>
											<th scope="col" className="text-end">
												Invites left
											</th>
											<th scope="col" className="text-end">
												Sent
											</th>
											<th scope="col">Added</th>
										</tr>
									</thead>
									<tbody>
										{volunteers.map((row) => (
											<tr key={row.id}>
												<td>
													<Link href={`/admin/volunteers/${row.id}`}>
														{row.slackDisplayName}
													</Link>
													<div className="text-body-secondary small">
														{row.slackHandle ? `@${row.slackHandle}` : '—'}
														{/*
														 * A Volunteer who has never signed in is a normal
														 * state, not a problem: their access is waiting as
														 * a Pending Grant. Worth showing, because it
														 * explains why they have not used anything.
														 */}
														{row.userId === null && ' · hasn’t signed in'}
													</div>
												</td>
												<td>
													<VolunteerStateBadge
														deactivatedAt={row.deactivatedAt}
													/>
												</td>
												<td className="text-end">{row.balance}</td>
												<td className="text-end">{row.invitesSent}</td>
												<td>{formatDate(row.createdAt)}</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>

							<ul className="list-unstyled d-md-none mb-0">
								{volunteers.map((row) => (
									<li key={row.id} className="border-bottom py-3">
										<div className="d-flex justify-content-between gap-2">
											<Link href={`/admin/volunteers/${row.id}`}>
												{row.slackDisplayName}
											</Link>
											<VolunteerStateBadge deactivatedAt={row.deactivatedAt} />
										</div>
										<div className="text-body-secondary small mt-1">
											{row.balance} left · {row.invitesSent} sent
										</div>
									</li>
								))}
							</ul>
						</>
					)}
				</div>

				<div className="col-lg-4">
					<AddVolunteerForm candidates={candidates} />
				</div>
			</div>
		</div>
	);
}
