/**
 * The client-safe half of the Slack directory: the row shape and the picker
 * filter. `src/data/slackMembers.ts` does the fetching and imports
 * `@slack/web-api`, which cannot be bundled for the browser, so the `'use
 * client'` pickers import from here instead.
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
