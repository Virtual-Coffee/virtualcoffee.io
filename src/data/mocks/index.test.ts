import { afterEach, describe, expect, test, vi } from 'vitest';
import { assertMocksAllowed, mocksAllowed } from './index';

/**
 * `CONTEXT` is Netlify's: `production`, `deploy-preview` or `branch-deploy`
 * on a deploy, `dev` under `netlify dev`, unset otherwise. Mock data is for
 * every context but production, which must fail loudly instead.
 */
describe('mocksAllowed', () => {
	afterEach(() => vi.unstubAllEnvs());

	test.each([undefined, 'dev', 'deploy-preview', 'branch-deploy'])(
		'is true when CONTEXT is %s',
		(context) => {
			vi.stubEnv('CONTEXT', context);
			expect(mocksAllowed()).toBe(true);
			expect(() => assertMocksAllowed('events')).not.toThrow();
		},
	);

	test('is false in production, and the assertion names what was asked for', () => {
		vi.stubEnv('CONTEXT', 'production');
		expect(mocksAllowed()).toBe(false);
		expect(() => assertMocksAllowed('events')).toThrow(
			/mock data for events in a production build/,
		);
	});
});
