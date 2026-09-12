'use client';

import { useCallback, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
	rowPaginationFeature,
	rowSortingFeature,
	tableFeatures,
	useTable,
	type OnChangeFn,
	type PaginationState,
	type RowData,
	type SortingState,
	type TableOptions,
	type Updater,
} from '@tanstack/react-table';

/**
 * Features registered for their header/footer APIs, row models deliberately
 * not: the server sorts and pages, and a client row model would re-sort the
 * 50 rows on screen as if it had ordered them all. Every server-paged admin
 * table builds its column helper against this one feature set.
 */
export const serverTableFeatures = tableFeatures({
	rowSortingFeature,
	rowPaginationFeature,
});

export type ServerTableFeatures = typeof serverTableFeatures;

/**
 * URL state for the admin list screens whose filtering, sorting and paging
 * happen in SQL. The query string owns those slices, so a filtered view is
 * bookmarkable; the table is told with `manualSorting`/`manualPagination`,
 * which only stop the client row models from re-processing a page that is
 * already correct. The handlers resolve the value-or-updater form the table
 * may pass.
 */
export function useTableUrlState({
	sorting,
	pagination,
}: {
	sorting: SortingState;
	pagination: PaginationState;
}) {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

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

	const onSortingChange: OnChangeFn<SortingState> = useCallback(
		(updater) => {
			const [first] = resolve(updater, sorting);
			// `enableSortingRemoval` is off on these tables, so there is always a
			// column to sort by; bail rather than write an empty sort if that ever
			// changes.
			if (!first) return;
			// A new order invalidates the page number: row 51 under one sort is not
			// row 51 under another.
			push({ sort: first.id, dir: first.desc ? 'desc' : 'asc', page: null });
		},
		[push, sorting],
	);

	const onPaginationChange: OnChangeFn<PaginationState> = useCallback(
		(updater) => {
			const next = resolve(updater, pagination);
			// The table counts pages from 0 and the URL counts from 1, so this is
			// the one place the two conventions meet. Page 1 is the default and is
			// left out of the query string entirely.
			push({
				page: next.pageIndex === 0 ? null : String(next.pageIndex + 1),
			});
		},
		[pagination, push],
	);

	return { push, onSortingChange, onPaginationChange };
}

/**
 * A table over one server-sorted, server-sliced page, whose sort and page
 * live in the URL. The page passes its parsed search params straight in.
 */
export function useServerPagedTable<TData extends RowData & { id: string }>({
	columns,
	rows,
	rowCount,
	page,
	pageSize,
	sort,
	direction,
}: {
	columns: TableOptions<ServerTableFeatures, TData>['columns'];
	rows: TData[];
	rowCount: number;
	page: number;
	pageSize: number;
	sort: string;
	direction: 'asc' | 'desc';
}) {
	// The table's model inputs have to keep a stable identity between renders —
	// a fresh array here on every render is not compensated for by any of the
	// state subscriptions.
	const sorting = useMemo<SortingState>(
		() => [{ id: sort, desc: direction === 'desc' }],
		[direction, sort],
	);
	const pagination = useMemo<PaginationState>(
		() => ({ pageIndex: page, pageSize }),
		[page, pageSize],
	);

	const { onSortingChange, onPaginationChange } = useTableUrlState({
		sorting,
		pagination,
	});

	const table = useTable({
		features: serverTableFeatures,
		columns,
		data: rows,
		manualSorting: true,
		manualPagination: true,
		// Without the total, "is there a next page" cannot be answered.
		rowCount,
		// The URL owns both slices, so nothing here may reset them behind its
		// back; sort changes reset the page deliberately, in the hook above.
		autoResetPageIndex: false,
		state: { sorting, pagination },
		onSortingChange,
		onPaginationChange,
		// A column always carries a sort; there is no unsorted third state to
		// cycle into, because the server has to be told *some* order. Without
		// this the built-in toggle would cycle to "none" and push an empty sort.
		enableSortingRemoval: false,
		// A newly clicked column opens descending — newest and largest first is
		// what every queue in /admin is read for.
		sortDescFirst: true,
		getRowId: (row) => row.id,
	});

	return { table, sorting, pagination };
}

function resolve<T>(updater: Updater<T>, current: T): T {
	return typeof updater === 'function'
		? (updater as (old: T) => T)(current)
		: updater;
}
