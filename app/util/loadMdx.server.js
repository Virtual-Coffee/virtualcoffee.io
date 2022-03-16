import { readdirSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import fm from 'front-matter';

export function loadMdxDirectory({ baseDirectory }) {
	const podcastBasePath = join(process.cwd(), 'app', 'routes', baseDirectory);
	const dirEntries = readdirSync(podcastBasePath, { withFileTypes: true });
	const dirs = dirEntries.filter((entry) => entry.isDirectory());
	const files = dirEntries.filter((entry) => entry.isFile());

	const directoryDirectory = dirs.reduce((collection, dir) => {
		return {
			...collection,
			[join(baseDirectory, dir.name)]: readdirSync(
				join(podcastBasePath, dir.name),
				{
					withFileTypes: true,
				},
			)
				.filter((e) => e.isFile())
				.map((e) =>
					loadMdxRouteFileAttributes({
						slug: join(baseDirectory, dir.name, e.name.replace('.mdx', '')),
					}),
				)
				.filter(Boolean)
				.sort((a, b) => b.order - a.order),
		};
	}, {});

	const entries = files.map((entry) => {
		if (entry.name === 'index.jsx') {
			return null;
		}

		console.log({ name: entry.name });

		const attributes = loadMdxRouteFileAttributes({
			slug: join(baseDirectory, entry.name.replace('.mdx', '')),
		});

		return {
			...attributes,
			children: directoryDirectory[attributes.slug] || null,
		};
	});

	console.log({ directoryDirectory, entries });

	return entries.filter(Boolean).sort((a, b) => b.order - a.order);
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
		slug,
	};
}
