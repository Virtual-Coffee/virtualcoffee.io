import { getDatabase } from '@netlify/database';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-serverless';
import { drizzle as drizzleNode } from 'drizzle-orm/node-postgres';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

import * as schema from './schema';

export type Database = NodePgDatabase<typeof schema>;

/**
 * `getDatabase()` picks the driver for the current environment and returns a
 * discriminated union: a real `pg.Pool` locally (where `netlify dev` runs a
 * plain Postgres, not Neon) and a Neon pool on deploys. Both back the same
 * Drizzle query API, so the union is collapsed to one type here rather than
 * leaking two database types through every call site.
 */
function createDatabase(): Database {
	// In the Netlify runtime `getDatabase()` finds `NETLIFY_DB_URL` on its own.
	// One-off scripts (seed, Airtable import) run outside that runtime — even
	// under `netlify dev:exec`, which injects project env vars but not
	// `NETLIFY_DB_URL` — so they pass the connection string via `DATABASE_URL`.
	// See `scripts/with-local-netlify.ts`.
	const override = process.env.NETLIFY_DB_URL ?? process.env.DATABASE_URL;
	const connection = getDatabase(
		override ? { connectionString: override } : {},
	);

	if (connection.driver === 'serverless') {
		return drizzleNeon(connection.pool, { schema }) as unknown as Database;
	}

	return drizzleNode(connection.pool, { schema });
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
