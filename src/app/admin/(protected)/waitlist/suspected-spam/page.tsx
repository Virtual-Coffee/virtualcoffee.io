import { requirePermission } from '@/lib/access/adminAccess';
import { listApplications, statusCounts } from '@/lib/waitlist/applications';
import { QUARANTINE_STATUSES } from '@/lib/waitlist/applicationStatuses';
import { ApplicationsTable } from '../applicationsTable';
import { QueueSearch } from '../queueSearch';
import { parseSearchParams } from '../searchParams';
import type { RawSearchParams } from '@/util/searchParams';

export const dynamic = 'force-dynamic';

export const metadata = {
	title: 'Suspected spam · Admin',
	robots: { index: false, follow: false },
};

/**
 * Its own screen, not a filter on the queue or the archive: these are
 * applications nobody has accepted yet, and mixing them into either list would
 * put spam in front of the people reviewing real applicants.
 */
export default async function SuspectedSpamPage({
	searchParams,
}: {
	searchParams: Promise<RawSearchParams>;
}) {
	await requirePermission('waitlist', 'read');

	const params = await searchParams;
	const parsed = parseSearchParams(params, QUARANTINE_STATUSES);
	// `?status=all` lifts the filter in `parseSearchParams`; it is put back so
	// this page never lists the queue. No source chip here, so a pasted
	// `?source=` is dropped rather than narrowing a listing nothing explains.
	const filters = {
		...parsed,
		source: undefined,
		statuses: parsed.statuses ?? QUARANTINE_STATUSES,
	};

	const [{ rows, rowCount }, counts] = await Promise.all([
		listApplications(filters),
		statusCounts(),
	]);

	return (
		<div className="container-fluid px-3 px-lg-4 py-4">
			<div className="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-3">
				<div>
					<h1 className="h4 mb-1">Suspected spam</h1>
					<p className="text-body-secondary mb-0 small">
						Held by the /join heuristic. Release a real applicant to the
						Waitlist, or decline. · {counts.suspected_spam ?? 0} held
					</p>
				</div>
				{/* Keyed on the URL's term so Back/Forward remounts the input with it. */}
				<QueueSearch
					key={filters.search ?? ''}
					initialValue={filters.search ?? ''}
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
