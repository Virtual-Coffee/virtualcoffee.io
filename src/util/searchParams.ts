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

/** The URL counts pages from 1; the queries count from 0. */
export function pageIndex(params: RawSearchParams): number {
	const page = Number(single(params.page) ?? '1');
	return Number.isFinite(page) && page > 0 ? Math.floor(page) - 1 : 0;
}

export function sortDirection(params: RawSearchParams): 'asc' | 'desc' {
	return single(params.dir) === 'asc' ? 'asc' : 'desc';
}
