import { defineConfig } from 'drizzle-kit';

/**
 * drizzle-kit owns both halves of a migration: `generate` writes
 * `drizzle/<YYYYMMDDHHmmss>_<name>/migration.sql` (plus the `snapshot.json` it
 * diffs the next `generate` against — committed, never hand-edited), and
 * `migrate` applies them at the end of the Netlify build. See docs/adr/0001.
 *
 * Always generate with `--name=<hyphenated-slug>` so the folders read alike;
 * drizzle's auto-generated names use underscores.
 *
 * `migrate` reads the connection string from `NETLIFY_DB_URL` (the Netlify
 * build) or `DATABASE_URL` (`scripts/with-local-netlify.ts` locally) — the
 * same pair `src/db/index.ts` looks at.
 */
const dbUrl = process.env.NETLIFY_DB_URL ?? process.env.DATABASE_URL;

export default defineConfig({
	dialect: 'postgresql',
	schema: './src/db/schema.ts',
	out: './drizzle',
	...(dbUrl
		? {
				dbCredentials: {
					url: dbUrl,
				},
			}
		: {}),
});
