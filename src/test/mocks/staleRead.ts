/**
 * Stages the race the conditional updates exist for: the action reads one
 * status, but the row has already moved on by the time it writes. Set
 * `readAs` to the status the action should believe it saw.
 */
export const staleRead = { readAs: null as string | null };

export function reset() {
	staleRead.readAs = null;
}

/** A reader `withStaleRead` can wrap: async, returning a row with a status. */
type Reader = (...args: never[]) => Promise<{ status: string } | null>;

/** The keys of `M` whose value is such a reader. */
type ReaderKey<M> = {
	[K in keyof M]: M[K] extends Reader ? K : never;
}[keyof M];

/**
 * Returns `actual` with one reader wrapped, so the status it reports is
 * whatever `staleRead.readAs` holds. `src/test/db/setup.ts` registers one
 * per module whose reader an action fences on, e.g.
 *
 * ```ts
 * vi.mock('@/lib/applications', async (importOriginal) =>
 * 	(await import('@/test/mocks/staleRead')).withStaleRead(
 * 		await importOriginal<typeof import('@/lib/applications')>(),
 * 		'getApplication',
 * 	),
 * );
 * ```
 */
export function withStaleRead<M extends object, K extends ReaderKey<M>>(
	actual: M,
	reader: K,
): M {
	const read = actual[reader] as Reader;
	const stale = async (...args: never[]) => {
		const row = await read(...args);
		return row && staleRead.readAs ? { ...row, status: staleRead.readAs } : row;
	};
	return { ...actual, [reader]: stale };
}
