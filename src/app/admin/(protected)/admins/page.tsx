import { requirePermission } from '@/lib/adminAccess';
import { listAdmins, listGrantableUsers } from '@/lib/admins';
import { formatDate } from '../presentation';
import { GrantAccessForm, RoleCheckboxes } from './adminControls';

export const dynamic = 'force-dynamic';

export const metadata = {
	title: 'Admins · Admin',
	robots: { index: false, follow: false },
};

export default async function AdminsPage() {
	// Managing who has access is admin-only: the layout admits anyone holding
	// any section, so without this a narrow role could grant itself more.
	const session = await requirePermission('admins', 'read');
	const [admins, grantable] = await Promise.all([
		listAdmins(),
		listGrantableUsers(),
	]);

	return (
		<div className="container-fluid px-3 px-lg-4 py-4">
			<div className="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-3">
				<div>
					<h1 className="h4 mb-1">Admins</h1>
					<p className="text-body-secondary mb-0 small">
						{admins.length} {admins.length === 1 ? 'person' : 'people'} can
						reach /admin. A role grants one section; Admin grants all of them.
					</p>
				</div>
				<GrantAccessForm candidates={grantable} />
			</div>

			<div className="table-responsive">
				<table className="table align-middle">
					<thead>
						<tr className="small">
							<th scope="col">Person</th>
							<th scope="col">Access</th>
							<th scope="col">Granted</th>
							<th scope="col">By</th>
						</tr>
					</thead>
					<tbody>
						{admins.map((admin) => (
							<tr key={admin.id}>
								<td>
									<div className="fw-semibold">
										{admin.name}
										{admin.id === session?.user.id && (
											<span className="badge text-bg-light border ms-2">
												You
											</span>
										)}
									</div>
									<div className="text-body-secondary small">{admin.email}</div>
								</td>
								<td>
									<RoleCheckboxes
										userId={admin.id}
										name={admin.name}
										roles={admin.roles}
										isSelf={admin.id === session?.user.id}
									/>
								</td>
								<td className="small">{formatDate(admin.roleGrantedAt)}</td>
								<td className="small">{admin.roleGrantedBy ?? '—'}</td>
							</tr>
						))}
						{admins.length === 0 && (
							<tr>
								<td
									colSpan={4}
									className="text-body-secondary text-center py-4"
								>
									Nobody has access yet. The first person whose email is in{' '}
									<code>ADMIN_BOOTSTRAP_EMAILS</code> becomes an admin on
									sign-in.
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>

			<p className="text-body-secondary small mb-0">
				You can&rsquo;t remove your own Admin role — the cheapest way to avoid a
				community with zero admins.
			</p>
		</div>
	);
}
