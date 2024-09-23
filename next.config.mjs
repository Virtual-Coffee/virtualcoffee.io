/** @type {import('next').NextConfig} */

import path from 'path';
import { fileURLToPath } from 'url';
import createMDX from '@next/mdx';

import remarkFrontmatter from 'remark-frontmatter';

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename);

const nextConfig = {
	sassOptions: {
		includePaths: [path.join(__dirname, 'node_modules')],
	},
	pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
};

const withMDX = createMDX({
	// Add markdown plugins here, as desired
	options: {
		remarkPlugins: [remarkFrontmatter],
		rehypePlugins: [],
	},
});

export default withMDX(nextConfig);
