import { WebClient } from '@slack/web-api';

import { deliver, type Outbound } from '@/lib/outbound';
import { ROLE_LABELS, type RoleName } from '@/lib/access/permissions';
import { siteUrl } from '@/util/url.server';
import { buttons, type SlackMessage } from './blocks';

const TIMEOUT_MS = 10_000;

/**
 * DM a specific Slack member — distinct from `notifySlack()`, which posts to a
 * fixed channel via an incoming webhook and cannot reach an arbitrary person.
 * Needs the same `SLACK_BOT_TOKEN` as the member directory
 * (`src/data/slackMembers.ts`), with `im:write` and `chat:write` added to its
 * `users:read` scope so it can open a DM and post to it.
 *
 * Never throws, like `notifySlack()`. Unlike it, there is no opt-in: outside
 * production the DM is always Captured, because the id it is addressed to is
 * a real member's on a preview. See docs/adr/0013.
 */
export function sendSlackDm(
	slackUserId: string,
	message: SlackMessage,
): Promise<Outbound> {
	return deliver({
		kind: 'slack dm',
		target: slackUserId,
		body: JSON.stringify(message, null, 2),
		unreachable: 'Slack',
		live: async () => {
			const token = process.env.SLACK_BOT_TOKEN;
			if (!token) {
				return {
					ok: false,
					definitelyNotSent: true,
					message: 'SLACK_BOT_TOKEN is not set, so no DM was sent.',
				};
			}

			// No SDK retries: the default policy re-sends for ~30 minutes, past the
			// action's own timeout, and a lost postMessage response would DM twice.
			const client = new WebClient(token, {
				timeout: TIMEOUT_MS,
				retryConfig: { retries: 0 },
			});
			const opened = await client.conversations.open({ users: slackUserId });
			const channel = opened.channel?.id;

			if (!channel) {
				return {
					ok: false,
					definitelyNotSent: true,
					message: 'Could not open a DM with that Slack member.',
				};
			}

			await client.chat.postMessage({ channel, ...message });
			return { ok: true, message: 'DM sent.' };
		},
	});
}

/**
 * What a newly (or re-)granted person is told: which access, and one button —
 * to sign in and claim it (a Pending Grant) or, for a Role applied directly to
 * someone already signed in, to open what is live now. A grant holding only
 * `volunteer` points at `/invites`, since that role holds no /admin section
 * (docs/adr/0010); anything else points at `/admin`. Top-level blocks, not a
 * container: one line and one button need no group to collapse.
 */
export function grantDmMessage(grant: {
	roles: RoleName[];
	/** Already on their account — nothing to claim. Only ever a Pending Grant otherwise. */
	active?: boolean;
}): SlackMessage {
	const volunteerOnly =
		grant.roles.length === 1 && grant.roles[0] === 'volunteer';
	const tools = volunteerOnly ? 'Invites' : 'admin';
	const url = `${siteUrl()}${volunteerOnly ? '/invites' : '/admin'}`;
	// Role labels are the site's own strings, so mrkdwn is safe here.
	const labels = grant.roles.map((role) => ROLE_LABELS[role]).join(', ');

	return {
		text: `You've been given access to Virtual Coffee's ${tools} tools: ${labels}.`,
		blocks: [
			{
				type: 'section',
				text: {
					type: 'mrkdwn',
					text: `You've been given access to Virtual Coffee's ${tools} tools: *${labels}*.${
						grant.active
							? " It's active now."
							: ' Sign in with Slack to activate it.'
					}`,
				},
			},
			buttons(
				grant.active
					? {
							url,
							label: `Open ${volunteerOnly ? 'Invites' : 'admin tools'}`,
							id: volunteerOnly ? 'open_invites' : 'open_admin',
							primary: true,
						}
					: { url, label: 'Sign in with Slack', id: 'sign_in', primary: true },
			),
		],
	};
}
