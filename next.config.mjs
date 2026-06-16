/** @type {import('next').NextConfig} */
import path from 'path';
import { fileURLToPath } from 'url';
import createMDX from '@next/mdx';

import { remarkPlugins, rehypePlugins } from './mdx.config.mjs';

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename);

const permanent301 = [
	{ source: '/volunteer', destination: '/resources/virtual-coffee-handbook/get-involved' },
	{ source: '/members/map', destination: '/members' },
	{ source: '/member-survey', destination: 'https://airtable.com/appGHm8ztVWug6UxH/pagKrtAhS4jnRhtYD/form' },
	{ source: '/brownbag-idea', destination: '/lunch-and-learn-idea' },
	{ source: '/brownbag-idea-thanks', destination: '/lunch-and-learn-idea-thanks' },
	{ source: '/member-resources', destination: '/resources' },
	{
		source: '/member-resources/oss-maintainer-checklist',
		destination: '/resources/developer-resources/open-source/maintainer-guide#repository-checklist',
	},
	{
		source: '/member-resources/oss-writing-issues',
		destination: '/resources/developer-resources/open-source/contributor-guide#guide-to-writing-issues',
	},
	{
		source: '/member-resources/guide-to-vc',
		destination: '/resources/virtual-coffee-handbook/guides-to-virtual-coffee',
	},
	{
		source: '/member-resources/join-virtual-coffee',
		destination: '/resources/virtual-coffee-handbook/join-virtual-coffee',
	},
	{
		source: '/member-resources/slack-channel-guide',
		destination: '/resources/virtual-coffee-handbook/guides-to-virtual-coffee/slack-channels-guide',
	},
	{
		source: '/resources/open-source/oss-writing-issues',
		destination: '/resources/developer-resources/open-source/contributor-guide#guide-to-writing-issues',
	},
	{
		source: '/resources/open-source/oss-maintainer-checklist',
		destination: '/resources/developer-resources/open-source/maintainer-guide#repository-checklist',
	},
	{ source: '/resources/open-source', destination: '/resources/developer-resources/open-source' },
	{
		source: '/resources/open-source/about-open-source',
		destination: '/resources/developer-resources/open-source/about-open-source',
	},
	{
		source: '/resources/open-source/git-101',
		destination: '/resources/developer-resources/open-source/git-101',
	},
	{
		source: '/resources/open-source/contributor-guide',
		destination: '/resources/developer-resources/open-source/contributor-guide',
	},
	{
		source: '/resources/open-source/maintainer-guide',
		destination: '/resources/developer-resources/open-source/maintainer-guide',
	},
	{ source: '/resources/virtual-coffee', destination: '/resources/virtual-coffee-handbook' },
	{
		source: '/resources/virtual-coffee/get-involved',
		destination: '/resources/virtual-coffee-handbook/get-involved',
	},
	{
		source: '/resources/virtual-coffee/get-involved/paths-to-leadership',
		destination: '/resources/virtual-coffee-handbook/get-involved/paths-to-leadership',
	},
	{
		source: '/resources/virtual-coffee/get-involved/coffee-table-groups',
		destination: '/resources/virtual-coffee-handbook/get-involved/leading-coffee-table-groups',
	},
	{
		source: '/resources/virtual-coffee/get-involved/lunch-and-learns',
		destination: '/resources/virtual-coffee-handbook/guides-to-virtual-coffee/lunch-and-learns',
	},
	{
		source: '/resources/virtual-coffee/join-virtual-coffee',
		destination: '/resources/virtual-coffee-handbook/join-virtual-coffee',
	},
	{
		source: '/resources/virtual-coffee/guide-to-vc',
		destination: '/resources/virtual-coffee-handbook/guides-to-virtual-coffee',
	},
	{
		source: '/resources/virtual-coffee/slack-channel-guide',
		destination: '/resources/virtual-coffee-handbook/guides-to-virtual-coffee/slack-channels-guide',
	},
	{
		source: '/resources/virtual-coffee/coding-questions-guide',
		destination: '/resources/developer-resources/developer-tips/asking-coding-questions',
	},
];

const temporary302 = [
	{ source: '/sponsorship', destination: 'https://github.com/sponsors/Virtual-Coffee' },
	{
		source: '/l/vc-conf-survey',
		destination:
			'https://docs.google.com/forms/d/e/1FAIpQLSd3l-YJIhA-lAAkWqEP5qbWGUPg8_HtKOfIN5M_NKYfStv4nA/viewform',
	},
	{
		source: '/l/vc-conf-cfp-form',
		destination:
			'https://docs.google.com/forms/d/e/1FAIpQLSc_F6A6hhOO8PNgRoR32sxKnIePZdHY7gMTK-nD0yGCFuClCQ/viewform',
	},
];

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
	async redirects() {
		return [
			...permanent301.map((r) => ({ ...r, statusCode: 301 })),
			...temporary302.map((r) => ({ ...r, statusCode: 302 })),
		];
	},
	async rewrites() {
		return {
			beforeFiles: [
				{
					source: '/bots/:path*',
					destination: 'https://vc-bots.lucky-art-2f02.workers.dev/:path*',
				},
			],
			afterFiles: [
				{
					source: '/plausible/js/script.js',
					destination: 'https://plausible.io/js/script.js',
				},
				{
					source: '/plausible/api/event',
					destination: 'https://plausible.io/api/event',
				},
			],
			fallback: [],
		};
	},
};

const withMDX = createMDX({
	options: {
		remarkPlugins,
		rehypePlugins,
	},
});

export default withMDX(nextConfig);
