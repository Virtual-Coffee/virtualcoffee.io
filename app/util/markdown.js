module.exports = {
	parseMarkdown: async function (markdown) {
		const [
			unified,
			remarkParse,
			remarkRehype,
			rehypeSanitize,
			rehypeStringify,
		] = await Promise.all([
			import('unified').then((mod) => mod.unified),
			// import('@jsdevtools/rehype-toc').then((mod) => mod.default),
			// import('remark-toc').then((mod) => mod.default),
			import('remark-parse').then((mod) => mod.default),
			import('remark-rehype').then((mod) => mod.default),
			import('rehype-sanitize').then((mod) => mod.default),
			import('rehype-stringify').then((mod) => mod.default),
		]);

		const file = await unified()
			.use(remarkParse)
			.use(remarkRehype)
			.use(rehypeSanitize)
			.use(rehypeStringify)
			.process(markdown);

		return String(file);
	},
};
