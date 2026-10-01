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

/**
 * Stages a race between an action's read and its write: `run` executes right
 * after the wrapped reader returns, once, so a test can move the row on
 * before the action gets to write it.
 */
export const afterRead = { run: null as null | (() => Promise<void>) };

/**
 * Returns `actual` with one reader wrapped so `afterRead.run` fires after
 * it. `src/test/db/setup.ts` registers one per module, e.g.
 *
 * ```ts
 * vi.mock('@/lib/volunteers/volunteers', async (importOriginal) =>
 * 	(await import('@/test/mocks/wrappers')).withAfterRead(
 * 		await importOriginal<typeof import('@/lib/volunteers/volunteers')>(),
 * 		'pendingInvite',
 * 	),
 * );
 * ```
 */
export function withAfterRead<M extends object, K extends ReaderKey<M>>(
	actual: M,
	reader: K,
): M {
	const read = actual[reader] as Reader;
	const hooked = async (...args: never[]) => {
		const row = await read(...args);
		const run = afterRead.run;
		afterRead.run = null;
		await run?.();
		return row;
	};
	return { ...actual, [reader]: hooked };
}

/**
 * Set `skip` to make a friendly pre-check report nothing, so the database
 * index has to do the work the pre-check normally spares it.
 */
export const preCheck = { skip: false };

/**
 * Returns `actual` with one check answering `null` while `preCheck.skip` is
 * set. `src/test/db/setup.ts` registers one per module, e.g.
 *
 * ```ts
 * vi.mock('@/lib/volunteers/invites', async (importOriginal) =>
 * 	(await import('@/test/mocks/wrappers')).withSkippableCheck(
 * 		await importOriginal<typeof import('@/lib/volunteers/invites')>(),
 * 		'blockingInvite',
 * 	),
 * );
 * ```
 */
export function withSkippableCheck<M extends object, K extends ReaderKey<M>>(
	actual: M,
	check: K,
): M {
	const run = actual[check] as Reader;
	const skippable = async (...args: never[]) =>
		preCheck.skip ? null : run(...args);
	return { ...actual, [check]: skippable };
}

export function resetWrappers() {
	staleRead.readAs = null;
	afterRead.run = null;
	preCheck.skip = false;
}
