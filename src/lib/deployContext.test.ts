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
});
