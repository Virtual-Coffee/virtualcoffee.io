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

import type { AdminRow } from '@/lib/admins';
import { formatDate } from '../presentation';
import { SortableHeader } from '../sortableHeader';
import { RolesDropdown } from './adminControls';

/**
 * Unlike the queue tables, this one really does sort in the browser.
 *
 * `listAdmins()` returns every admin in a single unpaginated query, so the
 * component holds the whole set and a client-side sort orders all of it —
 * there is no larger result behind it for the header to misrepresent.
 *
 * Only the two sort functions the columns name are registered; importing the
 * whole `sortFns` registry would bundle every built-in.
 */
const features = tableFeatures({
	rowSortingFeature,
	sortedRowModel: createSortedRowModel(),
	sortFns: { text: sortFn_text, datetime: sortFn_datetime },
});

const helper = createColumnHelper<typeof features, AdminRow>();

/**
 * Two columns need to know who is looking, so the definitions cannot sit at
 * module scope like the other tables'. They are built once per viewer and
 * memoized instead — `columns` is a model input, and a fresh array on every
 * render is not compensated for by the state subscriptions.
 */
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
					<div className="text-body-secondary small">{row.original.email}</div>
				</>
			),
		}),
		helper.accessor('roles', {
			header: 'Access',
			// A dropdown of checkboxes is a control, not a value to order by.
			enableSorting: false,
			cell: ({ row }) => (
				<RolesDropdown
					userId={row.original.id}
					name={row.original.name}
					roles={row.original.roles}
					isSelf={row.original.id === currentUserId}
				/>
			),
		}),
		helper.accessor('roleGrantedAt', {
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
		helper.accessor('roleGrantedBy', {
			header: 'By',
			sortFn: 'text',
			cell: ({ getValue }) => (
				<span className="small">{getValue() ?? '—'}</span>
			),
		}),
	]);
}

export function AdminsTable({
	admins,
	currentUserId,
}: {
	admins: AdminRow[];
	currentUserId: string | null;
}) {
	const columns = useMemo(() => buildColumns(currentUserId), [currentUserId]);

	const table = useTable({
		features,
		columns,
		data: admins,
		getRowId: (row) => row.id,
		// Matches the `ORDER BY user.name` the rows arrive in, so the first
		// render does not reorder them.
		initialState: { sorting: [{ id: 'name', desc: false }] },
		// Someone always holds the sort; there is no unsorted state worth
		// cycling back to on a list this short.
		enableSortingRemoval: false,
	});

	return (
		<div className="table-responsive">
			<table className="table align-middle">
				<thead>
					{table.getHeaderGroups().map((group) => (
						<tr key={group.id} className="small">
							{group.headers.map((header) => (
								<th key={header.id} scope="col">
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
					{admins.length === 0 && (
						<tr>
							<td colSpan={4} className="text-body-secondary text-center py-4">
								Nobody has access yet. The first person whose email is in{' '}
								<code>ADMIN_BOOTSTRAP_EMAILS</code> becomes an admin on sign-in.
							</td>
						</tr>
					)}
				</tbody>
			</table>
		</div>
	);
}
