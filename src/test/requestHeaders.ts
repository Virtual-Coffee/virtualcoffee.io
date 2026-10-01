/**
 * What the mocked `next/headers` (`src/test/setup.ts`) hands to code that
 * calls `headers()`. Empty by default — no cookie, so `getSession()` sees no
 * signed-in user; a test that wants one sets `current` to headers carrying a
 * session cookie.
 */
export const requestHeaders = { current: new Headers() };
