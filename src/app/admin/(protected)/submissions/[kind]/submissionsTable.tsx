'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { createColumnHelper } from '@tanstack/react-table';

import type { SubmissionStatus } from '@/db';
import type { SubmissionSortField } from '@/lib/submissions';
import { formatDateTime } from '../../presentation';
import { SortableHeader } from '../../sortableHeader';
import { TablePager } from '../../tablePager';
import {
	useServerPagedTable,
	type ServerTableFeatures,
} from '../../tableUrlState';
import { SubmissionStatusBadge } from './presentation';

/**
 * One row, flattened by the server page: the raw row is `Record<string,
 * unknown>` and its display comes from a module that imports drizzle, which
 * a client component cannot reach.
 */
export type SubmissionListRow = {
	id: string;
	reference: number;
	title: string;
	subtitle: string;
	status: SubmissionStatus;
	submittedAt: Date;
};

const helper = createColumnHelper<ServerTableFeatures, SubmissionListRow>();

function buildColumns(basePath: string) {
	return helper.columns([
		helper.accessor('reference', {
			header: 'Ref',
			cell: ({ getValue }) => (
				<span className="text-body-secondary small">#{getValue()}</span>
			),
		}),
		helper.accessor('title', {
			header: 'Submission',
			// Built per kind from fields the other kinds do not have, so there is
			// no column the server could order every kind by. `reference` is the
			// sortable stand-in.
			enableSorting: false,
			cell: ({ row }) => (
				<>
					<Link href={`${basePath}/${row.original.id}`}>
						{row.original.title}
					</Link>
					<div className="small text-body-secondary">
						{row.original.subtitle}
					</div>
				</>
			),
		}),
		helper.accessor('status', {
			header: 'Status',
			cell: ({ getValue }) => <SubmissionStatusBadge status={getValue()} />,
		}),
		helper.accessor('submittedAt', {
			header: 'Received',
			cell: ({ getValue }) => (
				<span className="small text-body-secondary text-nowrap">
					{formatDateTime(getValue())}
				</span>
			),
		}),
	]);
}

export function SubmissionsTable({
	rows,
	rowCount,
	basePath,
	page,
	pageSize,
	sort,
	direction,
}: {
	rows: SubmissionListRow[];
	rowCount: number;
	basePath: string;
	page: number;
	pageSize: number;
	sort: SubmissionSortField;
	direction: 'asc' | 'desc';
}) {
	const columns = useMemo(() => buildColumns(basePath), [basePath]);

	const { table, pagination } = useServerPagedTable({
		columns,
		rows,
		rowCount,
		page,
		pageSize,
		sort,
		direction,
	});

	if (rows.length === 0) {
		return <p className="text-body-secondary">Nothing here yet.</p>;
	}

	return (
		<>
			<div className="table-responsive">
				<table className="table table-hover align-middle mb-0">
					<thead>
						{table.getHeaderGroups().map((group) => (
							<tr key={group.id}>
								{group.headers.map((header) => (
									<th key={header.id} scope="col" className="small">
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
					</tbody>
				</table>
			</div>

			<TablePager table={table} pagination={pagination} rowCount={rowCount} />
		</>
	);
}
