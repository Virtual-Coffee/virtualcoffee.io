import { NetlifyDB } from '@netlify/database-dev';
import type { TestProject } from 'vitest/node';

/**
 * One in-memory Postgres for the whole `db` project.
 *
 * `@netlify/database-dev` is PGlite behind a Postgres wire server — the same
 * engine `netlify dev` runs — so the migrations Netlify applies on deploy are
 * applied here verbatim. The connection string is handed to each test file
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
	await database.applyMigrations('netlify/database/migrations');
	project.provide('databaseUrl', url);

	return () => database.stop();
}

declare module 'vitest' {
	export interface ProvidedContext {
		databaseUrl: string;
	}
}
