import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import fm from 'front-matter';

export function loadMdx() {
	const podcastBasePath = join(process.cwd(), 'app', 'routes', 'podcast');
	const dirEntries = readdirSync(podcastBasePath, { withFileTypes: true });
	const dirs = dirEntries.filter((entry) => entry.isDirectory());
	const files = dirEntries.filter((entry) => entry.isFile());

	const subFiles = dirs
		.map((dir) => {
			const subDirEntries = readdirSync(join(podcastBasePath, dir.name), {
				withFileTypes: true,
			})
				.filter((e) => e.isFile())
				.map((e) => ({ name: join(dir.name, e.name) }));

			return subDirEntries;
		})
		.flat();

	const entries = [...files, ...subFiles].map((entry) => {
		if (entry.name === 'index.jsx') {
			return null;
		}

		const fileContents = readFileSync(join(podcastBasePath, entry.name), {
			encoding: 'utf-8',
		});

		const { attributes } = fm(fileContents);

		return {
			date: attributes.date,
			slug: entry.name.replace('.mdx', ''),
			title: attributes.meta.title,
			description: attributes.meta.description,
		};
	});

	return entries.filter(Boolean).sort((a, b) => b.date - a.date);
}
