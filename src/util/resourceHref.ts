import type { Route } from 'next';
import { resourcePaths, type ResourcePath } from '@/data/resourcePaths';

type ResourceHref = Route<ResourcePath | `${ResourcePath}#${string}`>;

/**
 * An href into the handbook and resources. `resources/[...slug]` types as
 * `/resources/${string}`, so a literal href would pass typedRoutes whatever
 * it said; `ResourcePath` is every page that exists, and `pnpm codegen`
 * rewrites it when a file is added or moved. ESLint bans a raw `/resources`
 * href elsewhere.
 */
export function resourceHref(path: ResourcePath, hash?: string): ResourceHref {
	return hash ? `${path}#${hash}` : path;
}

/** Narrows a computed path, such as a breadcrumb's, to a page that exists. */
export function isResourcePath(path: string): path is ResourcePath {
	return (resourcePaths as readonly string[]).includes(path);
}
