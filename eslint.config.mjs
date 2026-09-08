import { defineConfig, globalIgnores } from 'eslint/config';
import { fixupConfigRules } from '@eslint/compat';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import vc from './eslint-rules/index.mjs';

export default defineConfig([
	// eslint-plugin-react / -import / -jsx-a11y (pulled in by eslint-config-next)
	// still call context methods that ESLint 10 removed; fixupConfigRules shims
	// them. Drop this once eslint-config-next ships ESLint 10-ready plugins.
	...fixupConfigRules([...nextVitals, ...nextTs]),
	{
		rules: {
			'react/no-unescaped-entities': 'off',
			'@next/next/no-html-link-for-pages': 'warn',
			'@typescript-eslint/no-unused-vars': [
				'warn',
				{
					varsIgnorePattern: '^_',
					argsIgnorePattern: '^_',
					caughtErrorsIgnorePattern: '^_|^error$|^e$',
				},
			],
		},
	},
	// Local rules for the content contributors write by hand. All `error`:
	// `pnpm lint` has no `--max-warnings`, so a warning would not fail CI.
	{
		name: 'vc/members',
		plugins: { vc },
		files: ['src/content/members/{members,core}/*.ts'],
		// The template. It holds the placeholder github value on purpose, and
		// `scripts/loadMemberFiles.ts` already keeps it out of the barrel.
		ignores: ['src/content/members/members/_EXAMPLE.ts'],
		rules: {
			'vc/member-file-identity': 'error',
			'vc/member-emoji': 'error',
			'vc/member-account-username': 'error',
		},
	},
	{
		name: 'vc/html-safety',
		plugins: { vc },
		files: ['src/**/*.tsx'],
		ignores: ['src/components/DisplayHtml.tsx'],
		rules: { 'vc/no-raw-dangerously-set-inner-html': 'error' },
	},
	globalIgnores([
		'node_modules/**',
		'.next/**',
		'out/**',
		'build/**',
		'next-env.d.ts',
		'.netlify/**',
		'netlify/**',
	]),
]);
