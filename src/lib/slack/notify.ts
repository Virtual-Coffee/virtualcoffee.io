/**
 * Slack notifications for inbound Submissions. Incoming webhooks rather than a
 * bot token: each is bound to its channel, so no channel id lives in the code
 * and no bot needs inviting to the private groups.
 */

/** What happened, in a sentence — recorded as the event body either way. */
export type NotifyResult = { ok: boolean; message: string };

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
 */
export async function notifySlack(
	channel: NotifyChannel,
	text: string,
): Promise<NotifyResult> {
	const url = process.env[WEBHOOK_ENV[channel]];

	if (!url) {
		return {
			ok: false,
			message: `${WEBHOOK_ENV[channel]} is not set, so nothing was posted to Slack.`,
		};
	}

	try {
		const response = await fetch(url, {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ text, unfurl_links: true }),
			signal: AbortSignal.timeout(TIMEOUT_MS),
		});

		if (!response.ok) {
			// Slack returns a plain-text reason ("no_service", "invalid_payload").
			const detail = await response.text().catch(() => '');
			return {
				ok: false,
				message: `Slack rejected the message (${response.status}${
					detail ? `: ${detail.slice(0, 200)}` : ''
				}).`,
			};
		}

		return { ok: true, message: 'Posted to Slack.' };
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

/** A free-text block as typed, or a dash for nothing. */
function block(value: string | null | undefined): string {
	const trimmed = value?.trim();
	return trimmed ? escape(trimmed) : '—';
}

/** `*bold*` is Slack's mrkdwn, not Markdown's `**bold**`. */
function field(label: string, value: string | null | undefined): string {
	return `*${label}:* ${block(value)}`;
}

export function cocReportMessage(report: {
	name: string | null;
	email: string | null;
	reporteeName: string;
	timeLocation: string;
	description: string;
	anyoneElseInvolved: string | null;
	hasAttachment: boolean;
}): string {
	return [
		'*CoC Report Submitted*',
		'',
		field('Name', report.name ?? '(anonymous)'),
		field('Email', report.email ?? '(anonymous)'),
		field('Reportee Name', report.reporteeName),
		field('Time/Location', report.timeLocation),
		'',
		'*Description:*',
		block(report.description),
		'',
		'*Anyone else involved:*',
		block(report.anyoneElseInvolved),
		report.hasAttachment
			? '\n_A file was attached; open the report to view it._'
			: '',
	]
		.join('\n')
		.trimEnd();
}

export function volunteerSignupMessage(signup: {
	name: string;
	email: string;
	position: string | null;
	description: string | null;
}): string {
	return [
		'*New Volunteer Form Submission*',
		'',
		field('Name', signup.name),
		field('Email', signup.email),
		field('Position', signup.position),
		'',
		'*Description:*',
		block(signup.description),
	].join('\n');
}

export function lunchAndLearnMessage(idea: {
	topic: string;
	name: string;
	issueUrl: string | null;
}): string {
	const lead = `New Lunch & Learn Submission: ${escape(idea.topic)} by ${escape(idea.name)}`;
	return idea.issueUrl ? `${lead}\n\nGitHub Link: ${idea.issueUrl}` : lead;
}

/**
 * An invited applicant has joined the queue.
 *
 * The one membership-pipeline notification, and it fires on the claim rather
 * than on the send: sending an Invite is a Volunteer spending their own
 * allowance and is nobody else's work, whereas a claim puts a priority
 * application at the front of the Waitlist for a reviewer to pick up.
 */
export function inviteClaimedMessage(claim: {
	inviteeName: string;
	inviteeEmail: string;
	inviterName: string | null;
}): string {
	return [
		'*Invited Application Received*',
		'',
		field('Name', claim.inviteeName),
		field('Email', claim.inviteeEmail),
		field('Invited by', claim.inviterName),
		'',
		'_Invited applications sort to the front of the waitlist._',
	].join('\n');
}

export function coffeeTableGroupMessage(request: {
	name: string;
	email: string;
	groupName: string | null;
	description: string | null;
}): string {
	return [
		'*New Coffee Table Group*',
		'',
		field('Name', request.name),
		field('Email', request.email),
		field('Group name', request.groupName),
		'',
		'*Description:*',
		block(request.description),
	].join('\n');
}
