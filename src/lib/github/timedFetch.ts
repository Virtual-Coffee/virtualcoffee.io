/**
 * Applied per request through the client's `fetch`, so it also covers the
 * installation-token exchange inside auth-app's hook, which a `request.signal`
 * on the visible calls never reaches.
 */
export function timedFetch(timeoutMs: number): typeof fetch {
	return (input, init) => {
		const timeout = AbortSignal.timeout(timeoutMs);
		return fetch(input, {
			...init,
			signal: init?.signal ? AbortSignal.any([init.signal, timeout]) : timeout,
		});
	};
}
