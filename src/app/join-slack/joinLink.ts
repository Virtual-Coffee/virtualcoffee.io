/**
 * `SLACK_JOIN_LINK`, or `null` when it is unset or not an HTTPS Slack URL.
 * Checked before a token is spent, so a misconfigured deploy never burns a
 * single-use invite on a redirect to nowhere. Shared by the page and its
 * action so both refuse the same values.
 */
export function slackJoinLink(): string | null {
	const raw = process.env.SLACK_JOIN_LINK;
	if (raw) {
		try {
			const url = new URL(raw);
			if (url.protocol === 'https:' && url.hostname.endsWith('.slack.com')) {
				return url.href;
			}
		} catch {
			// Not a URL at all; reported below.
		}
	}
	console.error(
		raw
			? 'SLACK_JOIN_LINK is not an HTTPS Slack URL; cannot complete a Slack invite.'
			: 'SLACK_JOIN_LINK is not set; cannot complete a Slack invite.',
	);
	return null;
}
