import { requirePermission } from '@/lib/access/adminAccess';
import { listApplications, statusCounts } from '@/lib/waitlist/applications';
import { ARCHIVE_STATUSES } from '@/lib/waitlist/applicationStatuses';
import { FilterChips } from '../../filterChips';
import { ApplicationsTable } from '../applicationsTable';
import { QueueSearch } from '../queueSearch';
import { parseSearchParams } from '../searchParams';
import { oneOf, type RawSearchParams } from '@/util/searchParams';

export const dynamic = 'force-dynamic';

export const metadata = {
	title: 'Archive · Admin',
	robots: { index: false, follow: false },
};

// "All statuses" is the default view, so its link carries no status at all.
const STATUS_FILTERS = [
	{ value: null, label: 'All statuses' },
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
	// There is no source chip on this page, so a pasted `?source=` is dropped
	// rather than silently narrowing a listing nothing on screen explains.
	const filters = {
		...parsed,
		source: undefined,
		statuses: parsed.statuses ?? ARCHIVE_STATUSES,
	};

	const [{ rows, rowCount }, counts] = await Promise.all([
		listApplications(filters),
		statusCounts(),
	]);

	const archived = ARCHIVE_STATUSES.reduce(
		(sum, status) => sum + (counts[status] ?? 0),
		0,
	);
	// `?status=all` is the same view as no status at all, so both land on the
	// "All statuses" chip.
	const active = oneOf(params.status, ARCHIVE_STATUSES) ?? null;

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
				{/* Keyed on the URL's term so Back/Forward remounts the input with it. */}
				<QueueSearch
					key={filters.search ?? ''}
					initialValue={filters.search ?? ''}
				/>
			</div>

			<div className="mb-3">
				<FilterChips
					base="/admin/waitlist/archive"
					keep={{
						q: filters.search ?? null,
						sort: filters.sort === 'submittedAt' ? null : filters.sort,
						dir: filters.direction === 'desc' ? null : filters.direction,
					}}
					param="status"
					active={active}
					chips={STATUS_FILTERS}
					ariaLabel="Filter by status"
				/>
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
