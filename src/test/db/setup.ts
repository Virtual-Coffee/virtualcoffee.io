import { getTableName, is, sql } from 'drizzle-orm';
import { PgTable } from 'drizzle-orm/pg-core';
import { afterEach, beforeEach, inject, vi } from 'vitest';

import * as schema from '@/db/schema';
import { resetMocks } from '@/test/mocks';

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

/**
 * `revalidatePath()` throws outside a Next request ("static generation store
 * missing"), and every admin action calls it after writing.
 */
vi.mock('next/cache', () => ({
	revalidatePath: vi.fn(),
	revalidateTag: vi.fn(),
	unstable_cache: <T>(fn: T) => fn,
}));

/** Every table in the schema, so a new one is truncated without editing this. */
const tables = Object.values(schema)
	.filter((value) => is(value, PgTable))
	.map((table) => `"${getTableName(table)}"`)
	.join(', ');

beforeEach(() => {
	resetMocks();
});

afterEach(async () => {
	const { db } = await import('@/db');
	await db().execute(sql.raw(`TRUNCATE ${tables} RESTART IDENTITY CASCADE`));
	vi.unstubAllEnvs();
});
