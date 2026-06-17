import remarkFrontmatter from 'remark-frontmatter';
import { toc } from 'mdast-util-toc';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import { h as hastscript } from 'hastscript';
import { toString } from 'hast-util-to-string';

/**
 * @type {import('unified').Plugin<[Options?]|void[], Root>}
 */
function createRemarkToc() {
	return (options = {}) => {
		return (node) => {
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

const remarkToc = createRemarkToc();

export const remarkPlugins = [
	[
		remarkToc,
		{
			tight: true,
			parents: ['root', 'mdxJsxFlowElement'],
			maxDepth: 3,
		},
	],
	remarkFrontmatter,
];

export const rehypePlugins = [
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
];
