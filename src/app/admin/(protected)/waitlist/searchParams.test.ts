import { describe, expect, test } from 'vitest';

import { ARCHIVE_STATUSES, QUEUE_STATUSES } from '@/lib/applications';

import { parseSearchParams } from './searchParams';

describe('parseSearchParams', () => {
	test('a status the page does not list falls back to its own defaults', () => {
		// The archive must not show the live queue for a pasted `?status=`,
		// and the queue must not show the archive.
		expect(
			parseSearchParams({ status: 'waitlisted' }, ARCHIVE_STATUSES).statuses,
		).toEqual(ARCHIVE_STATUSES);
		expect(
			parseSearchParams({ status: 'member' }, QUEUE_STATUSES).statuses,
		).toEqual(QUEUE_STATUSES);
	});

	test('one of the page’s own statuses narrows to it', () => {
		expect(
			parseSearchParams({ status: 'declined' }, ARCHIVE_STATUSES).statuses,
		).toEqual(['declined']);
	});

	test('`all` lifts the filter; a repeated key reads the first value', () => {
		expect(parseSearchParams({ status: 'all' }, QUEUE_STATUSES).statuses).toBe(
			undefined,
		);
		expect(
			parseSearchParams(
				{ status: ['coffee_invited', 'member'] },
				QUEUE_STATUSES,
			).statuses,
		).toEqual(['coffee_invited']);
	});
});
