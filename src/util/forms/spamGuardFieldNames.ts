/**
 * The two field names the spam guard reads, on their own so the client-side
 * `SpamGuardFields` can render them without pulling `spamGuard.ts` — and its
 * `node:crypto` import — into the browser graph.
 */
export const HONEYPOT_FIELD = 'website';
export const TIMESTAMP_FIELD = 'rendered_at';
