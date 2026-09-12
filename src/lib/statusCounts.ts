import { count } from 'drizzle-orm';
import type { AnyPgColumn, PgTable } from 'drizzle-orm/pg-core';

import { db } from '@/db';

/**
 * Rows per status, plus `all`, for the filter chips on a list screen. Shared
 * by the waitlist queue and the four Submission lists.
 */
export async function countByStatus(
	table: PgTable & { status: AnyPgColumn<{ data: string; notNull: true }> },
): Promise<Record<string, number>> {
	const rows = await db()
		.select({ status: table.status, value: count() })
		.from(table)
		.groupBy(table.status);

	const counts: Record<string, number> = {};
	let total = 0;
	for (const row of rows) {
		counts[row.status] = row.value;
		total += row.value;
	}
	counts.all = total;
	return counts;
}
