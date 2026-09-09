'use client';

import { useCallback, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
	createColumnHelper,
	rowSortingFeature,
	tableFeatures,
	useTable,
} from '@tanstack/react-table';

import type { MembershipApplication } from '@/db';
import { ApplicationDrawer } from './applicationDrawer';
import { StatusBadge, SourceBadge, formatDate } from '../presentation';

/**
 * Only sorting is registered, and even that is manual: the server does the
 * work. Registering the client-side sorted/paginated row models would quietly
 * re-sort the 50 rows on screen and present it as if the whole 2,547 had been
 * ordered.
 */
const features = tableFeatures({ rowSortingFeature });

const helper = createColumnHelper<typeof features, MembershipApplication>();

const columns = helper.columns([
	helper.accessor('name', {
		header: 'Name',
		cell: ({ row }) => (
			<div>
				<div className="fw-semibold">{row.original.name}</div>
				{row.original.pronouns && (
					<div className="text-body-secondary small">
						{row.original.pronouns}
						{row.original.githubUsername
							? ` · @${row.original.githubUsername}`
							: ''}
					</div>
				)}
			</div>
		),
	}),
	helper.accessor('email', {
		header: 'Email',
		cell: ({ getValue }) => (
			<span className="text-body-secondary">{getValue()}</span>
		),
	}),
	helper.accessor('source', {
		header: 'Source',
		cell: ({ getValue }) => <SourceBadge source={getValue()} />,
	}),
	helper.accessor('status', {
		header: 'Status',
		cell: ({ getValue }) => <StatusBadge status={getValue()} />,
	}),
	helper.accessor('submittedAt', {
		header: 'Submitted',
		cell: ({ getValue }) => (
			<span className="text-nowrap">{formatDate(getValue())}</span>
		),
	}),
	helper.accessor('journey', {
		header: 'Journey',
		enableSorting: false,
		cell: ({ getValue }) => (
			<div className="admin-truncate text-body-secondary">
				{getValue() ?? <span className="fst-italic">No answer</span>}
			</div>
		),
	}),
]);

type Props = {
	rows: MembershipApplication[];
	rowCount: number;
	page: number;
	pageSize: number;
	sort: string;
	direction: 'asc' | 'desc';
};

export function ApplicationsTable({
	rows,
	rowCount,
	page,
	pageSize,
	sort,
	direction,
}: Props) {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const [openId, setOpenId] = useState<number | null>(null);

	const push = useCallback(
		(changes: Record<string, string | null>) => {
			const next = new URLSearchParams(searchParams.toString());
			for (const [key, value] of Object.entries(changes)) {
				if (value === null) next.delete(key);
				else next.set(key, value);
			}
			router.push(`${pathname}?${next.toString()}`);
		},
		[pathname, router, searchParams],
	);

	const table = useTable({
		features,
		columns,
		data: rows,
		// Sorting is the only feature registered, and it is manual: the header
		// buttons write to the URL and the server returns the ordered page.
		// Pagination and filtering are not table features here at all — they are
		// URL state applied in SQL — so the table renders exactly the rows it is
		// given and can never imply it ordered or counted the other 2,500.
		manualSorting: true,
		getRowId: (row) => String(row.id),
		state: {
			sorting: [{ id: sort, desc: direction === 'desc' }],
		},
		onSortingChange: () => {
			// Handled by the header buttons below, which write to the URL. Kept as
			// a no-op so the controlled `state.sorting` above never desyncs.
		},
	});

	const openRow = useMemo(
		() => rows.find((row) => row.id === openId) ?? null,
		[openId, rows],
	);

	const totalPages = Math.max(1, Math.ceil(rowCount / pageSize));
	const firstRow = rowCount === 0 ? 0 : page * pageSize + 1;
	const lastRow = Math.min((page + 1) * pageSize, rowCount);

	function toggleSort(field: string) {
		const nextDirection =
			sort === field && direction === 'desc' ? 'asc' : 'desc';
		// Any sort change resets to the first page. Omitting the client-side
		// sorted row model also omits its automatic page reset, so this is on us.
		push({ sort: field, dir: nextDirection, page: null });
	}

	if (rows.length === 0) {
		return (
			<div className="text-center py-5">
				<h2 className="h5">Nothing here</h2>
				<p className="text-body-secondary mb-0">
					No applications match these filters.
				</p>
			</div>
		);
	}

	return (
		<>
			{/* Desktop: the dense table. */}
			<div className="table-responsive d-none d-md-block">
				<table className="table table-hover align-middle mb-0">
					<thead>
						{table.getHeaderGroups().map((group) => (
							<tr key={group.id}>
								{group.headers.map((header) => {
									const canSort = header.column.getCanSort();
									const isSorted = sort === header.column.id;
									return (
										<th key={header.id} scope="col" className="small">
											{header.isPlaceholder ? null : canSort ? (
												<button
													type="button"
													className="btn btn-link btn-sm p-0 text-decoration-none text-body"
													onClick={() => toggleSort(header.column.id)}
													aria-label={`Sort by ${String(header.column.columnDef.header)}`}
												>
													<table.FlexRender header={header} />
													<span aria-hidden="true">
														{isSorted
															? direction === 'desc'
																? ' ↓'
																: ' ↑'
															: ''}
													</span>
												</button>
											) : (
												<table.FlexRender header={header} />
											)}
										</th>
									);
								})}
							</tr>
						))}
					</thead>
					<tbody>
						{table.getRowModel().rows.map((row) => (
							<tr
								key={row.id}
								className="admin-row"
								aria-selected={openId === row.original.id}
								onClick={() => setOpenId(row.original.id)}
							>
								{row.getAllCells().map((cell) => (
									<td key={cell.id}>
										<table.FlexRender cell={cell} />
									</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{/* Mobile: a dense table is unusable on a phone, so the same rows
			    render as stacked cards. */}
			<ul className="list-unstyled d-md-none mb-0">
				{rows.map((row) => (
					<li key={row.id} className="border-bottom py-3">
						<div className="d-flex justify-content-between align-items-start gap-2">
							<div>
								<div className="fw-semibold">{row.name}</div>
								<div className="text-body-secondary small">
									{row.pronouns}
									{row.githubUsername ? ` · @${row.githubUsername}` : ''}
								</div>
							</div>
							<SourceBadge source={row.source} />
						</div>
						{row.journey && (
							<p className="admin-answer-excerpt text-body-secondary small mt-2 mb-2">
								{row.journey}
							</p>
						)}
						<div className="d-flex flex-wrap gap-2">
							<button
								type="button"
								className="btn btn-sm btn-outline-secondary"
								onClick={() => setOpenId(row.id)}
							>
								Read full application
							</button>
							<Link
								className="btn btn-sm btn-outline-secondary"
								href={`/admin/waitlist/${row.id}`}
							>
								Open
							</Link>
						</div>
					</li>
				))}
			</ul>

			<div className="d-flex flex-wrap justify-content-between align-items-center gap-2 pt-3">
				<p className="text-body-secondary small mb-0">
					{firstRow}–{lastRow} of {rowCount}
				</p>
				<div className="btn-group">
					<button
						type="button"
						className="btn btn-sm btn-outline-secondary"
						disabled={page === 0}
						onClick={() => push({ page: String(page) })}
					>
						Previous
					</button>
					<span className="btn btn-sm btn-outline-secondary disabled">
						Page {page + 1} of {totalPages}
					</span>
					<button
						type="button"
						className="btn btn-sm btn-outline-secondary"
						disabled={page + 1 >= totalPages}
						onClick={() => push({ page: String(page + 2) })}
					>
						Next
					</button>
				</div>
			</div>

			<ApplicationDrawer
				application={openRow}
				onClose={() => setOpenId(null)}
			/>
		</>
	);
}
