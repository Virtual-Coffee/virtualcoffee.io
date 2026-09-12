import Link from 'next/link';

import { requirePermission } from '@/lib/adminAccess';
import {
	ARCHIVE_STATUSES,
	listApplications,
	statusCounts,
} from '@/lib/applications';
import { ApplicationsTable } from '../applicationsTable';
import { QueueSearch } from '../queueSearch';
import { parseSearchParams } from '../searchParams';
import type { RawSearchParams } from '../../searchParams';

export const dynamic = 'force-dynamic';

export const metadata = {
	title: 'Archive · Admin',
	robots: { index: false, follow: false },
};

const STATUS_FILTERS = [
	{ value: 'all', label: 'All statuses' },
	{ value: 'member', label: 'Members' },
	{ value: 'lapsed', label: 'Lapsed' },
	{ value: 'declined', label: 'Declined' },
	{ value: 'withdrawn', label: 'Withdrawn' },
];

/**
 * Here a table is the right shape: thousands of rows, nobody reading prose,
 * and the job is find-and-sort. That difference in task is the reason this is
 * a separate screen from the queue rather than another filter on it.
 */
export default async function ArchivePage({
	searchParams,
}: {
	searchParams: Promise<RawSearchParams>;
}) {
	await requirePermission('waitlist', 'read');

	const params = await searchParams;
	const parsed = parseSearchParams(params, ARCHIVE_STATUSES);
	// "All statuses" here means all *archive* statuses. Queue rows belong on the
	// queue; `?status=all` clears the filter in `parseSearchParams`, so it is
	// put back rather than letting the archive list the Waitlist as well.
	const filters = { ...parsed, statuses: parsed.statuses ?? ARCHIVE_STATUSES };

	const [{ rows, rowCount }, counts] = await Promise.all([
		listApplications(filters),
		statusCounts(),
	]);

	const archived = ARCHIVE_STATUSES.reduce(
		(sum, status) => sum + (counts[status] ?? 0),
		0,
	);
	const active = (params.status as string | undefined) ?? 'all';

	return (
		<div className="container-fluid px-3 px-lg-4 py-4">
			<div className="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-3">
				<div>
					<h1 className="h4 mb-1">Archive</h1>
					<p className="text-body-secondary mb-0 small">
						{archived} applications · {counts.lapsed ?? 0} lapsed ·{' '}
						{counts.member ?? 0} members
					</p>
				</div>
				<QueueSearch initialValue={filters.search ?? ''} />
			</div>

			<div
				className="btn-group mb-3"
				role="group"
				aria-label="Filter by status"
			>
				{STATUS_FILTERS.map((option) => (
					<Link
						key={option.value}
						href={`/admin/waitlist/archive?status=${option.value}`}
						className={`btn btn-sm ${
							active === option.value ? 'btn-primary' : 'btn-outline-secondary'
						}`}
					>
						{option.label}
					</Link>
				))}
			</div>

			<ApplicationsTable
				rows={rows}
				rowCount={rowCount}
				page={filters.page}
				pageSize={filters.pageSize}
				sort={filters.sort}
				direction={filters.direction}
			/>
		</div>
	);
}
