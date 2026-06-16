/// <reference types="vite/client" />
import fm from 'front-matter';
import type { MDXProps } from 'mdx/types';
import { UndrawIllustrationName } from '@/components/UndrawIllustration';

/**
 * Represents the attributes of an MDX route.
 */
export interface MdxFile {
	slug: string;
	isIndex: boolean;
	order?: number;
	meta: {
		title: string;
		description: string;
	};
	hero?: {
		Hero?: UndrawIllustrationName;
		heroHeader?: string;
		heroSubheader?: string;
	};
	tags?: string[];
	children?: MdxFile[];
}

// Bundle the raw text of every MDX file under src/content at build time so
// the worker runtime never needs a filesystem. Vite's import.meta.glob
// resolves at compile time; in dev it's HMR-aware, in prod it's inlined.
//
// Keys are absolute-from-project-root paths like
// `/src/content/resources/foo/index.mdx`. We normalize to project-relative
// slug-style keys (no leading slash, no .mdx) so we can look up by the same
// "slug" the callers already pass: e.g. `content/resources/foo/index`.
const rawMdxBySlug: Record<string, string> = (() => {
	// The `?raw` query is short-circuited in vite.config.ts by the
	// `virtualcoffee:mdx-raw` pre-plugin so the file's source text comes
	// through instead of compiled MDX. Default export is the raw text.
	const modules = import.meta.glob('/src/content/**/*.mdx', {
		query: '?raw',
		import: 'default',
		eager: true,
	}) as Record<string, string>;

	const out: Record<string, string> = {};
	for (const [absPath, raw] of Object.entries(modules)) {
		const key = absPath.replace(/^\/src\//, '').replace(/\.mdx$/, '');
		out[key] = raw;
	}
	return out;
})();

// Lazy component loaders for every MDX file under src/content. Vite expands
// this glob at build time into a static lookup of `() => import(...)`; using
// it avoids the unreliable `await import(`@/content/...${slug}.mdx`)` form
// which Vite's dynamic-import-vars helper can't always resolve.
type MdxComponentModule = { default: React.ComponentType<MDXProps> };
const mdxComponentsByKey: Record<
	string,
	() => Promise<MdxComponentModule>
> = (() => {
	const modules = import.meta.glob<MdxComponentModule>(
		'/src/content/**/*.mdx',
	);
	const out: Record<string, () => Promise<MdxComponentModule>> = {};
	for (const [absPath, loader] of Object.entries(modules)) {
		const key = absPath.replace(/^\/src\//, '').replace(/\.mdx$/, '');
		out[key] = loader;
	}
	return out;
})();

function normalizeSlug(slug: string): string {
	return slug.split('/').filter(Boolean).join('/');
}

/**
 * Enumerate the immediate children of a directory from the flat bundled
 * MDX index: subdirectory names (those that contain at least one .mdx) and
 * non-index .mdx file basenames directly under `baseDirectory`.
 */
function getImmediateChildren(baseDirectory: string): {
	dirs: string[];
	files: string[];
} {
	const prefix = `${baseDirectory}/`;
	const dirs = new Set<string>();
	const files = new Set<string>();
	for (const key of Object.keys(rawMdxBySlug)) {
		if (!key.startsWith(prefix)) continue;
		const rest = key.slice(prefix.length);
		const parts = rest.split('/');
		if (parts.length === 1) {
			if (parts[0] !== 'index') files.add(parts[0]);
		} else {
			dirs.add(parts[0]);
		}
	}
	return { dirs: [...dirs].sort(), files: [...files].sort() };
}

/**
 * Loads MDX files in a directory and constructs a nested array of route attributes.
 */
export const loadMdxDirectory = async ({
	baseDirectory,
	includeChildren = true,
}: {
	baseDirectory: string;
	includeChildren?: boolean;
}): Promise<MdxFile[]> => {
	baseDirectory = normalizeSlug(baseDirectory);
	const { dirs, files } = getImmediateChildren(baseDirectory);

	try {
		const directories = await Promise.all(
			dirs.map(async (dirName) => {
				const index = await loadMdxRouteFileAttributes({
					slug: `${baseDirectory}/${dirName}/index`,
				});
				if (!index) return null;

				let children: MdxFile[] | null = null;

				if (includeChildren) {
					const sub = getImmediateChildren(`${baseDirectory}/${dirName}`);

					const mapped = await Promise.all([
						...sub.files.map((fname) =>
							loadMdxRouteFileAttributes({
								slug: `${baseDirectory}/${dirName}/${fname}`,
							}),
						),
						...sub.dirs.map(async (subdir) => {
							const dirIndex = await loadMdxRouteFileAttributes({
								slug: `${baseDirectory}/${dirName}/${subdir}/index`,
							});
							if (dirIndex) {
								return {
									...dirIndex,
									children: await loadMdxDirectory({
										baseDirectory: `${baseDirectory}/${dirName}/${subdir}`,
									}),
								};
							}
							return null;
						}),
					]);

					children = mapped
						.filter((route): route is MdxFile => route !== null)
						.sort((a, b) =>
							'order' in a && 'order' in b && a.order && b.order
								? a.order - b.order
								: 0,
						);
				}

				return { ...index, children };
			}),
		);

		const entries = await Promise.all(
			files.map((fname) =>
				loadMdxRouteFileAttributes({
					slug: `${baseDirectory}/${fname}`,
				}),
			),
		);

		const allRoutes: MdxFile[] = [...entries, ...directories].filter(
			(route): route is MdxFile => route !== null,
		);

		return allRoutes.sort((a, b) =>
			'order' in a && 'order' in b && a.order && b.order
				? a.order - b.order
				: 0,
		);
	} catch (error) {
		console.log(error);
		return [];
	}
};

/**
 * Loads route attributes for a given slug, handling the special case of index.mdx files.
 */
export const loadMdxRouteFileAttributes = async ({
	slug,
}: {
	slug: string;
}): Promise<MdxFile | null> => {
	slug = normalizeSlug(slug);

	// Match the legacy behavior: try the regular file first
	// (`content/foo/bar` -> `content/foo/bar.mdx`), then the index variant
	// (`content/foo/bar` -> `content/foo/bar/index.mdx`).
	let matchedKey: string | null = null;
	if (slug in rawMdxBySlug) {
		matchedKey = slug;
	} else if (`${slug}/index` in rawMdxBySlug) {
		matchedKey = `${slug}/index`;
	}

	if (!matchedKey) return null;

	const raw = rawMdxBySlug[matchedKey];
	const contents = fm(raw);
	const attributes = contents.attributes as Omit<
		MdxFile,
		'slug' | 'requirePath'
	>;

	return {
		...attributes,
		isIndex: matchedKey === 'index' || matchedKey.endsWith('/index'),
		slug: slug.replace(/\/index$/g, '').replace(/^__frontend\//g, ''),
	};
};

/**
 * Resolve the compiled MDX component for a slug using the same direct-or-index
 * fallback as `loadMdxRouteFileAttributes`. Returns null when no file matches.
 */
export async function loadMdxComponent(
	slug: string,
): Promise<React.ComponentType<MDXProps> | null> {
	slug = normalizeSlug(slug);
	const key =
		slug in mdxComponentsByKey
			? slug
			: `${slug}/index` in mdxComponentsByKey
				? `${slug}/index`
				: null;
	if (!key) return null;
	const mod = await mdxComponentsByKey[key]();
	return mod.default;
}
