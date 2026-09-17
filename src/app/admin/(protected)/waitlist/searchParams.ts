import type { ApplicationStatus } from '@/db';
import type { ListFilters, SortField } from '@/lib/applications';
import {
	oneOf,
	PAGE_SIZE,
	parseListQuery,
	single,
	type RawSearchParams,
} from '@/util/searchParams';

const SORT_FIELDS: SortField[] = [
	'name',
	'email',
	'status',
	'source',
	'submittedAt',
];

export function parseSearchParams(
	params: RawSearchParams,
	defaultStatuses: ApplicationStatus[],
): ListFilters {
	const status = single(params.status);
	// Only the page's own statuses: the archive must not list the live queue
	// because someone pasted `?status=waitlisted`, nor the queue the archive.
	const chosen = oneOf(status, defaultStatuses);

	return {
		statuses:
			status === 'all' ? undefined : chosen ? [chosen] : defaultStatuses,
		source: oneOf(params.source, ['waitlist_signup', 'volunteer_invite']),
		search: single(params.q) ?? undefined,
		pageSize: PAGE_SIZE,
		...parseListQuery(params, SORT_FIELDS, 'submittedAt'),
	};
}
