/** @type {import('next').NextConfig} */
import path from 'path';
import { fileURLToPath } from 'url';
import createMDX from '@next/mdx';

import { remarkPlugins, rehypePlugins } from './mdx.config.mjs';

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename);

const nextConfig = {
	reactStrictMode: true,
	sassOptions: {
		includePaths: [path.join(__dirname, 'node_modules')],
		silenceDeprecations: [
			'abs-percent',
			'color-functions',
			'color-module-compat',
			'import',
			'legacy-js-api',
		],
	},
	pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
	async headers() {
		return [
			{
				source: '/feed/feed.rss',
				headers: [
					{
						key: 'Content-Type',
						value: 'text/xml; charset=utf-8',
					},
				],
			},
		];
	},
};

const withMDX = createMDX({
	options: {
		remarkPlugins,
		rehypePlugins,
	},
});

export default withMDX(nextConfig);
