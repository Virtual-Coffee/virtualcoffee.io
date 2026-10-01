import { getAuth } from '@/lib/access/auth';
import { insertUser } from '@/test/db/fixtures';
import { requestHeaders } from '@/test/requestHeaders';

/**
 * Sign a test in as a real user: a `user` row holding `roles`, a `session`
 * row minted by Better Auth's `testUtils` plugin (`src/lib/access/auth.ts`), and
 * the session cookie on the mocked request (`src/test/setup.ts`), so
 * `getSession()` and everything
 * above it — `requirePermission()`, `requireVolunteer()`, `actorId()` — run
 * exactly as they do for a signed-in maintainer. Needs the `db` project.
 *
 * Every call is a new user: email and Slack id are unique columns, and a test
 * that signs in twice is switching identity. The name is the dev bypass's, so
 * what an action records as the actor reads the same either way.
 */
export async function signInAs(
	roles: string,
	slackUserId?: string,
): Promise<{ userId: string; email: string; slackUserId: string }> {
	if (!process.env.NETLIFY_DB_URL) {
		throw new Error(
			'signInAs() mints a real session and needs the db project (*.db.test.ts).',
		);
	}

	const n = ++actors;
	const actor = {
		email: `actor-${n}@localhost`,
		slackUserId: slackUserId ?? `U_TEST_ACTOR_${n}`,
	};
	const { id: userId } = await insertUser({
		role: roles,
		name: 'Local dev',
		...actor,
	});
	const { test } = await getAuth().$context;
	requestHeaders.current = await test.getAuthHeaders({ userId });

	return { userId, ...actor };
}

let actors = 0;
