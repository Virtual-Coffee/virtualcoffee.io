/**
 * Whether a connection string plainly points at this machine.
 *
 * The guard every script that writes to the database goes through: a seed or
 * an import must never be able to reach production, so anything that is not
 * obviously local is refused rather than used.
 */
export function isLocalDatabaseUrl(url: string): boolean {
	let host: string;
	try {
		host = new URL(url).hostname;
	} catch {
		return false;
	}
	return host === 'localhost' || host === '127.0.0.1' || host === '[::1]';
}
