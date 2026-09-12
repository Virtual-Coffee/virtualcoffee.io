/**
 * Why a Slack invite link did not work, in words for the person holding it —
 * a new member who did nothing wrong. Shared by the page and its action.
 */
export const FAILURES = {
	unknown:
		'We don’t recognise this invite link. It may be from an older invite.',
	used: 'This invite link has already been used. Invites work once, on purpose.',
	expired: 'This invite link has expired.',
	misconfigured:
		'Your invite is valid, but we can’t forward you to Slack right now.',
} as const;
