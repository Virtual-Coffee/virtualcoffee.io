import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * A honeypot field plus a signed render timestamp.
 *
 * Airtable absorbed form spam harmlessly; our own database and blob store will
 * not, and re-enabling the CoC upload puts an unauthenticated file endpoint on
 * the site. Neither check is a serious defence against a targeted attacker —
 * they are aimed at the drive-by form bots that make up nearly all of it, and
 * they cost the person filling the form in nothing.
 *
 * A submission that fails the honeypot or carries a forged token is dropped
 * silently: telling a bot which check caught it only helps it try again. A
 * token that is merely *old* is different — that is a person who left the tab
 * open — so it comes back as `stale` and the action asks them to submit again
 * with a fresh token, rather than thanking them for a report it never saved.
 */

export const HONEYPOT_FIELD = 'website';
export const TIMESTAMP_FIELD = 'rendered_at';

/** Nothing legitimate is filled in and submitted this fast. */
export const MIN_ELAPSED_MS = 2_000;

/** A form left open overnight is a real person coming back to it, not a bot. */
export const MAX_ELAPSED_MS = 24 * 60 * 60 * 1000;

export type SpamCheck = 'ok' | 'honeypot' | 'invalid' | 'stale';

/**
 * Signed so the timestamp cannot simply be back-dated in the payload.
 *
 * Falls back to BETTER_AUTH_SECRET rather than requiring another variable —
 * every deployed environment already has one. Locally it may be absent, in
 * which case the signature is still internally consistent for the process.
 */
function secret(): string {
	return process.env.BETTER_AUTH_SECRET ?? 'virtualcoffee-local-dev-secret';
}

function sign(value: string): string {
	return createHmac('sha256', secret()).update(value).digest('hex');
}

/** Call when rendering the form; the result goes into a hidden input. */
export function issueTimestamp(now = Date.now()): string {
	const value = String(now);
	return `${value}.${sign(value)}`;
}

/**
 * A replacement token for a form that is being re-rendered after an error.
 *
 * Back-dated by the minimum elapsed time, because the person has already
 * spent that long on the form: making them wait another two seconds before
 * the retry counts would drop an immediate resubmit as a bot.
 */
export function reissueTimestamp(now = Date.now()): string {
	return issueTimestamp(now - MIN_ELAPSED_MS);
}

function verifyTimestamp(
	token: string | null,
	now = Date.now(),
): 'ok' | 'invalid' | 'stale' {
	if (!token) return 'invalid';

	const separator = token.lastIndexOf('.');
	if (separator === -1) return 'invalid';

	const value = token.slice(0, separator);
	const signature = token.slice(separator + 1);

	const expected = sign(value);

	/**
	 * The alphabet as well as the length, and both before decoding.
	 *
	 * Node's hex decoder stops at the first invalid pair, so a signature of the
	 * right length but the wrong alphabet decodes to a *shorter* buffer —
	 * `timingSafeEqual` then throws on the length mismatch instead of returning
	 * false, and the crash surfaces as a 500 rather than the silent drop this
	 * file promises.
	 */
	if (!/^[0-9a-f]+$/.test(signature)) return 'invalid';
	if (signature.length !== expected.length) return 'invalid';

	if (
		!timingSafeEqual(
			Buffer.from(signature, 'hex'),
			Buffer.from(expected, 'hex'),
		)
	) {
		return 'invalid';
	}

	const issued = Number(value);
	if (!Number.isFinite(issued)) return 'invalid';

	const elapsed = now - issued;
	if (elapsed < MIN_ELAPSED_MS) return 'invalid';
	return elapsed <= MAX_ELAPSED_MS ? 'ok' : 'stale';
}

/**
 * Whether a submission looks like a bot, and if so which way.
 *
 * The honeypot is a field a person never sees and never fills in; anything in
 * it is automated. The timestamp catches the rest. Callers drop `honeypot` and
 * `invalid` silently and hand `stale` back to the form.
 */
export function checkSpam(formData: FormData, now = Date.now()): SpamCheck {
	const honeypot = formData.get(HONEYPOT_FIELD);
	if (typeof honeypot === 'string' && honeypot.trim().length > 0) {
		return 'honeypot';
	}

	const timestamp = formData.get(TIMESTAMP_FIELD);
	return verifyTimestamp(typeof timestamp === 'string' ? timestamp : null, now);
}
