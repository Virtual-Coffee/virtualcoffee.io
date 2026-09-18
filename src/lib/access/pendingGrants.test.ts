import { describe, expect, test } from 'vitest';

import { withoutVolunteerRole, withVolunteerRole } from './pendingGrants';

describe('withVolunteerRole', () => {
	test('adds volunteer without dropping anything already held', () => {
		expect(withVolunteerRole('coc_reviewer')).toBe('coc_reviewer,volunteer');
		expect(withVolunteerRole(null)).toBe('volunteer');
		expect(withVolunteerRole('user')).toBe('volunteer');
	});

	test('is idempotent', () => {
		expect(withVolunteerRole('volunteer')).toBe('volunteer');
		expect(withVolunteerRole('admin,volunteer')).toBe('admin,volunteer');
	});
});

describe('withoutVolunteerRole', () => {
	test('removes only volunteer, leaving the default when nothing is left', () => {
		expect(withoutVolunteerRole('admin,volunteer')).toBe('admin');
		expect(withoutVolunteerRole('volunteer')).toBe('user');
		expect(withoutVolunteerRole('coc_reviewer')).toBe('coc_reviewer');
		expect(withoutVolunteerRole(null)).toBe('user');
	});
});
