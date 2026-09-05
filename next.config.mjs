/** @type {import('next').NextConfig} */
import path from 'path';
import { fileURLToPath } from 'url';
import createMDX from '@next/mdx';

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename);

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
			[
				path.join(__dirname, 'src/mdx-plugins/remark-toc.mjs'),
				{
					tight: true,
					parents: ['root', 'mdxJsxFlowElement'],
					maxDepth: 3,
				},
			],
			'remark-frontmatter',
		],
		rehypePlugins: [
			'rehype-slug',
			path.join(__dirname, 'src/mdx-plugins/rehype-heading-anchors.mjs'),
			'rehype-highlight',
		],
	},
});

export default withMDX(nextConfig);
