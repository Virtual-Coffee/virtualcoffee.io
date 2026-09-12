import { applicationStatus, type ApplicationStatus } from '@/db';
import {
	PAGE_SIZE,
	type ListFilters,
	type SortField,
} from '@/lib/applications';
import {
	oneOf,
	pageIndex,
	single,
	sortDirection,
	type RawSearchParams,
} from '../searchParams';

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
	// Read off the pgEnum so a new status is accepted here without a second edit.
	const chosen = oneOf(status, applicationStatus.enumValues);

	return {
		statuses:
			status === 'all' ? undefined : chosen ? [chosen] : defaultStatuses,
		source: oneOf(params.source, ['waitlist_signup', 'volunteer_invite']),
		search: single(params.q) ?? undefined,
		page: pageIndex(params),
		pageSize: PAGE_SIZE,
		sort: oneOf(params.sort, SORT_FIELDS) ?? 'submittedAt',
		direction: sortDirection(params),
	};
}
