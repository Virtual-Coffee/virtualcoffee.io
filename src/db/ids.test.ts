import { describe, expect, test } from 'vitest';
import { version } from 'uuid';

import { isId, newId } from './ids';

describe('newId', () => {
	test('is a UUIDv7, and successive ids sort in creation order', () => {
		const first = newId();
		const second = newId();
		expect(version(first)).toBe(7);
		expect(first < second).toBe(true);
	});
});

describe('isId', () => {
	test('accepts what newId makes', () => {
		expect(isId(newId())).toBe(true);
	});

	/**
	 * Each of these would reach Postgres as a malformed literal against a
	 * `uuid` column and throw 22P02 instead of matching nothing.
	 */
	test.each([
		'',
		'1',
		'42',
		'not-a-uuid',
		'0199404c-2c5e-7000-8000-0000000000000',
		'0199404c-2c5e-7000-8000-00000000000g',
		"'; drop table membership_application; --",
	])('rejects %j', (value) => {
		expect(isId(value)).toBe(false);
	});
});
