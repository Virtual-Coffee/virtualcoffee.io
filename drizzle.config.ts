import { defineConfig } from 'drizzle-kit';

const dbUrl = process.env.DATABASE_URL;
/**
 * `drizzle-kit generate` writes straight into the directory Netlify applies on
 * deploy: `netlify/database/migrations/<version>_<slug>/migration.sql`, sorted
 * lexicographically, with slugs restricted to lowercase alphanumerics and
 * hyphens. Drizzle v1 names each folder `<YYYYMMDDHHmmss>_<name>`, which is
 * that layout already — so always generate with `--name=<hyphenated-slug>`,
 * because drizzle's own auto-generated names use underscores.
 *
 * The `snapshot.json` beside each `migration.sql` is drizzle-kit's, not
 * Netlify's: it is what later `generate` runs diff against, so it is committed
 * and Netlify ignores it. Never hand-edit a migration that has already
 * deployed.
 */
export default defineConfig({
	dialect: 'postgresql',
	schema: './src/db/schema.ts',
	out: './netlify/database/migrations',
	...(dbUrl
		? {
				dbCredentials: {
					url: dbUrl,
				},
			}
		: {}),
});
