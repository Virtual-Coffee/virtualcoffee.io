/**
 * Mocks stand in for real data during local dev and Netlify deploy previews /
 * branch deploys (fork PRs don't receive secrets). A production build that
 * can't reach real data should fail loudly rather than ship fake content.
 *
 * `CONTEXT` is set by Netlify to `production`, `deploy-preview`, or
 * `branch-deploy`, and is unset locally.
 */
export function mocksAllowed() {
	return process.env.CONTEXT !== 'production';
}

/**
 * Throw when mock data is about to be used in a context that must not have it.
 * Callers should invoke this before importing anything from `./mocks/*`.
 */
export function assertMocksAllowed(what: string): void {
	if (!mocksAllowed()) {
		throw new Error(
			`Refusing to use mock data for ${what} in a production build. ` +
				`Check that the required credentials are set and the upstream API is reachable.`,
		);
	}
}
