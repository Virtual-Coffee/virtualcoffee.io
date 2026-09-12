/**
 * Reading `searchParams` safely. Next hands a repeated key over as an array,
 * so nothing here trusts a value to be a string.
 *
 * In /admin, list state lives in the URL so a filtered view is bookmarkable
 * and can be pasted to another maintainer. Every value reaches SQL, so each
 * section's parser whitelists what it accepts and falls back to a default
 * otherwise. These are the pieces they share.
 */

export type RawSearchParams = Record<string, string | string[] | undefined>;

/** Rows per page on every server-paged /admin list. */
export const PAGE_SIZE = 50;

export function single(
	value: string | string[] | undefined,
): string | undefined {
	return Array.isArray(value) ? value[0] : value;
}

/** The value if it is one of `allowed`, else undefined. */
export function oneOf<T extends string>(
	value: string | string[] | undefined,
	allowed: readonly T[],
): T | undefined {
	const candidate = single(value);
	return (allowed as readonly string[]).includes(candidate ?? '')
		? (candidate as T)
		: undefined;
}

/**
 * The highest page the URL is allowed to ask for. Half a million rows at
 * `PAGE_SIZE`, far past any list here; the point is that `page * PAGE_SIZE`
 * can never overflow Postgres's OFFSET, which is a bigint — `?page=1e20` is
 * a finite number and reached the query as one.
 */
export const MAX_PAGE = 10_000;

/** The URL counts pages from 1; the queries count from 0. */
export function pageIndex(params: RawSearchParams): number {
	const page = Number(single(params.page) ?? '1');
	return Number.isSafeInteger(page) && page > 0 && page <= MAX_PAGE
		? page - 1
		: 0;
}

export function sortDirection(params: RawSearchParams): 'asc' | 'desc' {
	return single(params.dir) === 'asc' ? 'asc' : 'desc';
}

/**
 * A link to a list screen carrying only the values that are set: `null` and
 * `undefined` are left out, so a page passes a default as null and the
 * canonical view keeps the short URL. Filter chips build their links from the
 * validated filters through this, which is what keeps a search and sort
 * alive across a status change.
 */
export function listHref(
	base: string,
	values: Record<string, string | null | undefined>,
): string {
	const query = new URLSearchParams();
	for (const [key, value] of Object.entries(values)) {
		if (value) query.set(key, value);
	}
	const suffix = query.toString();
	return suffix ? `${base}?${suffix}` : base;
}
