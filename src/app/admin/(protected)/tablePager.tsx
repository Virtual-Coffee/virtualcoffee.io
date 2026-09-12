'use client';

import type { PaginationState, RowData, Table } from '@tanstack/react-table';

import type { ServerTableFeatures } from './tableUrlState';

/**
 * The footer under a table from `useServerPagedTable()`. The hook hands back
 * both halves; the page state is the URL's, the counts are the table's.
 */
export function TablePager<TData extends RowData>({
	table,
	pagination: { pageIndex, pageSize },
	rowCount,
}: {
	table: Pick<
		Table<ServerTableFeatures, TData>,
		| 'getPageCount'
		| 'getCanPreviousPage'
		| 'getCanNextPage'
		| 'previousPage'
		| 'nextPage'
		| 'setPageIndex'
	>;
	pagination: PaginationState;
	rowCount: number;
}) {
	const pageCount = table.getPageCount();
	// A stale `?page=` past the end, after rows moved on: one jump back beats
	// stepping down through empty pages one at a time.
	const pastTheEnd = rowCount > 0 && pageIndex >= pageCount;
	const firstRow = rowCount === 0 || pastTheEnd ? 0 : pageIndex * pageSize + 1;
	const lastRow = pastTheEnd
		? 0
		: Math.min((pageIndex + 1) * pageSize, rowCount);

	return (
		<div className="d-flex flex-wrap justify-content-between align-items-center gap-2 pt-3">
			<p className="text-body-secondary small mb-0">
				{firstRow}–{lastRow} of {rowCount}
			</p>
			{pastTheEnd && (
				<button
					type="button"
					className="btn btn-sm btn-outline-secondary"
					onClick={() => table.setPageIndex(0)}
				>
					Back to the first page
				</button>
			)}
			<div className="btn-group">
				<button
					type="button"
					className="btn btn-sm btn-outline-secondary"
					disabled={!table.getCanPreviousPage()}
					onClick={() => table.previousPage()}
				>
					Previous
				</button>
				<span className="btn btn-sm btn-outline-secondary disabled">
					Page {pageIndex + 1} of {Math.max(1, pageCount)}
				</span>
				<button
					type="button"
					className="btn btn-sm btn-outline-secondary"
					disabled={!table.getCanNextPage()}
					onClick={() => table.nextPage()}
				>
					Next
				</button>
			</div>
		</div>
	);
}
