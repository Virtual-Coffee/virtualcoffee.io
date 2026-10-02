import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { defineSource } from './source';

const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

function source(overrides: {
	configured?: boolean;
	fetch?: () => Promise<string | null>;
}) {
	const mock = vi.fn(async () => 'mock');
	const fetch = vi.fn(overrides.fetch ?? (async () => 'real'));
	const { fetch: gated } = defineSource({
		what: 'the widgets',
		key: 'widgets',
		tag: 'widgets',
		revalidate: 60,
		configured: () => overrides.configured ?? true,
		fetch,
		mock,
	});
	return { gated, fetch, mock };
}

const unusable = async () => null;
const throws = async (): Promise<string> => {
	throw new Error('upstream down');
};

describe('defineSource', () => {
	beforeEach(() => warn.mockClear());
	afterEach(() => vi.unstubAllEnvs());

	describe.each(['production', 'deploy-preview', undefined])(
		'with CONTEXT=%s, whatever the fetch does',
		(context) => {
			beforeEach(() => vi.stubEnv('CONTEXT', context));

			test('uses the fetch when it returns data', async () => {
				const { gated, mock } = source({});
				await expect(gated()).resolves.toBe('real');
				expect(mock).not.toHaveBeenCalled();
			});
		},
	);

	describe('in production', () => {
		beforeEach(() => vi.stubEnv('CONTEXT', 'production'));

		test('refuses the mock without credentials', async () => {
			const { gated, fetch } = source({ configured: false });
			await expect(gated()).rejects.toThrow(
				/mock data for the widgets in a production build/,
			);
			expect(fetch).not.toHaveBeenCalled();
		});

		test('throws a failed fetch, naming the source', async () => {
			const { gated, mock } = source({ fetch: throws });
			await expect(gated()).rejects.toMatchObject({
				message: expect.stringMatching(/^the widgets: fetch failed/),
				cause: expect.objectContaining({ message: 'upstream down' }),
			});
			expect(mock).not.toHaveBeenCalled();
		});

		test('treats a null fetch as an error', async () => {
			const { gated } = source({ fetch: unusable });
			await expect(gated()).rejects.toMatchObject({
				message: expect.stringMatching(/^the widgets: fetch failed/),
				cause: expect.objectContaining({
					message: 'the upstream returned no usable data',
				}),
			});
		});
	});

	describe.each(['deploy-preview', undefined])(
		'outside production (CONTEXT=%s)',
		(context) => {
			beforeEach(() => vi.stubEnv('CONTEXT', context));

			test('mocks without credentials', async () => {
				const { gated, fetch } = source({ configured: false });
				await expect(gated()).resolves.toBe('mock');
				expect(fetch).not.toHaveBeenCalled();
			});

			test('mocks, and warns, when the fetch throws', async () => {
				const { gated } = source({ fetch: throws });
				await expect(gated()).resolves.toBe('mock');
				expect(warn).toHaveBeenCalledOnce();
			});

			test('mocks, and warns, when the fetch returns null', async () => {
				const { gated } = source({ fetch: unusable });
				await expect(gated()).resolves.toBe('mock');
				expect(warn).toHaveBeenCalledOnce();
			});
		},
	);
});
