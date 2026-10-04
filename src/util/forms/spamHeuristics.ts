/**
 * Content heuristics for /join submissions that get past the spam guard.
 *
 * The bots hitting /join clear the honeypot, the timestamp and the rate limit,
 * so `spamGuard.ts` cannot see them. What they share is the content: a random
 * mixed-case single-token name (`HXtBTQgRAfwqQQPyStQoKS`) and a Gmail
 * dot-trick address (`xx.x.xx.xxx.xx.x.x42@gmail.com`).
 *
 * A match is a signal, not a verdict. The caller quarantines the submission
 * for review rather than dropping it, so a false positive costs a moderator a
 * glance and the person nothing.
 */

/** Real names rarely switch case this often; `McDonald` does it three times. */
const MIN_NAME_LENGTH = 12;
const MIN_NAME_CASE_CHANGES = 5;

const MIN_DOTS = 3;
const SHORT_SEGMENT_LENGTH = 2;

function caseChanges(name: string): number {
	let changes = 0;
	for (let i = 1; i < name.length; i++) {
		const previous = name[i - 1];
		const current = name[i];
		const previousIsLower = previous === previous.toLowerCase();
		const currentIsLower = current === current.toLowerCase();
		if (previousIsLower !== currentIsLower) changes++;
	}
	return changes;
}

function nameLooksRandom(name: string): boolean {
	const trimmed = name.trim();
	if (trimmed.length < MIN_NAME_LENGTH) return false;
	if (!/^\p{L}+$/u.test(trimmed)) return false;
	return caseChanges(trimmed) >= MIN_NAME_CASE_CHANGES;
}

/**
 * Gmail ignores dots in the local part, so a bot can mint endless distinct
 * addresses from one inbox by scattering them. A person's address has a dot
 * or two between real words.
 *
 * Known false positive: `j.r.r@example.com` (initials only) has three short
 * segments and is flagged. The rule stays as it is; the quarantine absorbs it.
 */
function emailLooksDotted(email: string): boolean {
	const at = email.lastIndexOf('@');
	const local = at === -1 ? email : email.slice(0, at);

	const segments = local.split('.');
	const dots = segments.length - 1;
	if (dots >= MIN_DOTS) return true;

	if (segments.length < 3) return false;
	const short = segments.filter(
		(segment) => segment.length <= SHORT_SEGMENT_LENGTH,
	).length;
	return short > segments.length / 2;
}

/** Which signal fired, name first, or null when the submission looks fine. */
export function suspectSpam({
	name,
	email,
}: {
	name: string;
	email: string;
}): 'name' | 'email' | null {
	if (nameLooksRandom(name)) return 'name';
	if (emailLooksDotted(email)) return 'email';
	return null;
}
