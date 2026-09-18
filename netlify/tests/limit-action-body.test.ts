// Not beside the function: Netlify bundles every file in netlify/edge-functions/ as an edge function.
import type { Context } from '@netlify/edge-functions';
import { describe, expect, test } from 'vitest';
import limitActionBody from '../edge-functions/limit-action-body';

const oneMiB = 1024 * 1024;

const post = (contentLength?: string) =>
	limitActionBody(
		new Request('https://example.test/join', {
			method: 'POST',
			headers:
				contentLength === undefined ? {} : { 'content-length': contentLength },
		}),
		{} as Context,
	);

describe('limitActionBody', () => {
	test('a body over 1MiB is refused before it reaches Next', async () => {
		const response = await post(String(oneMiB + 1));
		expect(response).toBeInstanceOf(Response);
		expect((response as Response).status).toBe(413);
	});

	test('exactly 1MiB is Next’s own default and passes', async () => {
		expect(await post(String(oneMiB))).toBeUndefined();
	});

	test('a small body passes', async () => {
		expect(await post('512')).toBeUndefined();
	});

	test('no Content-Length passes; Next still applies its limit', async () => {
		expect(await post()).toBeUndefined();
	});

	test('an unparseable Content-Length passes rather than failing closed', async () => {
		expect(await post('lots')).toBeUndefined();
	});
});
