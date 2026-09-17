import { vi } from 'vitest';

/**
 * The mocked `next/cache`: `revalidatePath()` throws outside a Next request
 * ("static generation store missing"), and every admin action calls it after
 * writing. `unstable_cache` is a passthrough because data modules wrap their
 * fetches at import time. `src/test/db/setup.ts` replaces the module with
 * this one; a test asserts on the two spies.
 */
export const revalidatePath = vi.fn();
export const revalidateTag = vi.fn();
export const unstable_cache = <T>(fn: T) => fn;

export function reset() {
	revalidatePath.mockReset();
	revalidateTag.mockReset();
}
