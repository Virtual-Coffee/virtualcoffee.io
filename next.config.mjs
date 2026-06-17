/** @type {import('next').NextConfig} */
import path from 'path';
import { fileURLToPath } from 'url';
import createMDX from '@next/mdx';

import remarkFrontmatter from 'remark-frontmatter';

import { toc } from 'mdast-util-toc';

import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import { h as hastscript } from 'hastscript';
import { toString } from 'hast-util-to-string';

/**
 * Plugin to generate a Table of Contents (TOC).
 * Created from https://github.com/remarkjs/remark-toc
 *
 * @type {import('unified').Plugin<[Options?]|void[], Root>}
 */
function createRemarkToc() {
	return (options = {}) => {
		return (node) => {
			// console.log(node.children);
			// console.log(JSON.stringify(node.children[4], null, 2));
			// console.log(
			// 	JSON.stringify(
			// 		node.children.filter((n) => n.type === 'paragraph'),
			// 		null,
			// 		2,
			// 	),
			// );
			const result = toc(
				node,
				Object.assign({}, options, {
					heading: options.heading || 'toc|table[ -]of[ -]contents?',
				}),
			);

			if (
				result.endIndex === null ||
				result.index === null ||
				result.index === -1 ||
				!result.map
			) {
				return;
			}

			// console.log(JSON.stringify(result.map, null, 2));

			// console.log({
			// 	length: node.children.length,
			// 	index: result.index,
			// 	endIndex: result.endIndex,
			// 	slice: node.children.slice(result.endIndex),
			// });

			if (node.children[result.index].type === 'mdxJsxFlowElement') {
				node.children = [
					...node.children.slice(0, result.index - 1),
					{
						...node.children[result.index],
						children: [
							node.children[result.index - 1],
							result.map,
							...node.children[result.index].children,
						],
					},
					...node.children.slice(result.index + 1),
				];
			} else {
				node.children = [
					...node.children.slice(0, result.index - 1),
					{
						type: 'mdxJsxFlowElement',
						name: 'div',
						attributes: [
							{
								type: 'mdxJsxAttribute',
								name: 'className',
								value: 'pt-5 bg-white',
							},
						],
						children: [
							{
								type: 'mdxJsxFlowElement',
								name: 'div',
								attributes: [
									{
										type: 'mdxJsxAttribute',
										name: 'className',
										value: 'container prose',
									},
								],
								children: [node.children[result.index - 1], result.map],
								data: { _xdmExplicitJsx: true },
							},
						],
						data: { _xdmExplicitJsx: true },
					},
					...node.children.slice(result.index),
				];
			}
		};
	};
}

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

const remarkToc = createRemarkToc();

const withMDX = createMDX({
	// Add markdown plugins here, as desired
	options: {
		remarkPlugins: [
			[
				remarkToc,
				{
					tight: true,
					parents: ['root', 'mdxJsxFlowElement'],
					maxDepth: 3,
				},
			],
			remarkFrontmatter,
		],
		rehypePlugins: [
			rehypeSlug,
			[
				rehypeAutolinkHeadings,
				{
					behavior: 'after',
					properties: { class: 'header-anchor' },
					content: (node) => {
						return [
							hastscript('span.sr-only', `Permalink to “${toString(node)}”`),
							hastscript('span', { ariaHidden: 'true' }, '#'),
						];
					},
					group: (node) => {
						return hastscript(
							`.header-anchor-wrapper.header-anchor-wrapper-${node.tagName}`,
						);
					},
					test: ['h2', 'h3'],
				},
			],
			rehypeHighlight,
		],
	},
});

export default withMDX(nextConfig);
