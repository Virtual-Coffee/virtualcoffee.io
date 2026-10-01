import { faker } from '@faker-js/faker';

import type { SlackMember } from '../slackMembers';

/**
 * Stand-in for the Virtual Coffee Slack directory, so `/admin/user-management`
 * is usable on a clone with no `SLACK_BOT_TOKEN`.
 *
 * The ids follow Slack's real shape (`U` + uppercase alphanumerics) because
 * they are written into `pending_grant.slack_user_id` and compared against
 * `account.account_id` — a mock id that could never come back from Slack would
 * make the local claim path untestable.
 */
export function createSlackMembers(count = 40): SlackMember[] {
	// Seeded so the directory is stable across restarts. An id granted a Pending
	// Grant on Monday has to still be in the list on Tuesday, or the local claim
	// path cannot be exercised at all.
	faker.seed(20260910);

	return Array.from({ length: count }, () => {
		const name = faker.person.fullName();
		const handle = faker.internet.username().toLowerCase();

		return {
			id: `U${faker.string.alphanumeric({ length: 9, casing: 'upper' })}`,
			name,
			displayName: name,
			handle,
		};
	}).sort((a, b) => a.displayName.localeCompare(b.displayName));
}
