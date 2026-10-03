/**
 * Applied per request through the client's `fetch`, so it also covers the
 * installation-token exchange inside auth-app's hook, which a `request.signal`
 * on the visible calls never reaches.
 */
const TIMEOUT_MS = 10_000;

export const timedFetch: typeof fetch = (input, init) => {
	const timeout = AbortSignal.timeout(TIMEOUT_MS);
	return fetch(input, {
		...init,
		signal: init?.signal ? AbortSignal.any([init.signal, timeout]) : timeout,
	});
};
