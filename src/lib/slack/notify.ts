/**
 * Slack notifications for inbound Submissions. Incoming webhooks rather than a
 * bot token: each is bound to its channel, so no channel id lives in the code
 * and no bot needs inviting to the private groups.
 */

import { deliver, type Outbound } from '@/lib/outbound';
import { note, notification, type Field, type SlackMessage } from './blocks';

/**
 * One webhook per destination, so a missing one only silences its own form.
 * The first four share their keys with `SUBMISSION_KINDS`. `membership` is
 * the membership pipeline, not a Submission kind: reach it through
 * `notifySlack` directly, since `notifyAndRecord` writes `submission_event`.
 */
const WEBHOOK_ENV = {
	coc: 'SLACK_WEBHOOK_COC',
	volunteers: 'SLACK_WEBHOOK_VOLUNTEERS',
	'lunch-and-learn': 'SLACK_WEBHOOK_LUNCH_AND_LEARN',
	'coffee-tables': 'SLACK_WEBHOOK_COFFEE_TABLES',
	membership: 'SLACK_WEBHOOK_MEMBERSHIP',
} as const;

export type NotifyChannel = keyof typeof WEBHOOK_ENV;

const TIMEOUT_MS = 10_000;

/**
 * Post a message, returning rather than throwing: the submission is already
 * written, and the caller records the outcome either way. See docs/adr/0005.
 *
 * Outside production `deliver()` Captures the post before the webhook is
 * looked at, so a preview without webhooks is quiet, not "never announced".
 * docs/adr/0013.
 */
export function notifySlack(
	channel: NotifyChannel,
	message: SlackMessage,
): Promise<Outbound> {
	return deliver({
		kind: 'slack',
		target: channel,
		// The payload itself, so the local log shows what would have been posted
		// and a deploy's link-only line still finds the admin URL in it.
		body: JSON.stringify(message, null, 2),
		unreachable: 'Slack',
		live: async () => {
			const url = process.env[WEBHOOK_ENV[channel]];

			if (!url) {
				return {
					ok: false,
					definitelyNotSent: true,
					message: `${WEBHOOK_ENV[channel]} is not set, so nothing was posted to Slack.`,
				};
			}

			const response = await fetch(url, {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				// The admin link is behind sign-in, so an unfurl could only ever be a
				// stray preview of the sign-in page.
				body: JSON.stringify({ ...message, unfurl_links: false }),
				signal: AbortSignal.timeout(TIMEOUT_MS),
			});

			if (!response.ok) {
				// Slack returns a plain-text reason ("no_service", "invalid_payload").
				const detail = await response.text().catch(() => '');
				return {
					ok: false,
					definitelyNotSent: true,
					message: `Slack rejected the message (${response.status}${
						detail ? `: ${detail.slice(0, 200)}` : ''
					}).`,
				};
			}

			return { ok: true, message: 'Posted to Slack.' };
		},
	});
}

/*
 * Every post is one container of the row's identifying fields and a button to
 * the row; what a person wrote at length stays behind the button, on a page
 * that needs a sign-in. The shapes are in `./blocks`, the format decision in
 * docs/adr/0016. `text` is what a push notification shows: the title, plus the
 * subtitle where that is not a person's name.
 */

function text(title: string, subtitle?: string | null): string {
	return subtitle ? `${title} — ${subtitle}` : title;
}

/**
 * Collapsed on arrival: a channel is the wrong place for a reporter's name and
 * the time and place of an incident to sit open, and `text` carries no field.
 */
export function cocReportMessage(report: {
	name: string | null;
	email: string | null;
	reporteeName: string;
	timeLocation: string;
	hasAttachment: boolean;
	adminUrl: string;
}): SlackMessage {
	const title = 'CoC Report Submitted';
	return {
		text: title,
		blocks: [
			notification({
				title,
				subtitle: `Submitted ${report.name === null ? 'anonymously' : `by ${report.name}`} · expand to view`,
				collapsed: true,
				fields: [
					['Name', report.name ?? '(anonymous)'],
					['Email', report.email ?? '(anonymous)'],
					['Reportee Name', report.reporteeName],
					['Time/Location', report.timeLocation],
				],
				note: report.hasAttachment
					? '_A file was attached; open the report to view it._'
					: null,
				buttons: [
					{ url: report.adminUrl, label: 'View in admin', primary: true },
				],
			}),
		],
	};
}

export function volunteerSignupMessage(signup: {
	name: string;
	email: string;
	position: string | null;
	adminUrl: string;
}): SlackMessage {
	const title = 'New Volunteer Form Submission';
	return {
		text: text(title, signup.position),
		blocks: [
			notification({
				title,
				subtitle: signup.position,
				fields: [
					['Name', signup.name],
					['Email', signup.email],
					['Position', signup.position],
				],
				buttons: [
					{ url: signup.adminUrl, label: 'View in admin', primary: true },
				],
			}),
		],
	};
}

export function lunchAndLearnMessage(idea: {
	name: string;
	email: string;
	topic: string;
	issueUrl: string | null;
	adminUrl: string;
}): SlackMessage {
	const title = 'New Lunch & Learn Idea';
	return {
		text: text(title, idea.topic),
		blocks: [
			notification({
				title,
				subtitle: idea.topic,
				fields: [
					['Name', idea.name],
					['Email', idea.email],
					['Title', idea.topic],
				],
				buttons: [
					{ url: idea.adminUrl, label: 'View in admin', primary: true },
					...(idea.issueUrl
						? [{ url: idea.issueUrl, label: 'GitHub issue' }]
						: []),
				],
			}),
		],
	};
}

export function coffeeTableGroupMessage(request: {
	name: string;
	email: string;
	groupName: string | null;
	adminUrl: string;
}): SlackMessage {
	const title = 'New Coffee Table Group';
	return {
		text: text(title, request.groupName),
		blocks: [
			notification({
				title,
				subtitle: request.groupName,
				fields: [
					['Name', request.name],
					['Email', request.email],
					['Group name', request.groupName],
				],
				buttons: [
					{ url: request.adminUrl, label: 'View in admin', primary: true },
				],
			}),
		],
	};
}

/**
 * An application has joined the queue: the membership pipeline's one
 * notification. An invited one is flagged, because a claim puts a priority
 * application at the front of the Waitlist for a reviewer to pick up —
 * whereas sending the Invite was a Volunteer spending their own allowance,
 * and nobody else's work. `waiting` is how deep the queue now is, or null when
 * the count could not be read: the announcement matters more than the number.
 */
export function applicationSubmittedMessage(application: {
	name: string;
	email: string;
	adminUrl: string;
	waitlistUrl: string;
	waiting: number | null;
	invite: { inviterName: string | null } | null;
}): SlackMessage {
	const { invite, waiting } = application;
	const title = invite
		? 'Invited Application Received'
		: 'Application Received';
	const subtitle = invite
		? invite.inviterName
			? `Invited by ${invite.inviterName}`
			: 'Invited application'
		: 'Membership waitlist';
	const fields: Field[] = [
		['Name', application.name],
		['Email', application.email],
	];
	if (invite) fields.push(['Invited by', invite.inviterName]);
	return {
		text: text(title, subtitle),
		blocks: [
			notification({
				title,
				subtitle,
				fields,
				note: invite
					? '_Invited applications sort to the front of the waitlist._'
					: null,
				buttons: [
					{ url: application.adminUrl, label: 'View in admin', primary: true },
				],
			}),
			...(waiting === null
				? []
				: [
						note(
							`*${waiting}* waiting on a first decision · <${application.waitlistUrl}|Waitlist queue>`,
						),
					]),
		],
	};
}
