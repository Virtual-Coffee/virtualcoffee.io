'use client';

import Link from 'next/link';
import {
	createColumnHelper,
	createSortedRowModel,
	rowSortingFeature,
	sortFn_basic,
	sortFn_datetime,
	sortFn_text,
	tableFeatures,
	useTable,
} from '@tanstack/react-table';

import type { VolunteerRow } from '@/lib/volunteers';
import { formatDate } from '../presentation';
import { SortableHeader } from '../sortableHeader';
import { VolunteerStateBadge } from './presentation';

/**
 * Sorts in the browser, like the User Management table and unlike the queues.
 *
 * `listVolunteers()` returns the whole roster in one query — ninety-odd rows,
 * with the balance and the sent count as correlated subqueries — so the
 * component holds the complete set and a client-side sort orders all of it.
 * There is no larger result behind it for a header to misrepresent, and no
 * pagination to reset.
 *
 * Only the three sort functions the columns name are registered; importing the
 * whole `sortFns` registry would bundle every built-in.
 */
const features = tableFeatures({
	rowSortingFeature,
	sortedRowModel: createSortedRowModel(),
	sortFns: {
		text: sortFn_text,
		datetime: sortFn_datetime,
		basic: sortFn_basic,
	},
});

const helper = createColumnHelper<typeof features, VolunteerRow>();

/**
 * Columns whose header and cells both sit right.
 *
 * Keyed on the column id rather than carried in `columnDef.meta`: typing meta
 * means augmenting `ColumnMeta` module-wide for one alignment class, and the
 * header and the cell are rendered by two separate loops that both need it.
 */
const NUMERIC_COLUMNS = new Set(['balance', 'invitesSent']);

const columns = helper.columns([
	helper.accessor('slackDisplayName', {
		header: 'Volunteer',
		sortFn: 'text',
		cell: ({ row }) => (
			<>
				<Link href={`/admin/volunteers/${row.original.id}`}>
					{row.original.slackDisplayName}
				</Link>
				<div className="text-body-secondary small">
					{row.original.slackHandle ? `@${row.original.slackHandle}` : '—'}
					{/*
					 * A Volunteer who has never signed in is a normal state, not a
					 * problem: their access is waiting as a Pending Grant. Worth
					 * showing, because it explains why they have used nothing.
					 */}
					{row.original.userId === null && ' · hasn’t signed in'}
				</div>
			</>
		),
	}),
	helper.accessor('deactivatedAt', {
		header: 'State',
		/**
		 * Sortable even though the chips above filter on the same thing: with
		 * "Everything" selected this is the only way to group the two apart.
		 * `datetime` resolves null rather than throwing, so active volunteers
		 * land together at one end.
		 */
		sortFn: 'datetime',
		cell: ({ getValue }) => <VolunteerStateBadge deactivatedAt={getValue()} />,
	}),
	helper.accessor('balance', {
		header: 'Invites left',
		sortFn: 'basic',
		cell: ({ getValue }) => getValue(),
	}),
	helper.accessor('invitesSent', {
		header: 'Sent',
		sortFn: 'basic',
		cell: ({ getValue }) => getValue(),
	}),
	helper.accessor('createdAt', {
		header: 'Added',
		sortFn: 'datetime',
		cell: ({ getValue }) => (
			<span className="small">{formatDate(getValue())}</span>
		),
	}),
]);

export function VolunteersTable({
	rows,
	emptyMessage,
}: {
	rows: VolunteerRow[];
	emptyMessage: string;
}) {
	const table = useTable({
		features,
		columns,
		data: rows,
		getRowId: (row) => row.id,
		// Matches the name order the rows arrive in, so the first render does not
		// reorder them.
		initialState: { sorting: [{ id: 'slackDisplayName', desc: false }] },
		// Someone always holds the sort; there is no unsorted state worth cycling
		// back to on a list this short.
		enableSortingRemoval: false,
	});

	if (rows.length === 0) {
		return (
			<div className="text-center py-5">
				<p className="h5">Nobody here</p>
				<p className="text-body-secondary mb-0">{emptyMessage}</p>
			</div>
		);
	}

	return (
		<>
			<div className="table-responsive d-none d-md-block">
				<table className="table table-hover align-middle mb-0">
					<thead>
						{table.getHeaderGroups().map((group) => (
							<tr key={group.id} className="small">
								{group.headers.map((header) => (
									<th
										key={header.id}
										scope="col"
										className={
											NUMERIC_COLUMNS.has(header.column.id)
												? 'text-end'
												: undefined
										}
									>
										{header.isPlaceholder ? null : header.column.getCanSort() ? (
											<SortableHeader
												sorted={header.column.getIsSorted()}
												label={String(header.column.columnDef.header)}
												onClick={header.column.getToggleSortingHandler()}
											>
												<table.FlexRender header={header} />
											</SortableHeader>
										) : (
											<table.FlexRender header={header} />
										)}
									</th>
								))}
							</tr>
						))}
					</thead>
					<tbody>
						{table.getRowModel().rows.map((row) => (
							<tr key={row.id}>
								{row.getAllCells().map((cell) => (
									<td
										key={cell.id}
										className={
											NUMERIC_COLUMNS.has(cell.column.id)
												? 'text-end'
												: undefined
										}
									>
										<table.FlexRender cell={cell} />
									</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{/*
			 * The narrow rendering reads the same row model rather than the `rows`
			 * prop, so a sort applied on a wide screen cannot leave the two
			 * disagreeing about order.
			 */}
			<ul className="list-unstyled d-md-none mb-0">
				{table.getRowModel().rows.map(({ original }) => (
					<li key={original.id} className="border-bottom py-3">
						<div className="d-flex justify-content-between gap-2">
							<Link href={`/admin/volunteers/${original.id}`}>
								{original.slackDisplayName}
							</Link>
							<VolunteerStateBadge deactivatedAt={original.deactivatedAt} />
						</div>
						<div className="text-body-secondary small mt-1">
							{original.balance} left · {original.invitesSent} sent
						</div>
					</li>
				))}
			</ul>
		</>
	);
}
