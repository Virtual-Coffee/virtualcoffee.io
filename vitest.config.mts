import { fileURLToPath } from 'node:url';
import { configDefaults, defineConfig } from 'vitest/config';

/**
 * Two projects, told apart by filename:
 *
 * - `unit` is every `*.test.ts` that needs nothing running. The default.
 * - `db` is reserved for `*.db.test.ts`. It is empty today; when the first one
 *   lands it gets a `globalSetup` that starts `@netlify/database-dev` (the
 *   PGlite engine `netlify dev` already uses) and applies the migrations, and a
 *   setup file that points `NETLIFY_DB_URL` at it. Nothing else has to change.
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
		// Root-level on purpose: per-project it does not cover `--project db`
		// while that project is still empty.
		passWithNoTests: true,
		projects: [
			{
				test: {
					name: 'unit',
					include: [
						'src/**/*.test.ts',
						'scripts/**/*.test.ts',
						'netlify/**/*.test.ts',
					],
					exclude: [...configDefaults.exclude, '**/*.db.test.ts'],
				},
			},
			{
				test: {
					name: 'db',
					include: ['**/*.db.test.ts'],
					// One in-memory database per run, so files must not race.
					fileParallelism: false,
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
