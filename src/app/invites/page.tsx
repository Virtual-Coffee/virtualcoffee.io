import Link from 'next/link';

import { SignOutButton } from '@/app/admin/sign-in/buttons';
import { getVolunteer, listInvitesFor, volunteerBalance } from '@/lib/invites';
import { requireVolunteer } from '@/lib/volunteerAccess';
import { formatDate, InviteStatusBadge } from './presentation';

export const dynamic = 'force-dynamic';

export const metadata = {
	title: 'Your invites',
	robots: { index: false, follow: false },
};

export default async function InvitesPage() {
	const { session, slackUserId } = await requireVolunteer();

	const [volunteer, balance, invites] = await Promise.all([
		getVolunteer(slackUserId),
		volunteerBalance(slackUserId),
		listInvitesFor(slackUserId),
	]);

	return (
		<div className="container-fluid px-3 px-lg-4 py-4">
			<div className="d-flex flex-wrap align-items-start gap-3 mb-4">
				<div className="me-auto">
					<h1 className="h4 mb-1">Your invites</h1>
					<p className="text-body-secondary mb-0">
						Invite someone straight to the front of the waitlist.
					</p>
				</div>
				<div className="d-flex align-items-center gap-2">
					<span className="text-body-secondary small">
						{session.user.name || session.user.email}
					</span>
					<SignOutButton />
				</div>
			</div>

			{!volunteer && (
				<div className="alert alert-warning" role="alert">
					<h2 className="h6 alert-heading">We haven&rsquo;t set you up yet</h2>
					<p className="mb-0">
						You have Volunteer access, but there&rsquo;s no volunteer record to
						hang your invites on. Ask a maintainer to add you in Admin →
						Volunteers.
					</p>
				</div>
			)}

			<div className="row g-4">
				<div className="col-lg-5">
					<div className="card">
						<div className="card-body">
							<h2 className="h6 text-body-secondary">Invites available</h2>
							<p className="display-6 mb-1">{balance}</p>
							<p className="text-body-secondary small mb-0">
								You get one more on the 1st of each month. They don&rsquo;t
								expire.
							</p>
						</div>
					</div>
				</div>

				<div className="col-lg-7">
					<h2 className="h6 text-body-secondary mb-3">
						Invites you&rsquo;ve sent
					</h2>

					{invites.length === 0 ? (
						<div className="text-center py-5">
							<p className="h5">No invites yet</p>
							<p className="text-body-secondary mb-0">
								When you invite someone, they&rsquo;ll show up here.
							</p>
						</div>
					) : (
						<>
							<div className="table-responsive d-none d-md-block">
								<table className="table table-hover align-middle mb-0">
									<thead>
										<tr>
											<th scope="col">Who</th>
											<th scope="col">Sent</th>
											<th scope="col">Status</th>
										</tr>
									</thead>
									<tbody>
										{invites.map((row) => (
											<tr key={row.id}>
												<td>
													<div>{row.inviteeName || '—'}</div>
													<div className="text-body-secondary small">
														{row.inviteeEmail || '—'}
													</div>
												</td>
												<td>{formatDate(row.createdAt)}</td>
												<td>
													<InviteStatusBadge status={row.status} />
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>

							<ul className="list-unstyled d-md-none mb-0">
								{invites.map((row) => (
									<li key={row.id} className="border-bottom py-3">
										<div className="d-flex justify-content-between gap-2">
											<div>
												<div>{row.inviteeName || '—'}</div>
												<div className="text-body-secondary small">
													{row.inviteeEmail || '—'}
												</div>
											</div>
											<InviteStatusBadge status={row.status} />
										</div>
										<div className="text-body-secondary small mt-1">
											Sent {formatDate(row.createdAt)}
										</div>
									</li>
								))}
							</ul>
						</>
					)}
				</div>
			</div>

			<p className="mt-4 mb-0">
				<Link href="/">Back to virtualcoffee.io</Link>
			</p>
		</div>
	);
}
