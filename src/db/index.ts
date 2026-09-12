import { getDatabase } from '@netlify/database';
import { drizzle } from 'drizzle-orm/netlify-db';
import type { PgAsyncDatabase, PgQueryResultHKT } from 'drizzle-orm/pg-core';

/**
 * The driver is decided at runtime, so this is the supertype both outcomes
 * share rather than either concrete one: `drizzle-orm/netlify-db` hands back a
 * `NetlifyDbDatabase` on deploys (Neon over HTTP, with a pool for transactions)
 * and a `NodePgDatabase` under `netlify dev`, which runs a plain Postgres. The
 * query builder is identical on both; only the raw result of a statement
 * without `.returning()` differs, and the one thing this codebase reads off it
 * is `rowCount` — which both drivers supply, so that is all this HKT promises.
 */
interface SharedQueryResultHKT extends PgQueryResultHKT {
	type: { rowCount: number | null };
}

export type Database = PgAsyncDatabase<SharedQueryResultHKT>;

function createDatabase(): Database {
	// `getDatabase()` picks the driver from `NETLIFY_DB_DRIVER` and returns the
	// client shape the adapter accepts. It is still worth going through rather
	// than letting the adapter read the environment itself: it re-reads the
	// connection string on rotation and installs Neon's WebSocket shim.
	//
	// In the Netlify runtime it finds `NETLIFY_DB_URL` on its own. One-off
	// scripts (seed, Airtable import) run outside that runtime — even under
	// `netlify dev:exec`, which injects project env vars but not
	// `NETLIFY_DB_URL` — so they pass the connection string via `DATABASE_URL`.
	// See `scripts/with-local-netlify.ts`.
	const override = process.env.NETLIFY_DB_URL ?? process.env.DATABASE_URL;
	const client = getDatabase(override ? { connectionString: override } : {});

	return drizzle({ client });
}

let cached: Database | undefined;

/**
 * Lazily created so that importing this module never opens a connection —
 * builds import it while prerendering pages that don't touch the database.
 */
export function db(): Database {
	cached ??= createDatabase();
	return cached;
}

export * from './schema';
export { isUniqueViolation } from './errors';
