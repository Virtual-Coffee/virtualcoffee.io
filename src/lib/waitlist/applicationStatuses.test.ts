import { describe, expect, test } from 'vitest';

import { applicationStatus } from '@/db/schema';

import {
	ACTIONS_FROM,
	ARCHIVE_STATUSES,
	QUEUE_STATUSES,
	can,
} from './applicationStatuses';

describe('queue and archive', () => {
	test('never show the same row, and between them show every status', () => {
		const overlap = QUEUE_STATUSES.filter((s) => ARCHIVE_STATUSES.includes(s));
		expect(overlap).toEqual([]);

		const covered = [...QUEUE_STATUSES, ...ARCHIVE_STATUSES].sort();
		expect(covered).toEqual([...applicationStatus.enumValues].sort());
	});
});

describe('the transition table', () => {
	test('covers every status, and offers nothing from a closed one', () => {
		expect(Object.keys(ACTIONS_FROM).sort()).toEqual(
			[...applicationStatus.enumValues].sort(),
		);
		for (const status of ['lapsed', 'declined', 'withdrawn'] as const) {
			expect(ACTIONS_FROM[status]).toEqual([]);
		}
	});

	test('can() reads the table', () => {
		expect(can('waitlisted', 'coffeeInvite')).toBe(true);
		expect(can('waitlisted', 'approve')).toBe(false);
		expect(can('coffee_invited', 'close')).toBe(true);
		expect(can('member', 'close')).toBe(false);
		expect(can('member', 'resendSlackInvite')).toBe(true);
		expect(can('declined', 'close')).toBe(false);
	});
});
