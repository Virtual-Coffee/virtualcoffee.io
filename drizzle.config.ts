import { defineConfig } from 'drizzle-kit';

const dbUrl = process.env.DATABASE_URL;
/**
 * `drizzle-kit generate` writes SQL plus a journal into `drizzle/`, and the
 * journal is what lets later runs diff against the previous schema — so that
 * directory is committed even though Netlify never reads it.
 *
 * Netlify applies migrations from `netlify/database/migrations/<n>_<slug>/
 * migration.sql` on deploy, so generated SQL is copied there by
 * `pnpm db:generate`. Never hand-edit a migration that has already deployed.
 */
export default defineConfig({
	dialect: 'postgresql',
	schema: './src/db/schema.ts',
	out: './drizzle',
	casing: 'snake_case',
	...(dbUrl
		? {
				dbCredentials: {
					url: dbUrl,
				},
			}
		: {}),
});
