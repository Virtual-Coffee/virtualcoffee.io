import { afterEach, describe, expect, test, vi } from 'vitest';

/**
 * `buildUrls` snapshots the environment when the module loads, so each case
 * stubs the env first and then imports a fresh copy.
 */
async function loadWithEnv(env: Record<string, string | undefined>) {
	vi.resetModules();
	for (const [key, value] of Object.entries(env)) vi.stubEnv(key, value);
	return import('./url.server');
}

const unset = {
	NETLIFY: undefined,
	URL: undefined,
	DEPLOY_PRIME_URL: undefined,
	CONTEXT: undefined,
};

describe('qualifiedUrl', () => {
	afterEach(() => vi.unstubAllEnvs());

	test('off Netlify, prefixes URL when set and leaves the path alone otherwise', async () => {
		const local = await loadWithEnv({ ...unset, URL: 'http://localhost:9000' });
		expect(local.qualifiedUrl('/members')).toBe(
			'http://localhost:9000/members',
		);
		expect(local.qualifiedUrl()).toBe('http://localhost:9000');

		const bare = await loadWithEnv(unset);
		expect(bare.qualifiedUrl('/members')).toBe('/members');
	});

	test('on a production deploy, uses the canonical URL', async () => {
		const prod = await loadWithEnv({
			...unset,
			NETLIFY: 'true',
			CONTEXT: 'production',
			URL: 'https://virtualcoffee.io',
			DEPLOY_PRIME_URL: 'https://main--virtualcoffee.netlify.app',
		});
		expect(prod.qualifiedUrl('/members')).toBe(
			'https://virtualcoffee.io/members',
		);
	});

	test('on a deploy preview, uses that deploy’s own URL', async () => {
		const preview = await loadWithEnv({
			...unset,
			NETLIFY: 'true',
			CONTEXT: 'deploy-preview',
			URL: 'https://virtualcoffee.io',
			DEPLOY_PRIME_URL: 'https://deploy-preview-1--virtualcoffee.netlify.app',
		});
		expect(preview.qualifiedUrl('/members')).toBe(
			'https://deploy-preview-1--virtualcoffee.netlify.app/members',
		);
	});
});
