import { afterEach, describe, expect, test, vi } from 'vitest';

import { siteUrl } from './url.server';

/**
 * `siteUrl()` reads the environment on every call, so these stub it directly.
 * (`buildUrls` still snapshots at module load, but nothing reads it except
 * the production-only analytics tag in the root layout.)
 */
describe('siteUrl', () => {
	afterEach(() => vi.unstubAllEnvs());

	test('is the primary URL Netlify sets, without a trailing slash', () => {
		vi.stubEnv('URL', 'https://deploy-preview-1--virtualcoffee.netlify.app/');
		expect(siteUrl()).toBe(
			'https://deploy-preview-1--virtualcoffee.netlify.app',
		);

		vi.stubEnv('URL', 'http://localhost:9000');
		expect(siteUrl()).toBe('http://localhost:9000');
	});

	test('strips one slash, not every one', () => {
		vi.stubEnv('URL', 'http://localhost:9000//');
		expect(siteUrl()).toBe('http://localhost:9000/');
	});

	test('falls back to production when URL is unset', () => {
		vi.stubEnv('URL', undefined);
		expect(siteUrl()).toBe('https://virtualcoffee.io');
	});
});
