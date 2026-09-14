import { WebClient } from '@slack/web-api';

import { capture, deployContext, notifyDelivery } from '@/lib/outbound';
import { ROLE_LABELS, type RoleName } from '@/lib/permissions';
import { siteUrl } from '@/util/url.server';
import type { NotifyResult } from './notify';

const TIMEOUT_MS = 10_000;

/**
 * DM a specific Slack member — distinct from `notifySlack()`, which posts to a
 * fixed channel via an incoming webhook and cannot reach an arbitrary person.
 * Needs the same `SLACK_BOT_TOKEN` as the member directory
 * (`src/data/slackMembers.ts`), with `chat:write` added to its `users:read`
 * scope so it can open a DM and post to it.
 *
 * Same contract as `notifySlack()`: never throws, and outside production the
 * send is Captured rather than reaching a real person. See docs/adr/0013.
 */
export async function sendSlackDm(
	slackUserId: string,
	text: string,
): Promise<NotifyResult> {
	if (notifyDelivery() === 'captured') {
		capture('slack', slackUserId, text);
		return {
			ok: true,
			message: `Captured, not sent to Slack (${deployContext()}).`,
		};
	}

	const token = process.env.SLACK_BOT_TOKEN;
	if (!token) {
		return {
			ok: false,
			message: 'SLACK_BOT_TOKEN is not set, so no DM was sent.',
		};
	}

	try {
		const client = new WebClient(token, { timeout: TIMEOUT_MS });
		const opened = await client.conversations.open({ users: slackUserId });
		const channel = opened.channel?.id;

		if (!channel) {
			return {
				ok: false,
				message: 'Could not open a DM with that Slack member.',
			};
		}

		await client.chat.postMessage({ channel, text });
		return { ok: true, message: 'DM sent.' };
	} catch (error) {
		return {
			ok: false,
			message:
				error instanceof Error
					? `Could not reach Slack: ${error.message}`
					: 'Could not reach Slack.',
		};
	}
}

/**
 * What a newly (or re-)granted person is told: which access, and where to sign
 * in to claim it. A grant holding only `volunteer` points at `/invites`, since
 * that role holds no /admin section (docs/adr/0010); anything else points at
 * `/admin`.
 */
export function grantDmMessage(grant: { roles: RoleName[] }): string {
	const volunteerOnly =
		grant.roles.length === 1 && grant.roles[0] === 'volunteer';
	const path = volunteerOnly ? '/invites' : '/admin';
	const labels = grant.roles.map((role) => ROLE_LABELS[role]).join(', ');

	return [
		`You've been given access to Virtual Coffee's ${volunteerOnly ? 'Invites' : 'admin'} tools: *${labels}*.`,
		'',
		`Sign in with Slack to activate it: ${siteUrl()}${path}`,
	].join('\n');
}
