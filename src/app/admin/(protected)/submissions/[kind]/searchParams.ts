import type { SubmissionStatus } from '@/db';
import {
	SUBMISSION_SORT_FIELDS,
	type SubmissionSortField,
} from '@/lib/submissions';
import {
	oneOf,
	pageIndex,
	sortDirection,
	type RawSearchParams,
} from '../../searchParams';
import { STATUS_ORDER } from './presentation';

export type SubmissionFilters = {
	status: SubmissionStatus | null;
	page: number;
	sort: SubmissionSortField;
	direction: 'asc' | 'desc';
};

export function parseSubmissionSearchParams(
	params: RawSearchParams,
): SubmissionFilters {
	return {
		status: oneOf(params.status, STATUS_ORDER) ?? null,
		page: pageIndex(params),
		sort: oneOf(params.sort, SUBMISSION_SORT_FIELDS) ?? 'submittedAt',
		direction: sortDirection(params),
	};
}
