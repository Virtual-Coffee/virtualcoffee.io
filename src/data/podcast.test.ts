import { afterEach, describe, expect, test, vi } from 'vitest';

import { PHASE_PRODUCTION_BUILD } from 'next/constants';

import { fetchTranscript, transcriptOrNullDuringBuild } from './podcast';

function stubFetch(response: Response) {
	const fetchMock = vi.fn().mockResolvedValue(response);
	vi.stubGlobal('fetch', fetchMock);
	return fetchMock;
}

describe('fetchTranscript', () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	test('returns null for an episode with no transcript', async () => {
		const fetchMock = stubFetch(new Response('', { status: 404 }));

		await expect(fetchTranscript({ id: 'abc' })).resolves.toBeNull();
		expect(fetchMock).toHaveBeenCalledWith(
			'https://feeds.virtualcoffee.io/podcast-assets/abc/transcript.json',
		);
	});

	test('throws on a server error, so the failure is not cached as "no transcript"', async () => {
		stubFetch(new Response('', { status: 500, statusText: 'Server Error' }));

		await expect(fetchTranscript({ id: 'abc' })).rejects.toThrow('500');
	});

	test('merges consecutive segments by one speaker and stamps each turn', async () => {
		stubFetch(
			Response.json({
				segments: [
					{ speaker: 'Dan', startTime: 0, endTime: 5, body: 'Hello' },
					{ speaker: 'Dan', startTime: 5, endTime: 9, body: 'everyone' },
					{ speaker: 'Bekah', startTime: 65, endTime: 70, body: 'Hi!' },
				],
			}),
		);

		await expect(fetchTranscript({ id: 'abc' })).resolves.toEqual([
			{ name: 'Dan', text: 'Hello everyone', timestamp: '00:00' },
			{ name: 'Bekah', text: 'Hi!', timestamp: '01:05' },
		]);
	});

	test('returns null for a 200 without segments', async () => {
		stubFetch(Response.json({}));

		await expect(fetchTranscript({ id: 'abc' })).resolves.toBeNull();
	});
});

describe('transcriptOrNullDuringBuild', () => {
	afterEach(() => {
		vi.unstubAllEnvs();
		vi.restoreAllMocks();
	});

	test('passes a transcript through in any phase', async () => {
		vi.stubEnv('NEXT_PHASE', 'phase-production-server');

		await expect(
			transcriptOrNullDuringBuild(Promise.resolve([]), 'ep'),
		).resolves.toEqual([]);
	});

	test('swallows a failure during the production build', async () => {
		vi.stubEnv('NEXT_PHASE', PHASE_PRODUCTION_BUILD);
		const error = vi.spyOn(console, 'error').mockImplementation(() => {});

		await expect(
			transcriptOrNullDuringBuild(Promise.reject(new Error('feed down')), 'ep'),
		).resolves.toBeNull();
		expect(error).toHaveBeenCalledOnce();
	});

	test('rethrows at runtime, so ISR keeps the last good page', async () => {
		vi.stubEnv('NEXT_PHASE', 'phase-production-server');

		await expect(
			transcriptOrNullDuringBuild(Promise.reject(new Error('feed down')), 'ep'),
		).rejects.toThrow('feed down');
	});
});
