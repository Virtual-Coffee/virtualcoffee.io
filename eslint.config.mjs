import { defineConfig, globalIgnores } from 'eslint/config';
import { fixupConfigRules } from '@eslint/compat';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

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
