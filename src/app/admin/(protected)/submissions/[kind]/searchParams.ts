import type { SubmissionStatus } from '@/db';
import {
	SUBMISSION_SORT_FIELDS,
	type SubmissionSortField,
} from '@/lib/submissions';
import { STATUS_ORDER } from './presentation';

export type SubmissionFilters = {
	status: SubmissionStatus | null;
	page: number;
	sort: SubmissionSortField;
	direction: 'asc' | 'desc';
};

function single(value: string | string[] | undefined): string | undefined {
	return Array.isArray(value) ? value[0] : value;
}

/**
 * A sibling of the waitlist's `parseSearchParams`, not a generalisation of it:
 * the two screens share no filter vocabulary — the queue has `source` and a
 * search box, this one has neither — and merging them would mean a whitelist
 * parameterised over two unrelated sort unions for no gain.
 *
 * What they do share is the discipline. Every value here reaches SQL, so
 * anything not on a whitelist falls back to the default rather than being
 * passed through.
 */
export function parseSubmissionSearchParams(
	params: Record<string, string | string[] | undefined>,
): SubmissionFilters {
	const statusParam = single(params.status);
	const sortParam = single(params.sort) as SubmissionSortField | undefined;
	const pageParam = Number(single(params.page) ?? '1');

	return {
		status: STATUS_ORDER.includes(statusParam as SubmissionStatus)
			? (statusParam as SubmissionStatus)
			: null,
		// The URL counts pages from 1; everything below this line counts from 0.
		page:
			Number.isFinite(pageParam) && pageParam > 0
				? Math.floor(pageParam) - 1
				: 0,
		sort:
			sortParam && SUBMISSION_SORT_FIELDS.includes(sortParam)
				? sortParam
				: 'submittedAt',
		direction: single(params.dir) === 'asc' ? 'asc' : 'desc',
	};
}
