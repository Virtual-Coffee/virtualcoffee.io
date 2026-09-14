import { getTableName, inArray, or, sql } from 'drizzle-orm';

import {
	cocReport,
	coffeeTableGroupRequest,
	db,
	invite,
	inviteToken,
	lunchAndLearnIdea,
	membershipApplication,
	pendingGrant,
	user,
	volunteer,
	volunteerInviteLedger,
	volunteerSignup,
} from '@/db';

import { SEEDED_SLACK_IDS, SEEDED_USER_IDS } from './shared';

/**
 * The tables the seed owns outright. Their event tables cascade, and nothing
 * else points at them. `RESTART IDENTITY` is what keeps the `reference`
 * numbers stable across runs.
 */
const OWNED = [
	membershipApplication,
	inviteToken,
	invite,
	volunteerInviteLedger,
	volunteer,
	cocReport,
	volunteerSignup,
	lunchAndLearnIdea,
	coffeeTableGroupRequest,
];

/**
 * Clear what the last run wrote. `user` and `pending_grant` can also hold a
 * contributor's own Slack sign-in or hand-testing of the grant flow, and
 * `session`/`account`/`devtools_user` cascade from `user.id` — so those two
 * are cleared by the ids this script owns, not wholesale, to avoid silently
 * signing someone out. The Slack ids are matched too: a Volunteer the
 * devtools panel created may hold one of them from an earlier run.
 */
export async function reset() {
	const tables = OWNED.map((table) => `"${getTableName(table)}"`).join(', ');
	await db().execute(sql.raw(`TRUNCATE ${tables} RESTART IDENTITY CASCADE`));

	await db()
		.delete(pendingGrant)
		.where(inArray(pendingGrant.slackUserId, SEEDED_SLACK_IDS));
	await db()
		.delete(user)
		.where(
			or(
				inArray(user.id, SEEDED_USER_IDS),
				inArray(user.slackUserId, SEEDED_SLACK_IDS),
			),
		);
}
