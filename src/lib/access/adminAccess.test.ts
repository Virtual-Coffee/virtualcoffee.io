import { beforeEach, describe, expect, test, vi } from 'vitest';

import {
	requirePermission,
	requireSession,
	sessionCan,
	visibleSections,
} from './adminAccess';
import { NOT_FOUND, redirectTo } from '@/test/next';
import type { Session } from './auth';
import { SECTIONS } from './permissions';

const betterAuthSession = vi.fn<() => Promise<Session | null>>();

vi.mock('./auth', () => ({
	getAuth: () => ({ api: { getSession: betterAuthSession } }),
}));

function sessionWith(role: string | null): Session {
	return { user: { role } } as unknown as Session;
}

beforeEach(() => {
	betterAuthSession.mockReset();
	betterAuthSession.mockResolvedValue(null);
});

describe('sessionCan and visibleSections', () => {
	test('no session, or a session holding nothing, sees nothing', () => {
		expect(visibleSections(null)).toEqual([]);
		expect(visibleSections(sessionWith(null))).toEqual([]);
		expect(visibleSections(sessionWith('user'))).toEqual([]);
		expect(visibleSections(sessionWith('volunteer'))).toEqual([]);
		expect(sessionCan(null, 'waitlist')).toBe(false);
	});

	test('admin sees every section in nav order', () => {
		expect(visibleSections(sessionWith('admin'))).toEqual([...SECTIONS]);
	});

	test('a narrow role sees only its own section', () => {
		expect(visibleSections(sessionWith('coc_reviewer'))).toEqual(['coc']);
		expect(sessionCan(sessionWith('coc_reviewer'), 'coc', 'manage')).toBe(true);
		expect(sessionCan(sessionWith('coc_reviewer'), 'waitlist')).toBe(false);
	});

	test('a comma-separated role string is the union, unknown entries ignored', () => {
		expect(
			visibleSections(
				sessionWith('volunteer, waitlist_reviewer,coc_reviewer,x'),
			),
		).toEqual(['waitlist', 'coc']);
	});
});

describe('requireSession and requirePermission', () => {
	test('a role-less session is sent to sign in', async () => {
		betterAuthSession.mockResolvedValue(sessionWith('volunteer'));
		await expect(requireSession()).rejects.toMatchObject(
			redirectTo('/admin/sign-in'),
		);
	});

	test('a 404, not a 403, for a section the role does not hold', async () => {
		betterAuthSession.mockResolvedValue(sessionWith('volunteer_coordinator'));
		await expect(requirePermission('coc')).rejects.toMatchObject(NOT_FOUND);
		await expect(
			requirePermission('volunteerSignups', 'manage'),
		).resolves.toMatchObject({ user: { role: 'volunteer_coordinator' } });
	});

	test('nobody signed in is sent to sign in', async () => {
		await expect(requireSession()).rejects.toMatchObject(
			redirectTo('/admin/sign-in'),
		);
	});
});
