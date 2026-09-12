import { faker } from '@faker-js/faker';

/**
 * The fake identities `sanitizePreviewDb.ts` writes over a preview branch.
 *
 * Kept apart from the script because the script runs `main()` on import, and
 * these are the part worth testing: every one of them has to be deterministic
 * per input, or a preview's rows stop joining up (see `fakeSlackId`).
 */

/** RFC 2606 reserved, never resolves; the verification pass matches on it. */
export const FAKE_EMAIL_DOMAIN = 'preview.invalid';

export function seedFor(id: string | number): number {
	const str = String(id);
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		hash = (hash * 31 + str.charCodeAt(i)) | 0;
	}
	return Math.abs(hash);
}

/**
 * A fake Slack member id, derived from the real one.
 *
 * Deterministic on purpose. The same Slack id appears on `user`,
 * `pending_grant`, `volunteer`, `volunteer_invite_ledger` and `invite` and is
 * what joins them — an Invite Allowance is keyed on it (docs/adr/0009). Fake
 * each occurrence independently and a preview's volunteers lose their balances
 * and their invites, which is a broken /admin rather than a sanitized one.
 *
 * `U` plus base36 keeps the shape recognisable without being a real id.
 */
export function fakeSlackId(realId: string): string {
	return `U${seedFor(realId).toString(36).toUpperCase().padStart(8, '0')}`;
}

/**
 * Deterministic per-id fake email so re-running the sanitizer on the same
 * branch (every push to the same PR) produces stable, diffable output. The
 * `@preview.invalid` suffix is what makes the verification pass a trivial
 * pattern match, and the id-derived suffix guarantees uniqueness even if the
 * random local part ever collided.
 *
 * The local part comes from faker, so the caller seeds faker first — the
 * script does `faker.seed(seedFor(row.id))` before each row.
 */
export function fakeEmail(id: string | number): string {
	const local = faker.internet
		.username()
		.toLowerCase()
		.replace(/[^a-z0-9._-]/g, '');
	return `${local}.${seedFor(id).toString(36)}@${FAKE_EMAIL_DOMAIN}`;
}
