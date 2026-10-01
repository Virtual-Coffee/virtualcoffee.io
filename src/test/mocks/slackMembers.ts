import type { SlackMember } from '@/data/slackMembers';

/**
 * The Slack directory the db project sees: `members` is what `getSlackMembers`
 * returns, and `during` runs inside the lookup — `grantPendingAccess` looks
 * the member up before it takes the lock and asks whether they have signed
 * in, so a test can land a sign-in in that window.
 *
 * `src/test/db/setup.ts` spreads this over the original, so
 * `filterSlackMembers` stays real.
 */
export const slackDirectory = {
	members: [] as SlackMember[],
	during: undefined as (() => Promise<void>) | undefined,
};

export async function getSlackMembers(): Promise<SlackMember[]> {
	await slackDirectory.during?.();
	return slackDirectory.members;
}

/** A directory entry named after its id, for tests that only match on it. */
export function slackMember(
	id: string,
	overrides: Partial<Omit<SlackMember, 'id'>> = {},
): SlackMember {
	return {
		id,
		name: id,
		displayName: id,
		handle: id,
		email: null,
		...overrides,
	};
}

export function resetSlackDirectory() {
	slackDirectory.members = [];
	slackDirectory.during = undefined;
}
