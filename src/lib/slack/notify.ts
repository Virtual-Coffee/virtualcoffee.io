/**
 * Slack notifications for inbound Submissions. Incoming webhooks rather than a
 * bot token: each is bound to its channel, so no channel id lives in the code
 * and no bot needs inviting to the private groups.
 */

import { deliver, type Outbound } from '@/lib/outbound';

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
	text: string,
): Promise<Outbound> {
	return deliver({
		kind: 'slack',
		target: channel,
		body: text,
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
				body: JSON.stringify({ text, unfurl_links: false }),
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

/**
 * Slack reads `&`, `<` and `>` as control characters — `<!channel>` in a
 * form field would page the whole channel — so every value a person typed
 * is escaped before it is interpolated. Slack's own list, and only those
 * three: entity-encoding anything else shows up literally.
 */
function escape(value: string): string {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;');
}

/** `*bold*` is Slack's mrkdwn, not Markdown's `**bold**`; a dash for nothing. */
function field(label: string, value: string | null | undefined): string {
	const trimmed = value?.trim();
	return `*${label}:* ${trimmed ? escape(trimmed) : '—'}`;
}

/**
 * `<url|label>` is Slack's link syntax. The URLs here are the site's own,
 * built from an id, so neither can carry the `|` or `>` that would end it.
 */
function link(url: string, label: string): string {
	return `<${url}|${label}>`;
}

/** The last line of every message: where a reviewer opens the row. */
function adminLink(url: string, label = 'View in admin'): string {
	return link(url, label);
}

/*
 * Every message is the row's identifying fields and the link; what a person
 * wrote at length stays behind the link, on a page that needs a sign-in. A
 * channel is the wrong place for a CoC report's account of what happened.
 */

export function cocReportMessage(report: {
	name: string | null;
	email: string | null;
	reporteeName: string;
	timeLocation: string;
	hasAttachment: boolean;
	adminUrl: string;
}): string {
	return [
		'*CoC Report Submitted*',
		'',
		field('Name', report.name ?? '(anonymous)'),
		field('Email', report.email ?? '(anonymous)'),
		field('Reportee Name', report.reporteeName),
		field('Time/Location', report.timeLocation),
		'',
		report.hasAttachment
			? `_${adminLink(report.adminUrl, 'A file was attached; open the report to view it.')}_`
			: adminLink(report.adminUrl),
	].join('\n');
}

export function volunteerSignupMessage(signup: {
	name: string;
	email: string;
	position: string | null;
	adminUrl: string;
}): string {
	return [
		'*New Volunteer Form Submission*',
		'',
		field('Name', signup.name),
		field('Email', signup.email),
		field('Position', signup.position),
		'',
		adminLink(signup.adminUrl),
	].join('\n');
}

export function lunchAndLearnMessage(idea: {
	name: string;
	email: string;
	topic: string;
	issueUrl: string | null;
	adminUrl: string;
}): string {
	return [
		'*New Lunch & Learn Idea*',
		'',
		field('Name', idea.name),
		field('Email', idea.email),
		field('Title', idea.topic),
		'',
		...(idea.issueUrl ? [link(idea.issueUrl, 'GitHub issue')] : []),
		adminLink(idea.adminUrl),
	].join('\n');
}

export function coffeeTableGroupMessage(request: {
	name: string;
	email: string;
	groupName: string | null;
	adminUrl: string;
}): string {
	return [
		'*New Coffee Table Group*',
		'',
		field('Name', request.name),
		field('Email', request.email),
		field('Group name', request.groupName),
		'',
		adminLink(request.adminUrl),
	].join('\n');
}

/**
 * An application has joined the queue: the membership pipeline's one
 * notification. An invited one is flagged, because a claim puts a priority
 * application at the front of the Waitlist for a reviewer to pick up —
 * whereas sending the Invite was a Volunteer spending their own allowance,
 * and nobody else's work.
 */
export function applicationSubmittedMessage(application: {
	name: string;
	email: string;
	adminUrl: string;
	invite: { inviterName: string | null } | null;
}): string {
	const { invite } = application;
	return [
		invite ? '*Invited Application Received*' : '*Application Received*',
		'',
		field('Name', application.name),
		field('Email', application.email),
		...(invite ? [field('Invited by', invite.inviterName)] : []),
		'',
		...(invite
			? ['_Invited applications sort to the front of the waitlist._']
			: []),
		adminLink(application.adminUrl),
	].join('\n');
}
