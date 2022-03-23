import { readdirSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import fm from 'front-matter';

export function loadMdxDirectory({ baseDirectory }) {
	const basePath = join(process.cwd(), 'app', 'routes', baseDirectory);
	const dirEntries = readdirSync(basePath, { withFileTypes: true });
	const dirs = dirEntries.filter((entry) => entry.isDirectory());
	const files = dirEntries.filter((entry) => entry.isFile());

	try {
		const directories = dirs.map((dir) => {
			const index = loadMdxRouteFileAttributes({
				slug: join(baseDirectory, dir.name, 'index'),
			});

			const children = readdirSync(join(basePath, dir.name), {
				withFileTypes: true,
			})
				.filter((e) => {
					return e.isFile() && e.name !== 'index.mdx';
				})
				.map((e) =>
					loadMdxRouteFileAttributes({
						slug: join(baseDirectory, dir.name, e.name.replace('.mdx', '')),
					}),
				)
				.filter(Boolean)
				.sort((a, b) => a.order - b.order);

			return {
				...index,
				children,
			};
		});

		const entries = files.map((entry) => {
			if (entry.name === 'index.jsx' || entry.name === 'index.mdx') {
				return null;
			}

			const attributes = loadMdxRouteFileAttributes({
				slug: join(baseDirectory, entry.name.replace('.mdx', '')),
			});

			return {
				...attributes,
			};
		});

		return [...entries, ...directories]
			.filter(Boolean)
			.sort((a, b) => a.order - b.order);
	} catch (error) {
		console.log(error);
		return [];
	}
}

export function loadMdxRouteFileAttributes({ slug }) {
	// because of the way Remix does routing, we need to check for index.mdx for a given file name
	// so if your directory looks like this:
	// ├── resources
	// │   ├── index.mdx
	// │   └── article.mdx
	// └── resources.jsx (layout route)
	// we want to be able to call loadMdxRouteFileAttributes({slug: 'resources'}) and get resources/index

	const regularFileName = join(
		process.cwd(),
		'app',
		'routes',
		...`${slug}.mdx`.split('/').filter(Boolean),
	);

	const indexFileName = join(
		process.cwd(),
		'app',
		'routes',
		...slug.split('/').filter(Boolean),
		'index.mdx',
	);

	const fileName = existsSync(regularFileName)
		? regularFileName
		: existsSync(indexFileName)
		? indexFileName
		: null;

	if (!fileName) {
		return null;
	}

	const fileContents = readFileSync(fileName, {
		encoding: 'utf-8',
	});

	const { attributes } = fm(fileContents);

	return {
		...attributes,
		slug: slug.replace(/\/index$/g, ''),
	};
}
