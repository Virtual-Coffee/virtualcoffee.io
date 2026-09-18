import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { getDatabase } from '@netlify/database';
import { NetlifyDB } from '@netlify/database-dev';
import { drizzle } from 'drizzle-orm/netlify-db';
import { migrate } from 'drizzle-orm/netlify-db/migrator';
import type { TestProject } from 'vitest/node';

const MIGRATIONS = resolve(
	dirname(fileURLToPath(import.meta.url)),
	'../../../drizzle',
);

/**
 * One in-memory Postgres for the whole `db` project.
 *
 * `@netlify/database-dev` is PGlite behind a Postgres wire server — the same
 * engine `netlify dev` runs. The migrations are applied by drizzle's migrator,
 * reading the same `drizzle/` folders and writing the same
 * `drizzle.__drizzle_migrations` ledger as the `drizzle-kit migrate` the
 * Netlify build runs (see docs/adr/0001), so a migration that would fail on
 * deploy fails here first. The connection string is handed to each test file
 * through `provide`/`inject`; `setup.ts` puts it where `db()` looks.
 *
 * PGlite is a single session, so two genuinely concurrent transactions are
 * serialised rather than interleaved. Row locks and conditional updates run,
 * but a test cannot stage the race they exist for; idempotency is shown by
 * calling twice in sequence.
 */
export default async function setup(project: TestProject) {
	const database = new NetlifyDB({ logger: () => {} });
	const url = await database.start();

	// A throwaway client rather than `db()`: this process is not a test worker,
	// and the pool has to be closed for vitest to exit.
	const client = getDatabase({ connectionString: url });
	try {
		await migrate(drizzle({ client }), { migrationsFolder: MIGRATIONS });
	} finally {
		await client.pool.end();
	}

	project.provide('databaseUrl', url);

	return () => database.stop();
}

declare module 'vitest' {
	export interface ProvidedContext {
		databaseUrl: string;
	}
}
