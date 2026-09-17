import Link from 'next/link';

import { requirePermission } from '@/lib/adminAccess';
import { listApplications, statusCounts } from '@/lib/applications';
import { QUEUE_STATUSES } from '@/lib/applicationStatuses';
import { FilterChips } from '../filterChips';
import { ApplicationsTable } from './applicationsTable';
import { QueueSearch } from './queueSearch';
import { parseSearchParams } from './searchParams';
import { oneOf, type RawSearchParams } from '@/util/searchParams';

export const dynamic = 'force-dynamic';

export const metadata = {
	title: 'Queue · Admin',
	robots: { index: false, follow: false },
};

const SOURCE_FILTERS = [
	{ value: null, label: 'Any source' },
	{ value: 'volunteer_invite', label: 'Volunteer invite' },
	{ value: 'waitlist_signup', label: 'Waitlist signup' },
];

export default async function AdminQueuePage({
	searchParams,
}: {
	searchParams: Promise<RawSearchParams>;
}) {
	// The layout only checks that the viewer holds *some* section, so each
	// section gates itself. Without this a volunteer_coordinator reaches the
	// membership queue.
	await requirePermission('waitlist', 'read');

	const params = await searchParams;
	const parsed = parseSearchParams(params, QUEUE_STATUSES);
	// "Everything" is the whole queue, never the archive. `?status=all` lifts
	// the filter in `parseSearchParams`, so it is put back here, as the archive
	// does with its own statuses.
	const filters = { ...parsed, statuses: parsed.statuses ?? QUEUE_STATUSES };

	const [{ rows, rowCount }, counts] = await Promise.all([
		// Volunteer invites sort to the front of the queue no matter what else
		// is applied; that priority is the point of the invite. Only here: the
		// archive is history, sorted by whatever column was chosen.
		listApplications({ ...filters, priorityFirst: true }),
		statusCounts(),
	]);

	const active = oneOf(params.status, QUEUE_STATUSES) ?? 'queue';
	// Either chip group keeps what the other one, the search and the sort are
	// set to; only the defaults are left out, so the canonical view is a bare
	// path.
	const shared = {
		q: filters.search ?? null,
		sort: filters.sort === 'submittedAt' ? null : filters.sort,
		dir: filters.direction === 'desc' ? null : filters.direction,
	};

	return (
		<div className="container-fluid px-3 px-lg-4 py-4">
			<div className="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-3">
				<div>
					<h1 className="h4 mb-1">Queue</h1>
					<p className="text-body-secondary mb-0 small">
						{counts.waitlisted ?? 0} waiting on a first decision ·{' '}
						{counts.coffee_invited ?? 0} invited to a Coffee
					</p>
				</div>
				{/* Keyed on the URL's term so Back/Forward remounts the input with it. */}
				<QueueSearch
					key={filters.search ?? ''}
					initialValue={filters.search ?? ''}
				/>
			</div>

			<div className="d-flex flex-wrap gap-3 align-items-center mb-3">
				<FilterChips
					base="/admin/waitlist"
					keep={{ ...shared, source: filters.source ?? null }}
					param="status"
					// "Everything" is the default view, so its link carries no status.
					active={active === 'queue' ? null : active}
					chips={[
						{
							value: 'waitlisted',
							label: 'Waitlisted',
							count: counts.waitlisted ?? 0,
						},
						{
							value: 'coffee_invited',
							label: 'Coffee invited',
							count: counts.coffee_invited ?? 0,
						},
						{
							value: null,
							label: 'Everything',
							count: (counts.waitlisted ?? 0) + (counts.coffee_invited ?? 0),
						},
					]}
					ariaLabel="Filter by status"
				/>

				<FilterChips
					base="/admin/waitlist"
					keep={{ ...shared, status: active === 'queue' ? null : active }}
					param="source"
					active={filters.source ?? null}
					chips={SOURCE_FILTERS}
					ariaLabel="Filter by source"
				/>
			</div>

			{/* "Clear" means the whole queue, not just this search, source or
			    status chip — with a filter on, an empty result is the table's
			    own "nothing matches". */}
			{rowCount === 0 &&
			!filters.search &&
			!filters.source &&
			!params.status ? (
				<div className="text-center py-5">
					<h2 className="h5">Queue&rsquo;s clear</h2>
					<p className="text-body-secondary">
						Nobody is waiting on a first decision.{' '}
						{(counts.coffee_invited ?? 0) > 0 && (
							<>
								{counts.coffee_invited} people are invited to a Coffee and
								haven&rsquo;t attended yet.
							</>
						)}
					</p>
					<Link
						className="btn btn-outline-secondary"
						href="/admin/waitlist?status=coffee_invited"
					>
						See Coffee invited
					</Link>
				</div>
			) : (
				<ApplicationsTable
					rows={rows}
					rowCount={rowCount}
					page={filters.page}
					pageSize={filters.pageSize}
					sort={filters.sort}
					direction={filters.direction}
				/>
			)}
		</div>
	);
}
