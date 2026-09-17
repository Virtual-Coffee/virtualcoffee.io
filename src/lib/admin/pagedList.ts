import { asc, count, desc, type InferSelectModel, type SQL } from 'drizzle-orm';
import type { AnyPgColumn, PgTable } from 'drizzle-orm/pg-core';

import { db } from '@/db';
import { PAGE_SIZE } from '@/util/searchParams';

/**
 * Server-side paging for the /admin lists. Shared by the waitlist queue, the
 * archive and the four Submission lists.
 *
 * Every one of them is a table in manual mode: it renders exactly the rows it
 * is handed and is told the total separately, so it never sees the other
 * 2,500. What varies between them is the `where` and which column is sortable;
 * the rest — the two queries in one round trip, the direction, the tie-break
 * and the offset arithmetic — is the same everywhere and lives here.
 */

/** A table a list can page through: paging needs the id to break ties. */
type ListTable = PgTable & { id: AnyPgColumn };

export type PagedListResult<T extends ListTable> = {
	rows: InferSelectModel<T>[];
	rowCount: number;
};

export async function pagedList<T extends ListTable>(
	table: T,
	options: {
		where: SQL | undefined;
		/** The column the caller mapped from its own sort field. */
		sort: AnyPgColumn;
		direction: 'asc' | 'desc';
		/** Order terms ahead of the sort, e.g. `desc(isPriority)`. */
		leading?: SQL[];
		/** 0-based; the URL counts from 1. */
		page: number;
		pageSize?: number;
	},
): Promise<PagedListResult<T>> {
	const { where, leading = [], page, pageSize = PAGE_SIZE } = options;
	const order = options.direction === 'asc' ? asc : desc;
	// `from()` cannot narrow a still-generic table, so the query is built
	// against the constraint and the rows are named on the way out.
	const from: ListTable = table;

	const [rows, rowCount] = await Promise.all([
		db()
			.select()
			.from(from)
			.where(where)
			// The id is the tie-break (ADR 0008): none of the sortable columns is
			// unique, and without a total order a row can straddle two pages.
			.orderBy(...leading, order(options.sort), desc(from.id))
			.limit(pageSize)
			.offset(page * pageSize),
		countRows(from, where),
	]);

	return { rows: rows as InferSelectModel<T>[], rowCount };
}

/** How many rows match, as a number rather than a one-row result set. */
export async function countRows(table: PgTable, where?: SQL): Promise<number> {
	const [row] = await db().select({ value: count() }).from(table).where(where);

	return row?.value ?? 0;
}
