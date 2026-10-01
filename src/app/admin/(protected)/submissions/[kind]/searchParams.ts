import type { SubmissionStatus } from '@/db';
import {
	SUBMISSION_SORT_FIELDS,
	type SubmissionSortField,
} from '@/lib/submissions/submissions';
import {
	oneOf,
	parseListQuery,
	type ListQuery,
	type RawSearchParams,
} from '@/util/searchParams';
import { STATUS_ORDER } from './presentation';

type SubmissionFilters = ListQuery<SubmissionSortField> & {
	status: SubmissionStatus | null;
	/** `?failed=1`: only the ones never announced (docs/adr/0005). */
	failed: boolean;
};

export function parseSubmissionSearchParams(
	params: RawSearchParams,
): SubmissionFilters {
	return {
		status: oneOf(params.status, STATUS_ORDER) ?? null,
		failed: oneOf(params.failed, ['1']) !== undefined,
		...parseListQuery(params, SUBMISSION_SORT_FIELDS, 'submittedAt'),
	};
}
