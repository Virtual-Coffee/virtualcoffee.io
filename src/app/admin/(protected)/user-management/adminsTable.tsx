'use client';

import { useMemo } from 'react';
import {
	createColumnHelper,
	createSortedRowModel,
	rowSortingFeature,
	sortFn_datetime,
	sortFn_text,
	tableFeatures,
	useTable,
} from '@tanstack/react-table';

import type { AccessRow } from '@/lib/admins';
import { AccessStateBadge, formatDate } from '../presentation';
import { SortableHeader } from '../sortableHeader';
import { RolesDropdown } from './adminControls';

// Sorts in the browser: `listAccessRows()` returns everyone, unpaginated.
// Only the sort functions the columns name are registered; the whole
// `sortFns` registry would bundle every built-in.
const features = tableFeatures({
	rowSortingFeature,
	sortedRowModel: createSortedRowModel(),
	sortFns: { text: sortFn_text, datetime: sortFn_datetime },
});

const helper = createColumnHelper<typeof features, AccessRow>();

// Two columns need to know who is looking, so these are built per viewer and
// memoized: a fresh `columns` array every render would re-run the row model.
function buildColumns(currentUserId: string | null) {
	return helper.columns([
		helper.accessor('name', {
			header: 'Person',
			sortFn: 'text',
			cell: ({ row }) => (
				<>
					<div className="fw-semibold">
						{row.original.name}
						{row.original.id === currentUserId && (
							<span className="badge text-bg-light border ms-2">You</span>
						)}
					</div>
					<div className="text-body-secondary small">
						{row.original.email ??
							(row.original.handle ? `@${row.original.handle}` : '—')}
					</div>
					{row.original.kind === 'pending' && (
						<AccessStateBadge state="pending" />
					)}
					{row.original.stranded && <AccessStateBadge state="stranded" />}
				</>
			),
		}),
		helper.accessor('roles', {
			header: 'Access',
			// A dropdown of checkboxes is a control, not a value to order by.
			enableSorting: false,
			cell: ({ row }) => (
				<RolesDropdown
					kind={row.original.kind}
					id={row.original.id}
					name={row.original.name}
					roles={row.original.roles}
					isSelf={row.original.id === currentUserId}
				/>
			),
		}),
		helper.accessor('grantedAt', {
			header: 'Granted',
			// Both of the remaining columns are nullable, and both built-ins
			// resolve null to a sortable value rather than throwing — nulls land
			// first ascending, last descending. (`sortUndefined` does not come into
			// it: these are nulls, not undefined.)
			sortFn: 'datetime',
			cell: ({ getValue }) => (
				<span className="small">{formatDate(getValue())}</span>
			),
		}),
		helper.accessor('grantedBy', {
			header: 'By',
			sortFn: 'text',
			cell: ({ getValue }) => (
				<span className="small">{getValue() ?? '—'}</span>
			),
		}),
	]);
}

export function AdminsTable({
	rows,
	currentUserId,
}: {
	rows: AccessRow[];
	currentUserId: string | null;
}) {
	const columns = useMemo(() => buildColumns(currentUserId), [currentUserId]);

	const table = useTable({
		features,
		columns,
		data: rows,
		getRowId: (row) => row.id,
		// Matches the name order the rows arrive in, so the first render does not
		// reorder them.
		initialState: { sorting: [{ id: 'name', desc: false }] },
		// Someone always holds the sort; there is no unsorted state worth
		// cycling back to on a list this short.
		enableSortingRemoval: false,
	});

	return (
		// No `.table-responsive`: its scroll container would clip the roles menu.
		<div>
			<table className="table align-middle">
				<thead>
					{table.getHeaderGroups().map((group) => (
						<tr key={group.id} className="small">
							{group.headers.map((header) => (
								<th
									key={header.id}
									scope="col"
									aria-sort={
										header.column.getIsSorted() === 'asc'
											? 'ascending'
											: header.column.getIsSorted() === 'desc'
												? 'descending'
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
								<td key={cell.id}>
									<table.FlexRender cell={cell} />
								</td>
							))}
						</tr>
					))}
					{rows.length === 0 && (
						<tr>
							<td colSpan={4} className="text-body-secondary text-center py-4">
								Nobody has access yet. Grant it to anyone in the Slack workspace
								above — or, on an empty database, the first person whose Slack
								member id is in <code>ADMIN_BOOTSTRAP_SLACK_IDS</code> becomes
								an admin on sign-in.
							</td>
						</tr>
					)}
				</tbody>
			</table>
		</div>
	);
}
