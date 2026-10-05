import { Octokit } from '@octokit/rest';

import { timedFetch } from './timedFetch';

/**
 * These reads run at build time, where a timeout falls back to mocks and
 * production refuses mocks, so the limit only has to catch a stalled request.
 */
const READ_TIMEOUT_MS = 30_000;

export function githubGraphql(token: string) {
	return new Octokit({
		auth: token,
		request: { fetch: timedFetch(READ_TIMEOUT_MS) },
	}).graphql;
}

/**
 * Duck-typed: importing `GraphqlResponseError` would need `@octokit/graphql`
 * as a direct dependency, and `instanceof` fails across duplicate copies.
 */
export function isGraphqlResponseError(error: unknown): error is {
	name: 'GraphqlResponseError';
	data: unknown;
	errors: Array<{ type?: string; message: string }>;
} {
	return (
		error instanceof Error &&
		error.name === 'GraphqlResponseError' &&
		'data' in error &&
		'errors' in error
	);
}
