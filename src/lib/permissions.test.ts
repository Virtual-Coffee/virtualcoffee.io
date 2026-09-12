import { describe, expect, test } from 'vitest';

import {
	DEFAULT_ROLE,
	GRANTABLE_ROLE_NAMES,
	GRANTABLE_ROLES,
	grantedRoles,
	parseRoles,
	ROLE_LABELS,
	roles,
	SECTIONS,
	serialiseRoles,
	type RoleName,
	type Section,
} from './permissions';

function can(role: RoleName, section: Section | 'dashboard', action: string) {
	return (
		roles[role].authorize({ [section]: [action] } as never).success === true
	);
}

describe('the role string', () => {
	test('parseRoles splits on commas, trims, and drops what it does not know', () => {
		expect(parseRoles('admin, coc_reviewer ,nope,,')).toEqual([
			'admin',
			'coc_reviewer',
		]);
		expect(parseRoles(null)).toEqual([]);
		expect(parseRoles(undefined)).toEqual([]);
		expect(parseRoles('')).toEqual([]);
	});

	test('serialiseRoles dedupes, drops the default, and writes the default for nothing', () => {
		expect(serialiseRoles(['coc_reviewer', 'admin', 'coc_reviewer'])).toBe(
			'coc_reviewer,admin',
		);
		expect(serialiseRoles(['user'])).toBe(DEFAULT_ROLE);
		expect(serialiseRoles([])).toBe(DEFAULT_ROLE);
	});

	test('grantedRoles is the one that answers "holds nothing"', () => {
		expect(parseRoles('user')).toEqual(['user']);
		expect(grantedRoles('user')).toEqual([]);
		expect(grantedRoles('user,volunteer')).toEqual(['volunteer']);
	});
});

/** Section → [read, manage], so a failure names the section. */
function grants(role: RoleName): Record<Section, [boolean, boolean]> {
	return Object.fromEntries(
		SECTIONS.map((section) => [
			section,
			[can(role, section, 'read'), can(role, section, 'manage')],
		]),
	) as Record<Section, [boolean, boolean]>;
}

const NONE = grants('user');

describe('what each role grants', () => {
	test('admin holds every section, read and manage', () => {
		expect(grants('admin')).toEqual(
			Object.fromEntries(SECTIONS.map((section) => [section, [true, true]])),
		);
		expect(can('admin', 'dashboard', 'read')).toBe(true);
	});

	test.each<[RoleName, Section]>([
		['waitlist_reviewer', 'waitlist'],
		['coc_reviewer', 'coc'],
		['volunteer_coordinator', 'volunteerSignups'],
		['lunch_and_learn_organizer', 'lunchAndLearn'],
		['coffee_table_organizer', 'coffeeTables'],
	])('%s holds %s and the dashboard, nothing else', (role, own) => {
		expect(can(role, 'dashboard', 'read')).toBe(true);
		expect(grants(role)).toEqual({ ...NONE, [own]: [true, true] });
	});

	test('user and volunteer grant no section at all — volunteer on purpose', () => {
		expect(Object.values(NONE).flat()).not.toContain(true);
		expect(grants('volunteer')).toEqual(NONE);
		expect(can('user', 'dashboard', 'read')).toBe(false);
		expect(can('volunteer', 'dashboard', 'read')).toBe(false);
	});

	test('only admin carries the built-in user-management statements', () => {
		const canBan = (Object.keys(roles) as RoleName[]).filter(
			(role) => roles[role].authorize({ user: ['ban'] } as never).success,
		);
		expect(canBan).toEqual(['admin']);
	});
});

describe('the grantable list', () => {
	test('names only real roles, and excludes user and volunteer', () => {
		expect(GRANTABLE_ROLES.filter(({ name }) => !(name in roles))).toEqual([]);
		expect(GRANTABLE_ROLE_NAMES.has('user')).toBe(false);
		expect(GRANTABLE_ROLE_NAMES.has('volunteer')).toBe(false);
	});

	test('every role has a label, including the ones nobody grants here', () => {
		const unlabelled = (Object.keys(roles) as RoleName[]).filter(
			(name) => !ROLE_LABELS[name],
		);
		expect(unlabelled).toEqual([]);
	});
});
