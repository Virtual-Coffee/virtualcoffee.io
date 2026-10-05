import { describe, expect, test } from 'vitest';

import { nextState } from './status';

const now = new Date('2026-10-02T12:00:00Z');
const earlier = new Date('2026-09-01T12:00:00Z');

describe('nextState', () => {
	test.each(['resolved', 'dismissed'] as const)(
		'closing as %s stamps closedAt',
		(status) => {
			expect(nextState({ closedAt: null }, status, now)).toEqual({
				status,
				closedAt: now,
			});
		},
	);

	test('moving between closed statuses keeps the original closedAt', () => {
		expect(nextState({ closedAt: earlier }, 'dismissed', now)).toEqual({
			status: 'dismissed',
			closedAt: earlier,
		});
	});

	test.each(['new', 'in_progress'] as const)(
		'reopening as %s clears closedAt',
		(status) => {
			expect(nextState({ closedAt: earlier }, status, now)).toEqual({
				status,
				closedAt: null,
			});
		},
	);
});
