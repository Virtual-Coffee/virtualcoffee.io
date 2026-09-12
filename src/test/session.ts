import { expect, vi } from 'vitest';

/**
 * Authenticate a test through the dev-bypass session.
 *
 * `getSession()` in `src/lib/adminAccess.ts` returns this session before it
 * touches `next/headers` or Better Auth, so the real `requirePermission()` and
 * `requireVolunteer()` run against the roles named here. Pair with
 * `vi.unstubAllEnvs()` in an `afterEach`.
 */
export function signInAs(roles: string, slackUserId = 'U_TEST_ACTOR'): void {
	vi.stubEnv('CONTEXT', undefined);
	vi.stubEnv('PREVIEW_ADMIN_BYPASS', undefined);
	vi.stubEnv('ADMIN_DEV_BYPASS', 'true');
	vi.stubEnv('ADMIN_DEV_BYPASS_ROLES', roles);
	vi.stubEnv('ADMIN_DEV_BYPASS_SLACK_ID', slackUserId);
}

/** What `notFound()` throws — the 404 a wrong-section role gets. */
export const NOT_FOUND = { digest: 'NEXT_HTTP_ERROR_FALLBACK;404' };

/** What `redirect(path)` throws. */
export const redirectTo = (path: string) => ({
	digest: expect.stringMatching(
		`^NEXT_REDIRECT;[a-z]+;${path.replace(/[?]/g, '\\?')};`,
	),
});
