/**
 * Identifiers and helpers the seed sections share. Everything is fixed rather
 * than generated so that two runs produce the same rows in the same order —
 * `scripts/seedDev.db.test.ts` relies on that.
 */

export function daysAgo(days: number) {
	return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

export function daysAhead(days: number) {
	return daysAgo(-days);
}

/**
 * The identity `ADMIN_DEV_BYPASS` logs in as (`devBypassSession()` in
 * `src/lib/adminAccess.ts`). Every maintainer-driven event below names it as
 * the actor, so the History panels show a person rather than "system".
 */
export const ADMIN = {
	id: 'dev-bypass',
	slackUserId: 'U_DEV_BYPASS',
	name: 'Local dev',
	email: 'dev@localhost',
} as const;

/** A Volunteer with nothing but the `volunteer` role and an allowance. */
export const VOLUNTEER = {
	id: 'dev-seed-volunteer',
	slackUserId: 'U_DEV_VOLUNTEER',
	name: 'Ayu Santoso',
	email: 'ayu@example.com',
} as const;

/** A `coc_reviewer` who arrived through a Pending Grant, now claimed. */
export const COC_REVIEWER = {
	id: 'dev-seed-coc',
	slackUserId: 'U_DEV_CLAIMED',
	name: 'Marcus Webb',
	email: 'marcus@example.com',
} as const;

/**
 * Signed in once (hence the `user` row) but the claim wrote no roles, and the
 * grant is still unclaimed — the edge case `listAccessRows()` flags with
 * `stranded: true`.
 */
export const STRANDED = {
	id: 'dev-seed-stranded-user',
	slackUserId: 'U_DEV_PENDING_2',
	name: 'Jordan Lee',
	email: 'jordan.lee@example.com',
} as const;

export const FORMER_VOLUNTEER_SLACK_ID = 'U_DEV_FORMER';
export const PENDING_GRANT_SLACK_ID = 'U_DEV_PENDING_1';

/**
 * Every `user` row this script owns, by id, and every Slack member id it
 * hands out. Slack ids are chosen to collide with neither the 40
 * faker-generated `U`-prefixed ids in `createSlackMembers()`
 * (`src/data/mocks/slackMembers.ts`) nor a contributor's real account.
 */
export const SEEDED_USER_IDS = [
	ADMIN.id,
	VOLUNTEER.id,
	COC_REVIEWER.id,
	STRANDED.id,
];
export const SEEDED_SLACK_IDS = [
	ADMIN.slackUserId,
	VOLUNTEER.slackUserId,
	COC_REVIEWER.slackUserId,
	STRANDED.slackUserId,
	FORMER_VOLUNTEER_SLACK_ID,
	PENDING_GRANT_SLACK_ID,
];

/**
 * Plaintext secrets for the two links the CLI prints. Only their hashes are
 * stored, exactly as the real mint does; these constants exist so a re-run
 * prints the same links and the test can look them up.
 */
export const CLAIM_TOKEN = 'seed-claim-rosa-delgado';
export const SLACK_TOKEN = 'seed-slack-jo-bergstrom';

/** The blob key and file the seeded CoC attachment is stored under. */
export const ATTACHMENT = {
	key: 'seed-coc-report-screenshot',
	filename: 'screenshot.png',
	contentType: 'image/png',
} as const;
