'use client';

import { useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type {
	OnChangeFn,
	PaginationState,
	SortingState,
	Updater,
} from '@tanstack/react-table';

/**
 * URL state for the admin list screens whose filtering, sorting and paging all
 * happen in SQL.
 *
 * The query string owns those slices, not the table: a filtered view is then
 * bookmarkable and can be pasted to another maintainer, and the server returns
 * exactly the page it is asked for. The table is told so with `manualSorting`
 * and `manualPagination`, which do not sort or slice anything themselves —
 * they only stop the client row models from re-processing a page that is
 * already correct.
 *
 * Both handlers below are `on[State]Change` for a slice held in `state`, so
 * each has to resolve the value-or-updater form the table may pass.
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

function resolve<T>(updater: Updater<T>, current: T): T {
	return typeof updater === 'function'
		? (updater as (old: T) => T)(current)
		: updater;
}
