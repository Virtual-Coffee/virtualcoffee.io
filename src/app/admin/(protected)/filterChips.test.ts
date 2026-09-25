import { describe, expect, test } from 'vitest';

import { chipHref } from './filterChips';

describe('chipHref', () => {
	test('keeps the other filters and the sort', () => {
		expect(
			chipHref(
				'/admin/waitlist',
				{ source: 'volunteer_invite', q: 'ada', sort: 'name', dir: 'asc' },
				'status',
				'waitlisted',
			),
		).toBe(
			'/admin/waitlist?source=volunteer_invite&q=ada&sort=name&dir=asc&status=waitlisted',
		);
	});

	test('the page is never kept, because a filter changes which rows exist', () => {
		// `keep` is the page's validated filters, and `page` is not one of them.
		expect(chipHref('/admin/waitlist', { q: 'ada' }, 'status', 'member')).toBe(
			'/admin/waitlist?q=ada&status=member',
		);
	});

	test('a null value is the default view, so it carries no param', () => {
		expect(chipHref('/admin/waitlist', { q: 'ada' }, 'status', null)).toBe(
			'/admin/waitlist?q=ada',
		);
	});

	test('the default of every value is the bare path', () => {
		expect(
			chipHref('/admin/waitlist', { q: null, sort: null }, 'status', null),
		).toBe('/admin/waitlist');
	});

	test('the chip wins over the same param in `keep`', () => {
		expect(
			chipHref('/admin/waitlist', { status: 'member' }, 'status', 'lapsed'),
		).toBe('/admin/waitlist?status=lapsed');
	});
});
