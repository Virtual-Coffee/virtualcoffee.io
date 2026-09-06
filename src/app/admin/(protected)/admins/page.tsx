import { getSession } from '@/lib/adminAccess';
import { listAdmins, listGrantableUsers } from '@/lib/admins';
import { formatDate } from '../presentation';
import { AdminRowActions, GrantAdminForm } from './adminControls';

export const dynamic = 'force-dynamic';

export const metadata = {
	title: 'Admins · Admin',
	robots: { index: false, follow: false },
};

export default async function AdminsPage() {
	const session = await getSession();
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
						review applications.
					</p>
				</div>
				<GrantAdminForm candidates={grantable} />
			</div>

			<div className="table-responsive">
				<table className="table align-middle">
					<thead>
						<tr className="small">
							<th scope="col">Person</th>
							<th scope="col">Granted</th>
							<th scope="col">By</th>
							<th scope="col">
								<span className="visually-hidden">Actions</span>
							</th>
						</tr>
					</thead>
					<tbody>
						{admins.map((admin) => (
							<tr key={admin.id}>
								<td>
									<div className="fw-semibold">{admin.name}</div>
									<div className="text-body-secondary small">{admin.email}</div>
								</td>
								<td className="small">{formatDate(admin.roleGrantedAt)}</td>
								<td className="small">{admin.roleGrantedBy ?? '—'}</td>
								<td className="text-end">
									{admin.id === session?.user.id ? (
										<span className="text-body-secondary small">You</span>
									) : (
										<AdminRowActions userId={admin.id} name={admin.name} />
									)}
								</td>
							</tr>
						))}
						{admins.length === 0 && (
							<tr>
								<td
									colSpan={4}
									className="text-body-secondary text-center py-4"
								>
									No admins yet. The first person whose email is in{' '}
									<code>ADMIN_BOOTSTRAP_EMAILS</code> becomes one on sign-in.
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>

			<p className="text-body-secondary small mb-0">
				There&rsquo;s no Revoke on your own row — the cheapest way to avoid a
				community with zero admins.
			</p>
		</div>
	);
}
