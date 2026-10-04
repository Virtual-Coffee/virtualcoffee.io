import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { z } from 'zod';
import type { MemberObject } from '@/content/members/types';
import { getMemberGithubData } from './index';

const members = ['ada', 'ghost', 'grace'].map((github) => ({
	github,
})) as MemberObject[];

function user(login: string) {
	return {
		login,
		id: `id-${login}`,
		url: `https://github.com/${login}`,
		avatarUrl: `https://avatars.githubusercontent.com/${login}`,
		name: login,
		bioHTML: null,
	};
}

function stubGraphql(body: unknown) {
	const fetchMock = vi.fn(
		async () =>
			new Response(JSON.stringify(body), {
				status: 200,
				headers: { 'content-type': 'application/json' },
			}),
	);
	vi.stubGlobal('fetch', fetchMock);
	return fetchMock;
}

beforeEach(() => {
	vi.stubEnv('GITHUB_TOKEN', 'test-token');
	// Mocks are refused in production (assertMocksAllowed).
	vi.stubEnv('CONTEXT', 'deploy-preview');
	vi.spyOn(console, 'log').mockImplementation(() => {});
	vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
	vi.unstubAllEnvs();
	vi.unstubAllGlobals();
	vi.restoreAllMocks();
});

describe('getMemberGithubData', () => {
	test('drops a member GitHub reports NOT_FOUND and keeps the rest', async () => {
		stubGraphql({
			data: { u0: user('ada'), u1: null, u2: user('grace') },
			errors: [
				{
					type: 'NOT_FOUND',
					path: ['u1'],
					message: "Could not resolve to a User with the login of 'ghost'.",
				},
			],
		});

		const result = await getMemberGithubData(members);

		expect(Object.keys(result)).toEqual(['ada', 'grace']);
		expect(console.warn).toHaveBeenCalledWith(
			expect.schemaMatching(z.string().includes('ghost')),
		);
	});

	test('falls back to mock data on any other GraphQL error', async () => {
		stubGraphql({
			data: null,
			errors: [{ type: 'RATE_LIMITED', message: 'API rate limit exceeded' }],
		});

		const result = await getMemberGithubData(members);

		// The mock resolves every member, including the one a real lookup would drop.
		expect(Object.keys(result).sort()).toEqual(['ada', 'ghost', 'grace']);
		expect(result.ada.id).not.toBe('id-ada');
	});
});
