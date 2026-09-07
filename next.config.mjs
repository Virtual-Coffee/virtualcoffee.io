/** @type {import('next').NextConfig} */
import path from 'path';
import { createHash } from 'crypto';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import createMDX from '@next/mdx';

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename);

/**
 * Reference a local MDX plugin by absolute path, with a hash of its contents
 * mixed into the options.
 *
 * Turbopack requires serializable loader options, so these plugins are passed
 * as path strings. That makes the cache key blind to the plugin's *contents*:
 * edit a plugin and Next reuses the previously compiled MDX. That silently
 * shipped stale `.sr-only` markup after the class was renamed to
 * `.visually-hidden`. Mixing in the hash makes any edit invalidate the cache.
 * Both plugins ignore unknown options.
 */
const localMdxPlugin = (relPath, options = {}) => {
	const absPath = path.join(__dirname, relPath);
	const pluginVersion = createHash('sha1')
		.update(readFileSync(absPath))
		.digest('hex')
		.slice(0, 8);
	return [absPath, { ...options, pluginVersion }];
};

const nextConfig = {
	reactStrictMode: true,
	sassOptions: {
		includePaths: [path.join(__dirname, 'node_modules')],
		// Bootstrap 5.3's own Sass triggers if-function and global-builtin
		// deprecations on Dart Sass 1.10x. Silence warnings coming from
		// dependencies only, so warnings in src/styles/ still surface.
		quietDeps: true,
		silenceDeprecations: [
			'abs-percent',
			'color-functions',
			'color-module-compat',
			'import',
			'legacy-js-api',
		],
	},
	pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
};

const withMDX = createMDX({
	// Plugins are referenced by path/name string so the options stay
	// serializable, which Turbopack requires. Plugins that need function
	// options live in src/mdx-plugins/. Local paths must be absolute: the
	// loader resolves relative paths from each MDX file's directory.
	options: {
		remarkPlugins: [
			localMdxPlugin('src/mdx-plugins/remark-toc.mjs', {
				tight: true,
				parents: ['root', 'mdxJsxFlowElement'],
				maxDepth: 3,
			}),
			'remark-frontmatter',
		],
		rehypePlugins: [
			'rehype-slug',
			localMdxPlugin('src/mdx-plugins/rehype-heading-anchors.mjs'),
			'rehype-highlight',
		],
	},
});

export default withMDX(nextConfig);
