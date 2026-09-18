import type { KnipConfig } from 'knip';

export default {
	entry: [
		// Some are not in package.json scripts (scripts/airtable/*), and the
		// membership stack nests others behind `tsx scripts/with-local-netlify.ts …`.
		'scripts/**/*.ts',
		// netlify.toml [[edge_functions]]; the netlify plugin only finds netlify/functions.
		'netlify/edge-functions/*.ts',
		// Referenced by path string through localMdxPlugin() in next.config.mjs.
		'src/mdx-plugins/*.mjs',
		// Namespace-iterated through the codegen barrels in src/data/members/.
		'src/content/members/{core,members}/*.ts',
		// Loaded as '@/content/newsletters/' + slug in src/data/newsletters.ts.
		'src/content/newsletters/*.{jsx,tsx}',
		// Template-string import() from the (simple-mdx) and resources routes.
		'src/content/**/*.mdx',
	],
	ignoreExportsUsedInFile: true,
	// `mdx/types` comes from @types/mdx; there is no `mdx` package for knip to find.
	ignoreDependencies: ['mdx'],
	compilers: {
		// bootstrap is only reached through @import in src/styles. Relative imports
		// are Sass partials, so `./nav` has to become `./_nav.scss` for knip to
		// resolve the file; package imports are cut to the package name, since
		// `bootstrap/scss/nav` is a partial too and only the dependency matters.
		scss: (text) =>
			[...text.matchAll(/@(?:import|use)\s+['"]([^'"]+)['"]/g)]
				.map(([, specifier]) =>
					specifier.startsWith('.')
						? `import '${specifier.replace(/([^/]+)$/, '_$1.scss')}';`
						: `import '${specifier.split('/')[0]}';`,
				)
				.join('\n'),
	},
} satisfies KnipConfig;
