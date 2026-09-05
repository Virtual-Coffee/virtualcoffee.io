import { toc } from 'mdast-util-toc';

/**
 * Remark plugin that replaces a `## Table of Contents` heading with a
 * generated list, wrapped in the site's Bootstrap container markup.
 *
 * Adapted from https://github.com/remarkjs/remark-toc. Lives in its own file
 * (rather than inline in next.config) so it can be referenced by path string,
 * which is required for Turbopack's serializable MDX loader options.
 *
 * @type {import('unified').Plugin<[import('mdast-util-toc').Options?], import('mdast').Root>}
 */
export default function remarkToc(options = {}) {
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
						},
					],
				},
				...node.children.slice(result.index),
			];
		}
	};
}
