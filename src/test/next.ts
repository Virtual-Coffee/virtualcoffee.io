import { expect } from 'vitest';

/**
 * `redirect()` and `notFound()` from next/navigation throw, and the digest
 * says where to — these match it without depending on Next's error classes.
 */

/** What `notFound()` throws — the 404 a wrong-section role gets. */
export const NOT_FOUND = { digest: 'NEXT_HTTP_ERROR_FALLBACK;404' };

/** What `redirect(path)` throws. */
export const redirectTo = (path: string) => ({
	digest: expect.stringMatching(
		`^NEXT_REDIRECT;[a-z]+;${path.replace(/[?]/g, '\\?')};`,
	),
});
