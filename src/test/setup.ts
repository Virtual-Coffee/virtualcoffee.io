import { afterEach, vi } from 'vitest';

import { requestHeaders } from '@/test/requestHeaders';

/**
 * Runs before every test in both projects.
 *
 * `headers()` from next/headers throws outside a Next request, and
 * `getSession()` calls it on every path — so every test that reaches an
 * authorization check would fail before the check ran. The mock returns
 * whatever `requestHeaders.current` holds.
 */
vi.mock('next/headers', () => ({
	headers: async () => requestHeaders.current,
}));

afterEach(() => {
	requestHeaders.current = new Headers();
});
