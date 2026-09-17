import { beforeEach, vi } from 'vitest';

/**
 * The mocked `@/lib/email/transport`, for the actions that send mail.
 *
 * A test file replaces the module with this one:
 *
 * ```ts
 * vi.mock('@/lib/email/transport', () => import('@/test/mocks/transport'));
 * ```
 *
 * `vi.mock` only hoists inside a test file, so that line cannot move here —
 * but the factory can hand back this module, and the file then imports
 * `sendEmail` from here to set outcomes (`@/test/outbound`) and assert calls.
 */
export const sendEmail = vi.fn();

beforeEach(() => {
	sendEmail.mockReset();
});
