import { afterEach, describe, expect, test, vi } from 'vitest';
import { classify, contextLabel, deployContext } from './deployContext';

describe('classify', () => {
	test.each([
		['production', 'production'],
		['deploy-preview', 'preview'],
		['branch-deploy', 'preview'],
		['something-netlify-adds-later', 'preview'],
		['dev', 'local'],
		['', 'local'],
		[undefined, 'local'],
	] as const)('%j is %s', (raw, expected) => {
		expect(classify(raw)).toBe(expected);
	});
});

describe('from the environment', () => {
	afterEach(() => {
		vi.unstubAllEnvs();
		vi.unstubAllGlobals();
	});

	test('reads CONTEXT', () => {
		vi.stubEnv('CONTEXT', 'branch-deploy');
		expect(deployContext()).toBe('preview');
		expect(contextLabel()).toBe('branch-deploy');
	});

	test('an unset CONTEXT is local', () => {
		vi.stubEnv('CONTEXT', undefined);
		expect(deployContext()).toBe('local');
		expect(contextLabel()).toBe('local');
	});

	test('a function bundle without CONTEXT reads the request context', () => {
		vi.stubEnv('CONTEXT', undefined);
		vi.stubGlobal('Netlify', {
			context: { deploy: { context: 'production' } },
		});
		expect(deployContext()).toBe('production');
		expect(contextLabel()).toBe('production');
	});

	test('outside a request the runtime context is null, so it is local', () => {
		vi.stubEnv('CONTEXT', undefined);
		vi.stubGlobal('Netlify', { context: null });
		expect(deployContext()).toBe('local');
	});
});
