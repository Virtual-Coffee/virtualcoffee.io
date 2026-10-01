import { describe, expect, test } from 'vitest';

import { listHref, MAX_PAGE, pageIndex, parseListQuery } from './searchParams';

const SORT_FIELDS = ['name', 'submittedAt'] as const;

describe('pageIndex', () => {
	test('counts from 1 in the URL and from 0 in the query', () => {
		expect(pageIndex({})).toBe(0);
		expect(pageIndex({ page: '1' })).toBe(0);
		expect(pageIndex({ page: '3' })).toBe(2);
		expect(pageIndex({ page: ['4', '9'] })).toBe(3);
	});

	test('anything that is not a whole page number is page one', () => {
		expect(pageIndex({ page: 'abc' })).toBe(0);
		expect(pageIndex({ page: '0' })).toBe(0);
		expect(pageIndex({ page: '-1' })).toBe(0);
		expect(pageIndex({ page: '2.7' })).toBe(0);
	});

	test('a page beyond the cap is page one, not an OFFSET that overflows', () => {
		// `Number('1e20')` is finite, and `1e20 * PAGE_SIZE` is past bigint.
		expect(pageIndex({ page: '1e20' })).toBe(0);
		expect(pageIndex({ page: String(MAX_PAGE) })).toBe(MAX_PAGE - 1);
		expect(pageIndex({ page: String(MAX_PAGE + 1) })).toBe(0);
	});
});

describe('parseListQuery', () => {
	test('nothing in the URL is page one of the default sort, descending', () => {
		expect(parseListQuery({}, SORT_FIELDS, 'submittedAt')).toEqual({
			page: 0,
			sort: 'submittedAt',
			direction: 'desc',
		});
	});

	test('reads a whitelisted sort and an ascending direction', () => {
		expect(
			parseListQuery(
				{ page: '2', sort: 'name', dir: 'asc' },
				SORT_FIELDS,
				'submittedAt',
			),
		).toEqual({ page: 1, sort: 'name', direction: 'asc' });
	});

	test('a column that is not sortable falls back to the default', () => {
		// The value reaches an ORDER BY, so only the caller's list is accepted.
		expect(
			parseListQuery({ sort: 'email' }, SORT_FIELDS, 'submittedAt').sort,
		).toBe('submittedAt');
	});
});

describe('listHref', () => {
	test('carries only the values that are set', () => {
		expect(
			listHref('/admin/waitlist', {
				status: 'waitlisted',
				source: undefined,
				q: 'ada',
				sort: null,
			}),
		).toBe('/admin/waitlist?status=waitlisted&q=ada');
	});

	test('no values at all is the bare path', () => {
		expect(listHref('/admin/waitlist', { status: null, q: '' })).toBe(
			'/admin/waitlist',
		);
	});

	test('encodes a search term', () => {
		expect(listHref('/x', { q: 'a b&c' })).toBe('/x?q=a+b%26c');
	});
});
