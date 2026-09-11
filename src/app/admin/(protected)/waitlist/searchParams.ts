import { applicationStatus, type ApplicationStatus } from '@/db';
import {
	PAGE_SIZE,
	QUEUE_STATUSES,
	type ListFilters,
	type SortField,
} from '@/lib/applications';

const SORT_FIELDS: SortField[] = [
	'name',
	'email',
	'status',
	'source',
	'submittedAt',
];

// Read off the pgEnum so a new status is accepted here without a second edit.
const ALL_STATUSES: readonly ApplicationStatus[] = applicationStatus.enumValues;

export type RawSearchParams = Record<string, string | string[] | undefined>;

function single(value: string | string[] | undefined): string | undefined {
	return Array.isArray(value) ? value[0] : value;
}

/**
 * Table state lives in the URL rather than component state, so a filtered view
 * is bookmarkable and can be pasted to another maintainer. Everything is
 * validated here — these values reach SQL.
 */
export function parseSearchParams(
	params: RawSearchParams,
	options: { defaultStatuses: ApplicationStatus[]; defaultSort?: SortField },
): ListFilters {
	const statusParam = single(params.status);
	const sourceParam = single(params.source);
	const sortParam = single(params.sort) as SortField | undefined;
	const pageParam = Number(single(params.page) ?? '1');

	const statuses =
		statusParam === 'all'
			? undefined
			: statusParam && ALL_STATUSES.includes(statusParam as ApplicationStatus)
				? [statusParam as ApplicationStatus]
				: options.defaultStatuses.length
					? options.defaultStatuses
					: undefined;

	return {
		statuses,
		source:
			sourceParam === 'waitlist_signup' || sourceParam === 'volunteer_invite'
				? sourceParam
				: undefined,
		search: single(params.q) ?? undefined,
		page:
			Number.isFinite(pageParam) && pageParam > 0
				? Math.floor(pageParam) - 1
				: 0,
		pageSize: PAGE_SIZE,
		sort:
			sortParam && SORT_FIELDS.includes(sortParam)
				? sortParam
				: (options.defaultSort ?? 'submittedAt'),
		direction: single(params.dir) === 'asc' ? 'asc' : 'desc',
	};
}

export const QUEUE_DEFAULT_STATUSES = QUEUE_STATUSES;
