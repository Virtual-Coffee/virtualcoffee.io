import { unstable_cache } from 'next/cache';

import { deployContext } from '@/lib/deployContext';

/**
 * Mocks stand in for real data on a checkout and on previews (fork PRs don't
 * receive secrets). Production must fail loudly rather than ship fake content.
 */
function assertMocksAllowed(what: string): void {
	if (deployContext() === 'production') {
		throw new Error(
			`Refusing to use mock data for ${what} in a production build. ` +
				`Check that the required credentials are set and the upstream API is reachable.`,
		);
	}
}

/**
 * An external data source with its mock gate and cache, defined once:
 * without credentials, or when the fetch throws or returns `null` (no usable
 * data), a source falls back to its mock everywhere but production, where it
 * throws. `fetch` is the gated, uncached call for scripts and tests; `get` is
 * the same call under `unstable_cache`, tagged so `/_cache` can revalidate it.
 */
export function defineSource<Args extends unknown[], T>(source: {
	/** Names the source in the error and the warning. */
	what: string;
	key: string;
	tag: string;
	revalidate: number;
	configured: () => boolean;
	fetch: (...args: Args) => Promise<T | null>;
	/** Dynamic import inside, so a production bundle never loads the mock. */
	mock: (...args: Args) => Promise<T>;
}) {
	async function gated(...args: Args): Promise<T> {
		if (!source.configured()) {
			assertMocksAllowed(source.what);
			return source.mock(...args);
		}

		let failure: unknown;
		try {
			const data = await source.fetch(...args);
			if (data !== null) return data;
			failure = new Error(
				`${source.what}: the upstream returned no usable data`,
			);
		} catch (error) {
			failure = error;
		}

		if (deployContext() === 'production') throw failure;
		console.warn(
			`${source.what}: fetch failed, using mock data instead`,
			failure,
		);
		return source.mock(...args);
	}

	return {
		fetch: gated,
		get: unstable_cache(gated, [source.key], {
			revalidate: source.revalidate,
			tags: [source.tag],
		}),
	};
}
