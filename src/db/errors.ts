/**
 * Whether a failed write hit a unique constraint (Postgres `23505`).
 *
 * Drizzle wraps the driver's error in its own, so the code lives on `cause`
 * — but the raw error is what the driver throws, so both are checked.
 */
export function isUniqueViolation(error: unknown): boolean {
	let current: unknown = error;
	while (current !== null && typeof current === 'object') {
		if ((current as { code?: unknown }).code === '23505') return true;
		current = (current as { cause?: unknown }).cause;
	}
	return false;
}
