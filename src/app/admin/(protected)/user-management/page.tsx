import { requirePermission } from '@/lib/adminAccess';
import { grantCandidates, listAccessRows } from '@/lib/admins';
import { GrantAccessForm } from './adminControls';
import { AdminsTable } from './adminsTable';

export const dynamic = 'force-dynamic';

export const metadata = {
	title: 'User Management · Admin',
	robots: { index: false, follow: false },
};

export default async function AdminsPage() {
	// Managing who has access is admin-only: the layout admits anyone holding
	// any section, so without this a narrow role could grant itself more.
	const session = await requirePermission('admins', 'read');
	const [rows, candidates] = await Promise.all([
		listAccessRows(),
		grantCandidates(),
	]);

	const pending = rows.filter((row) => row.kind === 'pending').length;

	return (
		<div className="container-fluid px-3 px-lg-4 py-4">
			<div className="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-3">
				<div>
					<h1 className="h4 mb-1">User Management</h1>
					<p className="text-body-secondary mb-0 small">
						{rows.length} {rows.length === 1 ? 'person' : 'people'} can reach
						/admin. A role grants one section; Admin grants all of them.
						{pending > 0 && (
							<>
								{' '}
								{pending} {pending === 1 ? 'has' : 'have'} not signed in yet —
								their roles apply the first time they do.
							</>
						)}
					</p>
				</div>
				<GrantAccessForm candidates={candidates} />
			</div>

			<AdminsTable rows={rows} currentUserId={session?.user.id ?? null} />

			<p className="text-body-secondary small mb-0">
				You can&rsquo;t remove your own Admin role — the cheapest way to avoid a
				community with zero admins.
			</p>
		</div>
	);
}
