'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { createColumnHelper } from '@tanstack/react-table';

import type { MembershipApplication } from '@/db';
import type { SortField } from '@/lib/applications';
import { ApplicationDrawer } from './applicationDrawer';
import { StatusBadge, SourceBadge, formatDate } from '../presentation';
import { SortableHeader } from '../sortableHeader';
import { TablePager } from '../tablePager';
import {
	useServerPagedTable,
	type ServerTableFeatures,
} from '../tableUrlState';

const helper = createColumnHelper<ServerTableFeatures, MembershipApplication>();

/**
 * The name is a button so the drawer is reachable from the keyboard; the row
 * click is the pointer shortcut, not the only way in. Built per open handler,
 * as the submissions table builds per base path.
 */
const buildColumns = (open: (id: string) => void) =>
	helper.columns([
		helper.accessor('name', {
			header: 'Name',
			cell: ({ row }) => (
				<div>
					<button
						type="button"
						className="btn btn-link p-0 text-start fw-semibold text-body text-decoration-none"
						onClick={() => open(row.original.id)}
					>
						{row.original.name}
					</button>
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
	sort: SortField;
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
	const [openId, setOpenId] = useState<string | null>(null);
	const columns = useMemo(() => buildColumns(setOpenId), []);

	const { table, pagination } = useServerPagedTable({
		columns,
		rows,
		rowCount,
		page,
		pageSize,
		sort,
		direction,
	});

	const openRow = useMemo(
		() => rows.find((row) => row.id === openId) ?? null,
		[openId, rows],
	);

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
								{group.headers.map((header) => (
									<th
										key={header.id}
										scope="col"
										className="small"
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
							<tr
								key={row.id}
								className="admin-row"
								data-open={openId === row.original.id || undefined}
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
			    render as stacked cards. Driven off the row model rather than the
			    `rows` prop, so the two renders cannot drift apart if this table
			    ever registers a client-side row model. */}
			<ul className="list-unstyled d-md-none mb-0">
				{table.getRowModel().rows.map(({ original: row }) => (
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

			<TablePager table={table} pagination={pagination} rowCount={rowCount} />

			<ApplicationDrawer
				application={openRow}
				onClose={() => setOpenId(null)}
			/>
		</>
	);
}
