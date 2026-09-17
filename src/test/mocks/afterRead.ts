/**
 * Stages a race between an action's read and its write: `run` executes right
 * after the wrapped reader returns, once, so a test can move the row on
 * before the action gets to write it.
 */
export const afterRead = { run: null as null | (() => Promise<void>) };

export function reset() {
	afterRead.run = null;
}

type Reader = (...args: never[]) => Promise<unknown>;

type ReaderKey<M> = {
	[K in keyof M]: M[K] extends Reader ? K : never;
}[keyof M];

/**
 * Returns `actual` with one reader wrapped so `afterRead.run` fires after
 * it. `src/test/db/setup.ts` registers one per module, e.g.
 *
 * ```ts
 * vi.mock('@/lib/volunteers', async (importOriginal) =>
 * 	(await import('@/test/mocks/afterRead')).withAfterRead(
 * 		await importOriginal<typeof import('@/lib/volunteers')>(),
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
