'use client';

/**
 * The footer under a server-paginated admin table.
 *
 * Deliberately presentational: every value here comes from the caller's table
 * instance (`getPageCount()`, `getCanPreviousPage()`, …), because those APIs
 * only exist once `rowPaginationFeature` is registered and the concrete
 * feature set lives at the call site.
 */
export function TablePager({
	pageIndex,
	pageSize,
	pageCount,
	rowCount,
	canPrevious,
	canNext,
	onPrevious,
	onNext,
}: {
	pageIndex: number;
	pageSize: number;
	pageCount: number;
	rowCount: number;
	canPrevious: boolean;
	canNext: boolean;
	onPrevious: () => void;
	onNext: () => void;
}) {
	const firstRow = rowCount === 0 ? 0 : pageIndex * pageSize + 1;
	const lastRow = Math.min((pageIndex + 1) * pageSize, rowCount);

	return (
		<div className="d-flex flex-wrap justify-content-between align-items-center gap-2 pt-3">
			<p className="text-body-secondary small mb-0">
				{firstRow}–{lastRow} of {rowCount}
			</p>
			<div className="btn-group">
				<button
					type="button"
					className="btn btn-sm btn-outline-secondary"
					disabled={!canPrevious}
					onClick={onPrevious}
				>
					Previous
				</button>
				<span className="btn btn-sm btn-outline-secondary disabled">
					Page {pageIndex + 1} of {Math.max(1, pageCount)}
				</span>
				<button
					type="button"
					className="btn btn-sm btn-outline-secondary"
					disabled={!canNext}
					onClick={onNext}
				>
					Next
				</button>
			</div>
		</div>
	);
}
