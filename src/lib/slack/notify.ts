/**
 * Slack notifications for inbound Submissions.
 *
 * These replace four Airtable automations that fired on record creation and
 * posted into specific channels. Airtable was never just storage: it was the
 * only thing telling maintainers a CoC report had arrived. Moving the data
 * without moving the notification would have made those reports land silently.
 *
 * Incoming webhooks rather than a bot token: each one is bound to the channel
 * it was created for, so there is no channel ID in the code and no bot to
 * invite to the two private groups. The channels the automations posted to were
 * #lunch-and-learn (C022SHKKQG2) and three private groups.
 */

/** What happened, in a sentence — recorded as the event body either way. */
export type NotifyResult = { ok: boolean; message: string };

/**
 * One webhook per destination, so a missing one only silences its own form.
 *
 * The first four are the Submission kinds and share their keys with
 * `SUBMISSION_KINDS`. `membership` is not a Submission kind — it is the
 * membership pipeline, which had no Slack notification at all until Volunteer
 * Invites needed one. It is named for the pipeline rather than for invites so
 * the next thing the queue wants to announce does not need a sixth variable.
 * Reach it through `notifySlack` directly: `notifyAndRecord` is keyed on
 * `SubmissionKind` and records into `submission_event`, which is the wrong table
 * for an application.
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
 * Post a message, returning rather than throwing.
 *
 * Callers have already written the submission to the database by this point, so
 * a failure here must never propagate — losing a CoC report because Slack was
 * unreachable is far worse than a report nobody was pinged about. The caller
 * records the outcome as an event either way. See docs/adr/0005.
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

/** `*bold*` is Slack's mrkdwn, not Markdown's `**bold**`. */
function field(label: string, value: string | null | undefined): string {
	return `*${label}:* ${value?.trim() || '—'}`;
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
		report.description,
		'',
		'*Anyone else involved:*',
		report.anyoneElseInvolved?.trim() || '—',
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
		signup.description?.trim() || '—',
	].join('\n');
}

export function lunchAndLearnMessage(idea: {
	topic: string;
	name: string;
	issueUrl: string | null;
}): string {
	const lead = `New Lunch & Learn Submission: ${idea.topic} by ${idea.name}`;
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
		request.description?.trim() || '—',
	].join('\n');
}
