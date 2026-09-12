import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import {
	adminRoutesEnabled,
	getSession,
	requirePermission,
	requireSession,
	sessionCan,
	visibleSections,
} from './adminAccess';
import type { Session } from './auth';
import { SECTIONS } from './permissions';

function sessionWith(role: string | null): Session {
	return { user: { role } } as unknown as Session;
}

/** `redirect()` and `notFound()` throw; the digest says where to. */
const redirectTo = (path: string) => ({
	digest: expect.stringMatching(`^NEXT_REDIRECT;[a-z]+;${path};`),
});
const notFound = { digest: 'NEXT_HTTP_ERROR_FALLBACK;404' };

const unset = {
	CONTEXT: undefined,
	PREVIEW_ADMIN_BYPASS: undefined,
	PREVIEW_ADMIN_BYPASS_ROLES: undefined,
	ADMIN_DEV_BYPASS: undefined,
	ADMIN_DEV_BYPASS_ROLES: undefined,
	ADMIN_DEV_BYPASS_SLACK_ID: undefined,
};

function env(values: Record<string, string | undefined>) {
	for (const [key, value] of Object.entries({ ...unset, ...values })) {
		vi.stubEnv(key, value);
	}
}

beforeEach(() => env({}));
afterEach(() => vi.unstubAllEnvs());

describe('adminRoutesEnabled', () => {
	test('is always on in production and locally', () => {
		env({ CONTEXT: 'production' });
		expect(adminRoutesEnabled()).toBe(true);
		env({ CONTEXT: 'dev' });
		expect(adminRoutesEnabled()).toBe(true);
		env({ CONTEXT: undefined });
		expect(adminRoutesEnabled()).toBe(true);
	});

	test.each(['deploy-preview', 'branch-deploy'])(
		'on a %s it needs PREVIEW_ADMIN_BYPASS=true exactly',
		(context) => {
			env({ CONTEXT: context });
			expect(adminRoutesEnabled()).toBe(false);
			env({ CONTEXT: context, PREVIEW_ADMIN_BYPASS: '1' });
			expect(adminRoutesEnabled()).toBe(false);
			env({ CONTEXT: context, PREVIEW_ADMIN_BYPASS: 'true' });
			expect(adminRoutesEnabled()).toBe(true);
		},
	);
});

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
		// With no bypass, getSession() goes to Better Auth, which needs a
		// request; requireSession() reaching that far is the observable.
		await expect(getSession()).rejects.toThrow();
	});

	test('netlify dev sets CONTEXT=dev, and that still counts as local', async () => {
		env({ ADMIN_DEV_BYPASS: 'true', CONTEXT: 'dev' });
		expect((await getSession())?.user).toMatchObject({ id: 'dev-bypass' });
	});
});

describe('the preview bypass session', () => {
	test('only fires in a deployed preview context', async () => {
		env({ PREVIEW_ADMIN_BYPASS: 'true', CONTEXT: 'deploy-preview' });
		expect((await getSession())?.user).toMatchObject({
			id: 'preview-bypass',
			role: 'admin',
			slackUserId: 'U_PREVIEW_BYPASS',
		});

		env({
			PREVIEW_ADMIN_BYPASS: 'true',
			PREVIEW_ADMIN_BYPASS_ROLES: 'volunteer',
			CONTEXT: 'branch-deploy',
		});
		expect((await getSession())?.user).toMatchObject({ role: 'volunteer' });
	});

	test.each(['production', 'dev', undefined])(
		'never locally or in production (CONTEXT=%s)',
		async (context) => {
			env({ PREVIEW_ADMIN_BYPASS: 'true', CONTEXT: context });
			await expect(getSession()).rejects.toThrow();
		},
	);
});

describe('sessionCan and visibleSections', () => {
	test('no session, or a session holding nothing, sees nothing', () => {
		expect(visibleSections(null)).toEqual([]);
		expect(visibleSections(sessionWith(null))).toEqual([]);
		expect(visibleSections(sessionWith('user'))).toEqual([]);
		expect(visibleSections(sessionWith('volunteer'))).toEqual([]);
		expect(sessionCan(null, 'dashboard')).toBe(false);
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
		await expect(requirePermission('coc')).rejects.toMatchObject(notFound);
		await expect(
			requirePermission('volunteerSignups', 'manage'),
		).resolves.toMatchObject({ user: { role: 'volunteer_coordinator' } });
	});

	test('the whole tree 404s on a preview without the bypass', async () => {
		env({ ADMIN_DEV_BYPASS: 'true', CONTEXT: 'deploy-preview' });
		await expect(requireSession()).rejects.toMatchObject(notFound);
	});
});
