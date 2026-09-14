import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import {
	getSession,
	requirePermission,
	requireSession,
	sessionCan,
	visibleSections,
} from './adminAccess';
import { NOT_FOUND, redirectTo } from '@/test/next';
import { requestHeaders } from '@/test/requestHeaders';
import type { Session } from './auth';
import { SECTIONS } from './permissions';

const betterAuthSession = vi.fn<() => Promise<Session | null>>();

vi.mock('./auth', () => ({
	getAuth: () => ({ api: { getSession: betterAuthSession } }),
}));

function sessionWith(role: string | null): Session {
	return { user: { role } } as unknown as Session;
}

const unset = {
	CONTEXT: undefined,
	ADMIN_DEV_BYPASS: undefined,
	ADMIN_DEV_BYPASS_ROLES: undefined,
	ADMIN_DEV_BYPASS_SLACK_ID: undefined,
};

function env(values: Record<string, string | undefined>) {
	for (const [key, value] of Object.entries({ ...unset, ...values })) {
		vi.stubEnv(key, value);
	}
}

beforeEach(() => {
	env({});
	betterAuthSession.mockReset();
	betterAuthSession.mockResolvedValue(null);
});
afterEach(() => vi.unstubAllEnvs());

describe('the dev bypass session', () => {
	test('is an admin with the seeded Slack id by default', async () => {
		env({ ADMIN_DEV_BYPASS: 'true' });
		const session = await getSession();
		expect(session?.user).toMatchObject({
			id: 'dev-bypass',
			role: 'admin',
			slackUserId: 'U_DEV_BYPASS',
		});
	});

	test('takes its roles and Slack id from the environment', async () => {
		env({
			ADMIN_DEV_BYPASS: 'true',
			ADMIN_DEV_BYPASS_ROLES: ' volunteer ',
			ADMIN_DEV_BYPASS_SLACK_ID: 'U0AB12CD3',
		});
		const session = await getSession();
		expect(session?.user).toMatchObject({
			role: 'volunteer',
			slackUserId: 'U0AB12CD3',
		});
	});

	/**
	 * Each condition is independently sufficient to disable it. `NODE_ENV` is
	 * the third; Vitest pins it to `test`, and stubbing it would also change
	 * how the modules under test were loaded, so it is covered by reading the
	 * source rather than here.
	 */
	test.each([
		['not opted in', { ADMIN_DEV_BYPASS: undefined }],
		['opted in with the wrong value', { ADMIN_DEV_BYPASS: '1' }],
		['on a deploy', { ADMIN_DEV_BYPASS: 'true', CONTEXT: 'production' }],
		[
			'on a deploy preview',
			{ ADMIN_DEV_BYPASS: 'true', CONTEXT: 'deploy-preview' },
		],
		[
			'on a branch deploy',
			{ ADMIN_DEV_BYPASS: 'true', CONTEXT: 'branch-deploy' },
		],
	])('is off when %s', async (_label, values) => {
		env(values);
		await expect(getSession()).resolves.toBeNull();
		expect(betterAuthSession).toHaveBeenCalledOnce();
	});

	test('netlify dev sets CONTEXT=dev, and that still counts as local', async () => {
		env({ ADMIN_DEV_BYPASS: 'true', CONTEXT: 'dev' });
		expect((await getSession())?.user).toMatchObject({ id: 'dev-bypass' });
	});

	test('is not consulted without a session cookie', async () => {
		env({ ADMIN_DEV_BYPASS: 'true' });
		await getSession();
		expect(betterAuthSession).not.toHaveBeenCalled();
	});

	/**
	 * The devtools panel's "switch user" sets a real session cookie; it has to
	 * win while the bypass is on, or the switch does nothing visible.
	 */
	test('yields to a real session when the request carries one', async () => {
		env({ ADMIN_DEV_BYPASS: 'true' });
		const real = sessionWith('coc_reviewer');
		betterAuthSession.mockResolvedValue(real);
		requestHeaders.current = new Headers({
			cookie: 'better-auth.session_token=abc.def',
		});

		await expect(getSession()).resolves.toBe(real);
	});

	test('is the fallback for a cookie whose session is gone', async () => {
		env({ ADMIN_DEV_BYPASS: 'true' });
		requestHeaders.current = new Headers({
			cookie: '__Secure-better-auth.session_token=abc.def',
		});

		expect((await getSession())?.user).toMatchObject({ id: 'dev-bypass' });
		expect(betterAuthSession).toHaveBeenCalledOnce();
	});
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
		env({ ADMIN_DEV_BYPASS: 'true', ADMIN_DEV_BYPASS_ROLES: 'volunteer' });
		await expect(requireSession()).rejects.toMatchObject(
			redirectTo('/admin/sign-in'),
		);
	});

	test('a 404, not a 403, for a section the role does not hold', async () => {
		env({
			ADMIN_DEV_BYPASS: 'true',
			ADMIN_DEV_BYPASS_ROLES: 'volunteer_coordinator',
		});
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
