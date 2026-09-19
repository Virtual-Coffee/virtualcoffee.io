import { vi, type Mock } from 'vitest';

import type { Outbound } from '@/lib/outbound';
import { NOT_SENT } from '@/test/outbound';

/**
 * The spies the db project's mocked modules hand out. `src/test/db/setup.ts`
 * registers the mocks — spreading a spy over the original where the rest of
 * the module stays real, replacing the module where nothing else is needed —
 * and a test imports the spy from here to set outcomes and assert calls.
 * A spy that stands in for a send must _return_ a failure rather than
 * reject; that is the real functions' contract, so each send spy defaults to
 * `NOT_SENT` (`mockReset()` restores that default) and a test sets `SENT`
 * when it needs the message to go out.
 */

/** A send: the outcome is the contract; the arguments are the caller's to read. */
type Sender = (...args: Parameters<Mock>) => Promise<Outbound>;

/** `@/lib/email/transport` — replaced. Outcomes are in `@/test/outbound`. */
export const sendEmail = vi.fn<Sender>(async () => NOT_SENT);

/** `@/lib/slack/notify` — spread; the message builders stay real. */
export const notifySlack = vi.fn<Sender>(async () => NOT_SENT);

/** `@/lib/slack/dm` — spread; `grantDmMessage` stays real. */
export const sendSlackDm = vi.fn<Sender>(async () => NOT_SENT);

/**
 * `next/cache` — replaced: `revalidatePath()` throws outside a Next request
 * ("static generation store missing"), and every admin action calls it after
 * writing. The setup adds a passthrough `unstable_cache`, because data
 * modules wrap their fetches at import time.
 */
export const revalidatePath = vi.fn();
export const revalidateTag = vi.fn();

/** `@netlify/blobs` — replaced: one store, whose `set`/`delete` a test drives. */
export const blobs = { set: vi.fn(), delete: vi.fn() };

/** `@/lib/attachments` — spread; storing and discarding stay real, on the mocked blobs. */
export const readAttachment = vi.fn<(key: string) => Promise<unknown>>();

/** `@/lib/github/issues` — spread; `githubAppConfigured` stays real. */
export const createLunchAndLearnIssue = vi.fn();

/** `@/lib/eventsCalendar` — spread; a test hands it the client to return. */
export const connectEventsCalendar = vi.fn();

export function resetSpies() {
	for (const spy of [
		sendEmail,
		notifySlack,
		sendSlackDm,
		revalidatePath,
		revalidateTag,
		blobs.set,
		blobs.delete,
		readAttachment,
		createLunchAndLearnIssue,
		connectEventsCalendar,
	]) {
		spy.mockReset();
	}
}
