import { getTableName, is, sql } from 'drizzle-orm';
import { PgTable } from 'drizzle-orm/pg-core';
import { afterAll, afterEach, inject, vi } from 'vitest';

import * as schema from '@/db/schema';

/**
 * Runs before every `*.db.test.ts`.
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

afterEach(async () => {
	const { db } = await import('@/db');
	await db().execute(sql.raw(`TRUNCATE ${tables} RESTART IDENTITY CASCADE`));
	vi.unstubAllEnvs();
});

afterAll(async () => {
	// Idle pg clients would otherwise hold the worker open past the run.
	const { db } = await import('@/db');
	const client = (
		db() as unknown as { $client?: { pool?: { end(): Promise<void> } } }
	).$client;
	await client?.pool?.end();
});
