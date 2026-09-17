import { describe, expect, test } from 'vitest';

import { applicationStatus } from '@/db/schema';

import { ARCHIVE_STATUSES, QUEUE_STATUSES } from './applicationStatuses';

describe('queue and archive', () => {
	test('never show the same row, and between them show every status', () => {
		const overlap = QUEUE_STATUSES.filter((s) => ARCHIVE_STATUSES.includes(s));
		expect(overlap).toEqual([]);

		const covered = [...QUEUE_STATUSES, ...ARCHIVE_STATUSES].sort();
		expect(covered).toEqual([...applicationStatus.enumValues].sort());
	});
});
