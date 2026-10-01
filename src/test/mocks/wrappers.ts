/**
 * Wrappers that return `actual` with one reader replaced, so a test can stage
 * what the action sees between its read and its write. `src/test/db/setup.ts`
 * registers one `vi.mock` per module and reader; a test sets the state
 * exported beside each wrapper.
 */

/** A reader a wrapper can replace: async, returning a row (with a status). */
type Reader<Row = unknown> = (...args: never[]) => Promise<Row>;

/** The keys of `M` whose value is such a reader. */
type ReaderKey<M, Row = unknown> = {
	[K in keyof M]: M[K] extends Reader<Row> ? K : never;
}[keyof M];

type StatusRow = { status: string } | null;

/**
 * Stages the race the conditional updates exist for: the action reads one
 * status, but the row has already moved on by the time it writes. Set
 * `readAs` to the status the action should believe it saw.
 */
export const staleRead = { readAs: null as string | null };

/**
 * Returns `actual` with one reader wrapped, so the status it reports is
 * whatever `staleRead.readAs` holds. `src/test/db/setup.ts` registers one
 * per module whose reader an action fences on, e.g.
 *
 * ```ts
 * vi.mock('@/lib/waitlist/applications', async (importOriginal) =>
 * 	(await import('@/test/mocks/wrappers')).withStaleRead(
 * 		await importOriginal<typeof import('@/lib/waitlist/applications')>(),
 * 		'getApplication',
 * 	),
 * );
 * ```
 */
export function withStaleRead<
	M extends object,
	K extends ReaderKey<M, StatusRow>,
>(actual: M, reader: K): M {
	const read = actual[reader] as Reader<StatusRow>;
	const stale = async (...args: never[]) => {
		const row = await read(...args);
		return row && staleRead.readAs ? { ...row, status: staleRead.readAs } : row;
	};
	return { ...actual, [reader]: stale };
}

export function resetWrappers() {
	staleRead.readAs = null;
}
