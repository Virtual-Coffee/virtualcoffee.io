/**
 * Whether a connection string plainly points at this machine.
 *
 * The guard every script that writes to the database goes through: a seed or
 * an import must never be able to reach production, so anything that is not
 * obviously local is refused rather than used.
 */
export function isLocalDatabaseUrl(url: string): boolean {
	let parsed: URL;
	try {
		parsed = new URL(url);
	} catch {
		return false;
	}
	// `pg` lets a `host` or `hostaddr` query parameter override the authority,
	// so `localhost` in the URL is not where the driver would connect.
	if (parsed.searchParams.has('host') || parsed.searchParams.has('hostaddr')) {
		return false;
	}
	const host = parsed.hostname;
	return host === 'localhost' || host === '127.0.0.1' || host === '[::1]';
}
