import Link from 'next/link';

import { requirePermission } from '@/lib/adminAccess';
import {
	listApplications,
	QUEUE_STATUSES,
	statusCounts,
} from '@/lib/applications';
import { ApplicationsTable } from './applicationsTable';
import { QueueSearch } from './queueSearch';
import { parseSearchParams } from './searchParams';
import type { RawSearchParams } from '@/util/searchParams';

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
	// The queue defaults to the two statuses that need a human decision.
	// "Everything" is available as a chip but is not what this screen is for.
	const filters = parseSearchParams(params, QUEUE_STATUSES);

	const [{ rows, rowCount }, counts] = await Promise.all([
		listApplications(filters),
		statusCounts(),
	]);

	const active = (params.status as string | undefined) ?? 'queue';
	const chips = [
		{ key: 'waitlisted', label: 'Waitlisted', count: counts.waitlisted ?? 0 },
		{
			key: 'coffee_invited',
			label: 'Coffee invited',
			count: counts.coffee_invited ?? 0,
		},
		{ key: 'all', label: 'Everything', count: counts.all ?? 0 },
	];

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
				<QueueSearch initialValue={filters.search ?? ''} />
			</div>

			<div className="d-flex flex-wrap gap-3 align-items-center mb-3">
				<div className="btn-group" role="group" aria-label="Filter by status">
					{chips.map((chip) => (
						<Link
							key={chip.key}
							href={`/admin/waitlist?status=${chip.key}`}
							className={`btn btn-sm ${
								active === chip.key ? 'btn-primary' : 'btn-outline-secondary'
							}`}
						>
							{chip.label}{' '}
							<span className="badge text-bg-light border ms-1">
								{chip.count}
							</span>
						</Link>
					))}
				</div>

				<div className="btn-group" role="group" aria-label="Filter by source">
					{SOURCE_FILTERS.map((option) => (
						<Link
							key={option.label}
							href={
								option.value
									? `/admin/waitlist?status=${active}&source=${option.value}`
									: `/admin/waitlist?status=${active}`
							}
							className={`btn btn-sm ${
								(params.source ?? null) === option.value
									? 'btn-secondary'
									: 'btn-outline-secondary'
							}`}
						>
							{option.label}
						</Link>
					))}
				</div>
			</div>

			{rowCount === 0 && !filters.search ? (
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
