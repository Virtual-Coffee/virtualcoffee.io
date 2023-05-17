/**
 * Plugin to generate a Table of Contents (TOC).
 * Created from https://github.com/remarkjs/remark-toc
 *
 * @type {import('unified').Plugin<[Options?]|void[], Root>}
 */
async function createRemarkToc() {
	const { toc } = await import('mdast-util-toc');

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

/**
 * @type {import('@remix-run/dev').AppConfig}
 */
module.exports = {
	serverBuildTarget: 'netlify',
	server:
		process.env.NETLIFY || process.env.NETLIFY_LOCAL
			? './server.js'
			: undefined,
	ignoredRouteFiles: ['**/.*', '**/*.json', '**/*.png', '**/*.jpg', '**/*.svg'],
	serverDependenciesToBundle: [
		'@sindresorhus/slugify',
		'@sindresorhus/transliterate',
		'unified',
		'remark-parse',
		'remark-rehype',
		'rehype-sanitize',
		'rehype-stringify',
		'escape-string-regexp',
	],
	appDirectory: 'app',
	assetsBuildDirectory: 'public/build',
	serverBuildPath: 'netlify/functions/server/index.js',
	publicPath: '/build/',
	devServerPort: 8002,
	mdx: async (filename) => {
		const remarkToc = await createRemarkToc();

		const [
			rehypeHighlight,
			rehypeSlug,
			rehypeAutolinkHeadings,
			hastscript,
			toString,
		] = await Promise.all([
			import('rehype-highlight').then((mod) => mod.default),
			// import('@jsdevtools/rehype-toc').then((mod) => mod.default),
			// import('remark-toc').then((mod) => mod.default),
			import('rehype-slug').then((mod) => mod.default),
			import('rehype-autolink-headings').then((mod) => mod.default),
			import('hastscript').then((mod) => mod.h),
			import('hast-util-to-string').then((mod) => mod.toString),
		]);

		return {
			remarkPlugins: [
				[
					remarkToc,
					{
						tight: true,
						parents: ['root', 'mdxJsxFlowElement'],
						maxDepth: 3,
					},
				],
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
				// [
				// 	rehypeToc,
				// 	{
				// 		placeholder: 'TABLE_OF_CONTENTS',
				// 	},
				// ],
				rehypeHighlight,
			],
		};
	},
};
