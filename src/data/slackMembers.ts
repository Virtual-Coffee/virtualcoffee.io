import { WebClient } from '@slack/web-api';
import { unstable_cache } from 'next/cache';

import { assertMocksAllowed } from './mocks';

/**
 * The Virtual Coffee Slack workspace directory.
 *
 * `/admin/user-management` needs it to pre-provision a Role for someone who has
 * never signed in — a Pending Grant is keyed on a Slack member id, and a
 * maintainer should be picking a person out of a list rather than copying an
 * opaque `U…` out of Slack's profile pane.
 *
 * This needs a bot token with `users:read`, which is a different credential
 * from the OAuth client that signs maintainers in: those scopes are OIDC-only
 * (`openid`, `profile`, `email`), so the access token Better Auth already
 * stores on `account` cannot call `users.list`.
 */
export type SlackMember = {
	/** The Slack member id — the same value that lands in `account.account_id`. */
	id: string;
	/** `real_name`, or the handle when someone has not set one. */
	name: string;
	/** What Slack shows in the sidebar: display name if set, otherwise `name`. */
	displayName: string;
	/** The `@handle`, without the `@`. */
	handle: string;
};

/**
 * The rows a picker shows for what someone typed: a substring match over the
 * three names, capped so the list scrolls rather than renders the workspace.
 * Shared by the roster and User Management pickers.
 */
export function filterSlackMembers<T extends SlackMember>(
	members: readonly T[],
	query: string,
	limit = 50,
): T[] {
	const needle = query.trim().toLowerCase();
	const pool = needle
		? members.filter((member) =>
				`${member.displayName} ${member.name} ${member.handle}`
					.toLowerCase()
					.includes(needle),
			)
		: members;
	return pool.slice(0, limit);
}

/** Slack's own bot, which `is_bot` does not cover. */
const SLACKBOT_ID = 'USLACKBOT';

/**
 * Everyone a maintainer could plausibly want to give admin access to.
 *
 * Bots cannot sign in, deactivated accounts should not be granted anything, and
 * single- and multi-channel guests are not members of the community — leaving
 * any of them in the picker is a list of names that can never claim a grant.
 */
function eligible(member: {
	id?: string;
	deleted?: boolean;
	is_bot?: boolean;
	is_restricted?: boolean;
	is_ultra_restricted?: boolean;
}): boolean {
	return (
		!member.deleted &&
		!member.is_bot &&
		!member.is_restricted &&
		!member.is_ultra_restricted &&
		member.id !== SLACKBOT_ID
	);
}

/**
 * The uncached fetch, kept separate from the cache wrapper below so it can be
 * exercised outside a request — `unstable_cache` throws without Next's
 * incremental cache, which puts the real API call out of reach of any script.
 */
export async function fetchSlackMembers(): Promise<SlackMember[]> {
	const token = process.env.SLACK_BOT_TOKEN;

	if (!token) {
		assertMocksAllowed('the Slack member directory');
		const fakeData = await import('./mocks/slackMembers');
		return fakeData.createSlackMembers();
	}

	const client = new WebClient(token);
	const members: SlackMember[] = [];
	let cursor: string | undefined;

	do {
		const response = await client.users.list({ limit: 200, cursor });

		for (const member of response.members ?? []) {
			if (!member.id || !eligible(member)) continue;

			const handle = member.name ?? '';
			const realName = member.profile?.real_name || member.real_name || '';
			const displayName = member.profile?.display_name || realName || handle;

			members.push({
				id: member.id,
				name: realName || handle,
				displayName,
				handle,
			});
		}

		cursor = response.response_metadata?.next_cursor || undefined;
	} while (cursor);

	return members.sort((a, b) => a.displayName.localeCompare(b.displayName));
}

/**
 * Cached for twelve hours and tagged, so `/_cache?tag=slack-members` picks up a
 * new hire without waiting. `users.list` is rate limited and pages the whole
 * workspace, which is far too much work to repeat on every render of a screen
 * two or three maintainers have open at once.
 */
export const getSlackMembers = unstable_cache(
	fetchSlackMembers,
	['slack-members'],
	{
		revalidate: 43200,
		tags: ['slack-members'],
	},
);
