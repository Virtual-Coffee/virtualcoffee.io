/**
 * Set `skip` to make a friendly pre-check report nothing, so the database
 * index has to do the work the pre-check normally spares it.
 */
export const preCheck = { skip: false };

export function reset() {
	preCheck.skip = false;
}

type Check = (...args: never[]) => Promise<unknown>;

type CheckKey<M> = {
	[K in keyof M]: M[K] extends Check ? K : never;
}[keyof M];

/**
 * Returns `actual` with one check answering `null` while `preCheck.skip` is
 * set. `src/test/db/setup.ts` registers one per module, e.g.
 *
 * ```ts
 * vi.mock('@/lib/invites', async (importOriginal) =>
 * 	(await import('@/test/mocks/preCheck')).withSkippableCheck(
 * 		await importOriginal<typeof import('@/lib/invites')>(),
 * 		'blockingInvite',
 * 	),
 * );
 * ```
 */
export function withSkippableCheck<M extends object, K extends CheckKey<M>>(
	actual: M,
	check: K,
): M {
	const run = actual[check] as Check;
	const skippable = async (...args: never[]) =>
		preCheck.skip ? null : run(...args);
	return { ...actual, [check]: skippable };
}
