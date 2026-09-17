import { getTableName, is, sql } from 'drizzle-orm';
import { PgTable } from 'drizzle-orm/pg-core';
import { afterEach, beforeEach, inject, vi } from 'vitest';

import * as schema from '@/db/schema';
import { resetSlackDirectory } from '@/test/mocks/slackMembers';
import { resetSpies } from '@/test/mocks/spies';
import { resetWrappers } from '@/test/mocks/wrappers';

/**
 * Runs before every `*.db.test.ts`.
 *
 * The db project runs its files in one worker without isolation
 * (`vitest.config.mts`), so they share a module cache: `db()`, Better Auth
 * and drizzle load once per run instead of once per file, which is about half
 * the wall time. The cost is that a `vi.mock` in a test file is ignored when
 * another file already loaded the module — so every mock of a shared module
 * is registered here, once, and a test sets state through the knobs in
 * `src/test/mocks/` (ESLint rejects a file-scoped `vi.mock` in `*.db.test.ts`).
 * The worker's exit closes the pool's sockets; nothing ends it explicitly.
 *
 * `db()` is a lazy singleton that reads `NETLIFY_DB_URL` on first use, so
 * setting it here — before any test module is imported — is the whole seam.
 * `NETLIFY_DB_DRIVER` is cleared so `getDatabase()` picks node-postgres, the
 * driver that speaks to the wire server (the `serverless` driver is Neon's
 * HTTP client).
 */
process.env.NETLIFY_DB_URL = inject('databaseUrl');
delete process.env.NETLIFY_DB_DRIVER;

/**
 * Nothing loads `.env` under Vitest. Better Auth signs session cookies with
 * the secret, so `signInAs()` needs one that stays put for the run; `URL` is
 * the base URL, and an `http` origin keeps the cookie un-`Secure`, so the
 * header a test mints is the one `getSession()` reads.
 */
process.env.BETTER_AUTH_SECRET ??= 'vitest-only-secret-0123456789abcdef';
process.env.URL ??= 'http://localhost:9000';

/** The outbound edge, mocked once for every db test — spies in `src/test/mocks/`. */
vi.mock('next/cache', async () => {
	const { revalidatePath, revalidateTag } = await import('@/test/mocks/spies');
	return { revalidatePath, revalidateTag, unstable_cache: <T>(fn: T) => fn };
});

vi.mock('@/data/slackMembers', async (importOriginal) => ({
	...(await importOriginal<typeof import('@/data/slackMembers')>()),
	...(await import('@/test/mocks/slackMembers')),
}));
vi.mock('@/lib/slack/notify', async (importOriginal) => ({
	...(await importOriginal<typeof import('@/lib/slack/notify')>()),
	notifySlack: (await import('@/test/mocks/spies')).notifySlack,
}));
vi.mock('@/lib/slack/dm', async (importOriginal) => ({
	...(await importOriginal<typeof import('@/lib/slack/dm')>()),
	sendSlackDm: (await import('@/test/mocks/spies')).sendSlackDm,
}));
vi.mock('@/lib/email/transport', async () => ({
	sendEmail: (await import('@/test/mocks/spies')).sendEmail,
}));
vi.mock('@netlify/blobs', async () => {
	const { blobs } = await import('@/test/mocks/spies');
	return { getStore: () => blobs };
});
vi.mock('@/lib/submissions/attachments', async (importOriginal) => ({
	...(await importOriginal<typeof import('@/lib/submissions/attachments')>()),
	readAttachment: (await import('@/test/mocks/spies')).readAttachment,
}));
vi.mock('@/lib/github/issues', async (importOriginal) => ({
	...(await importOriginal<typeof import('@/lib/github/issues')>()),
	createLunchAndLearnIssue: (await import('@/test/mocks/spies'))
		.createLunchAndLearnIssue,
}));
vi.mock('@/lib/eventsCalendar', async (importOriginal) => ({
	...(await importOriginal<typeof import('@/lib/eventsCalendar')>()),
	...(await import('@/test/mocks/eventsCalendar')),
}));

/** `staleRead.readAs` stages the race — see `@/test/mocks/wrappers`. */
vi.mock('@/lib/waitlist/applications', async (importOriginal) =>
	(await import('@/test/mocks/wrappers')).withStaleRead(
		await importOriginal<typeof import('@/lib/waitlist/applications')>(),
		'getApplication',
	),
);
vi.mock('@/lib/submissions/submissions', async (importOriginal) =>
	(await import('@/test/mocks/wrappers')).withStaleRead(
		await importOriginal<typeof import('@/lib/submissions/submissions')>(),
		'getSubmission',
	),
);

/** `afterRead.run` fires between the read and the write — see `@/test/mocks/wrappers`. */
vi.mock('@/lib/volunteers/volunteers', async (importOriginal) =>
	(await import('@/test/mocks/wrappers')).withAfterRead(
		await importOriginal<typeof import('@/lib/volunteers/volunteers')>(),
		'pendingInvite',
	),
);

/** `preCheck.skip` makes the index do the work — see `@/test/mocks/wrappers`. */
vi.mock('@/lib/volunteers/invites', async (importOriginal) =>
	(await import('@/test/mocks/wrappers')).withSkippableCheck(
		await importOriginal<typeof import('@/lib/volunteers/invites')>(),
		'blockingInvite',
	),
);

/** Every table in the schema, so a new one is truncated without editing this. */
const tables = Object.values(schema)
	.filter((value) => is(value, PgTable))
	.map((table) => `"${getTableName(table)}"`)
	.join(', ');

beforeEach(() => {
	resetSlackDirectory();
	resetSpies();
	resetWrappers();
});

afterEach(async () => {
	const { db } = await import('@/db');
	await db().execute(sql.raw(`TRUNCATE ${tables} RESTART IDENTITY CASCADE`));
	vi.unstubAllEnvs();
});
