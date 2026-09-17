import { vi } from 'vitest';

/**
 * The spies the db project's mocked modules hand out. `src/test/db/setup.ts`
 * registers the mocks — spreading a spy over the original where the rest of
 * the module stays real, replacing the module where nothing else is needed —
 * and a test imports the spy from here to set outcomes and assert calls.
 * A spy that stands in for a send must _return_ a failure rather than
 * reject; that is the real functions' contract.
 */

/** `@/lib/email/transport` — replaced. Outcomes are in `@/test/outbound`. */
export const sendEmail = vi.fn();

/** `@/lib/slack/notify` — spread; the message builders stay real. */
export const notifySlack = vi.fn();

/** `@/lib/slack/dm` — spread; `grantDmMessage` stays real. */
export const sendSlackDm = vi.fn();

/**
 * `next/cache` — replaced: `revalidatePath()` throws outside a Next request
 * ("static generation store missing"), and every admin action calls it after
 * writing. The setup adds a passthrough `unstable_cache`, because data
 * modules wrap their fetches at import time.
 */
export const revalidatePath = vi.fn();
export const revalidateTag = vi.fn();

export function resetSpies() {
	for (const spy of [
		sendEmail,
		notifySlack,
		sendSlackDm,
		revalidatePath,
		revalidateTag,
	]) {
		spy.mockReset();
	}
}
