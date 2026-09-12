import { describe, expect, test } from 'vitest';

import { applicationStatus } from '@/db/schema';

import {
	ARCHIVE_STATUSES,
	getApplication,
	getApplicationInviter,
	QUEUE_STATUSES,
} from './applications';

describe('queue and archive', () => {
	test('never show the same row, and between them show every status', () => {
		const overlap = QUEUE_STATUSES.filter((s) => ARCHIVE_STATUSES.includes(s));
		expect(overlap).toEqual([]);

		const covered = [...QUEUE_STATUSES, ...ARCHIVE_STATUSES].sort();
		expect(covered).toEqual([...applicationStatus.enumValues].sort());
	});
});

describe('guards that answer before the database', () => {
	test('a malformed id is null, not a 22P02', async () => {
		await expect(getApplication('42')).resolves.toBeNull();
	});

	test('an application with no invite has no inviter', async () => {
		await expect(getApplicationInviter(null)).resolves.toBeNull();
	});
});
