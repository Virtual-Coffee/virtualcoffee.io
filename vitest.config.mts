import { fileURLToPath } from 'node:url';
import { configDefaults, defineConfig } from 'vitest/config';

// CI runs in UTC; pin it so a zone-sensitive test fails the same way here.
process.env.TZ = 'UTC';

/**
 * Two projects, told apart by filename:
 *
 * - `unit` is every `*.test.ts` (or `.tsx`, for the email templates) that
 *   needs nothing running. The default.
 * - `db` is every `*.db.test.ts`. Its `globalSetup` starts
 *   `@netlify/database-dev` (the PGlite engine `netlify dev` already uses)
 *   and applies the migrations; its setup file points `NETLIFY_DB_URL` at it
 *   and truncates the tables between tests. Tests authenticate with a real
 *   session (`src/test/session.ts`), not by mocking auth — which is why a
 *   test that signs in is a db test.
 *
 * Both mock `next/headers` (`src/test/setup.ts`): `headers()` throws outside
 * a request, and every authorization check reads it.
 *
 * `@/` is resolved here rather than through vite-tsconfig-paths — it is the
 * only alias, and one line beats a dependency.
 */
export default defineConfig({
	resolve: {
		alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
	},
	test: {
		environment: 'node',
		projects: [
			{
				test: {
					name: 'unit',
					include: [
						'src/**/*.test.{ts,tsx}',
						'scripts/**/*.test.ts',
						'netlify/**/*.test.ts',
					],
					exclude: [...configDefaults.exclude, '**/*.db.test.ts'],
					setupFiles: ['./src/test/setup.ts'],
				},
			},
			{
				test: {
					name: 'db',
					include: ['**/*.db.test.ts'],
					globalSetup: ['./src/test/db/globalSetup.ts'],
					setupFiles: ['./src/test/setup.ts', './src/test/db/setup.ts'],
					// One in-memory database per run, so files must not race — and
					// with no parallelism to lose, one worker thread runs them all
					// without isolation: drizzle, the schema and Better Auth load once
					// per run rather than once per file. Files share module state,
					// which is why this project's mocks live in `src/test/db/setup.ts`.
					fileParallelism: false,
					pool: 'threads',
					isolate: false,
					// Projects with different worker counts cannot share a group;
					// the db project runs after `unit`.
					sequence: { groupOrder: 1 },
				},
			},
		],
		coverage: {
			provider: 'v8',
			// `text` for the terminal; the two JSON files are what CI's coverage
			// report step reads (summary for the totals, final for per-file rows).
			reporter: ['text', 'json-summary', 'json'],
			// Off by default, but a red run is exactly when CI's report step (which
			// runs regardless) needs the files to exist.
			reportOnFailure: true,
			include: ['src/**'],
			exclude: [
				// Pages and components: a unit runner cannot render async Server
				// Components (Next's own guidance), so listing them is only noise.
				// Pages and routes render; the server actions are logic and are
				// exercised through their tests.
				'src/app/**/!(action|actions).*',
				'src/test/**',
				'**/*.tsx',
				// Codegen (gitignored) and the generated, checked-in bot list.
				'src/data/members/core.ts',
				'src/data/members/members.ts',
				'src/data/undrawAspectRatios.ts',
				'src/data/bots.ts',
				// Content and styles, not code.
				'src/content/**',
				'src/styles/**',
			],
		},
	},
});
