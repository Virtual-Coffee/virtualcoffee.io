/**
 * Whether a failed write hit a unique constraint (Postgres `23505`), and
 * optionally which one.
 *
 * Drizzle wraps the driver's error in its own, so the code lives on `cause`
 * — but the raw error is what the driver throws, so both are checked.
 */
export function isUniqueViolation(
	error: unknown,
	constraint?: string,
): boolean {
	let current: unknown = error;
	while (current !== null && typeof current === 'object') {
		const candidate = current as { code?: unknown; constraint?: unknown };
		if (candidate.code === '23505') {
			return constraint === undefined || candidate.constraint === constraint;
		}
		current = (current as { cause?: unknown }).cause;
	}
	return false;
}
