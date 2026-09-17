import type { SubmissionStatus } from '@/db';
import {
	SUBMISSION_SORT_FIELDS,
	type SubmissionSortField,
} from '@/lib/submissions';
import {
	oneOf,
	parseListQuery,
	type ListQuery,
	type RawSearchParams,
} from '@/util/searchParams';
import { STATUS_ORDER } from './presentation';

export type SubmissionFilters = ListQuery<SubmissionSortField> & {
	status: SubmissionStatus | null;
};

export function parseSubmissionSearchParams(
	params: RawSearchParams,
): SubmissionFilters {
	return {
		status: oneOf(params.status, STATUS_ORDER) ?? null,
		...parseListQuery(params, SUBMISSION_SORT_FIELDS, 'submittedAt'),
	};
}
