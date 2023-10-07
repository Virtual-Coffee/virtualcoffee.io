import { readdirSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import fm from 'front-matter';

/**
 * Represents the attributes of an MDX route.
 */
interface MdxRouteAttributes {
	slug: string;
	order: number;
}

/**
 * Loads MDX files in a directory and constructs a nested array of route attributes.
 * @param baseDirectory - The base directory from which to load MDX files.
 * @param includeChildren - If true, include children routes in the result.
 * @returns An array of MdxRouteAttributes representing the MDX routes.
 */
export function loadMdxDirectory({
	baseDirectory,
	includeChildren = true,
}: {
	baseDirectory: string;
	includeChildren?: boolean;
}): MdxRouteAttributes[] {
	// Get the absolute path to the base directory
	const basePath = join(process.cwd(), 'app', 'routes', baseDirectory);

	// Get the directory entries (files and directories) inside the base path
	const dirEntries = readdirSync(basePath, { withFileTypes: true });
	const dirs = dirEntries.filter((entry) => entry.isDirectory());
	const files = dirEntries.filter((entry) => entry.isFile());

	try {
		// Process directories and their children
		const directories = dirs.map((dir) => {
			// Get the index file's attributes for the current directory
			const index = loadMdxRouteFileAttributes({
				slug: join(baseDirectory, dir.name, 'index'),
			});

			let children: MdxRouteAttributes[] | null = null;

			if (includeChildren) {
				// Read all files and subdirectories in the current directory
				children = readdirSync(join(basePath, dir.name), {
					withFileTypes: true,
				})
					.map((e) => {
						// Skip the index file
						if (e.name !== 'index.mdx') {
							if (e.isFile()) {
								// If it's a file, load its attributes
								return loadMdxRouteFileAttributes({
									slug: join(
										baseDirectory,
										dir.name,
										e.name.replace('.mdx', ''),
									),
								});
							} else if (e.isDirectory()) {
								// If it's a directory, recursively load its attributes
								const dirIndex = loadMdxRouteFileAttributes({
									slug: join(baseDirectory, dir.name, e.name, 'index'),
								});

								if (dirIndex) {
									return {
										...dirIndex,
										children: loadMdxDirectory({
											baseDirectory: join(baseDirectory, dir.name, e.name),
										}),
									};
								}
							}
						}
						return null;
					})
					.filter((route): route is MdxRouteAttributes => route !== null)
					.sort((a, b) => a.order - b.order);
			}

			return {
				...index,
				children,
			};
		});

		// Process individual files in the base directory
		const entries = files.map((entry) => {
			// Skip index files
			if (entry.name === 'index.jsx' || entry.name === 'index.mdx') {
				return null;
			}

			// Load attributes for the file
			const attributes = loadMdxRouteFileAttributes({
				slug: join(baseDirectory, entry.name.replace('.mdx', '')),
			});

			return attributes;
		});

		// Combine directories and entries and filter out null values
		const allRoutes: MdxRouteAttributes[] = [...entries, ...directories].filter(
			(route): route is MdxRouteAttributes => route !== null,
		);

		// Sort the result by order
		return allRoutes.sort((a, b) => a.order - b.order);
	} catch (error) {
		// If any error occurs, log it and return an empty array
		console.log(error);
		return [];
	}
}

/**
 * Loads route attributes for a given slug, handling the special case of index.mdx files.
 * @param slug - The slug representing the path to the MDX file.
 * @returns The MdxRouteAttributes for the given slug, or null if not found.
 */
export function loadMdxRouteFileAttributes({
	slug,
}: {
	slug: string;
}): MdxRouteAttributes | null {
	// Generate the regular file name and index file name based on the slug
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

	// Check if the regular file exists, otherwise, check if the index file exists
	const fileName = existsSync(regularFileName)
		? regularFileName
		: existsSync(indexFileName)
		? indexFileName
		: null;

	// If the file doesn't exist, return null
	if (!fileName) {
		return null;
	}

	// Read the contents of the file
	const fileContents = readFileSync(fileName, {
		encoding: 'utf-8',
	});

	// Parse the front matter from the file contents using the front-matter library
	const { attributes } = fm(fileContents);

	// The attributes type is unknown, but we know it should match the MdxRouteAttributes interface,
	// so we assert the type to MdxRouteAttributes to resolve the TypeScript error.
	// Additionally, modify the slug to remove trailing "/index" and "__frontend/" if present.
	return {
		...(attributes as MdxRouteAttributes),
		slug: slug.replace(/\/index$/g, '').replace(/^__frontend\//g, ''),
	};
}
