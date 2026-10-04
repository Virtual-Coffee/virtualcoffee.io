'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';

import { applicationPath } from '@/lib/admin/links';
import { notifyAndRecord } from '@/lib/history/eventLog';
import { reportHandled } from '@/lib/monitoring/reportHandled';
import { applicationSubject, statusCounts } from '@/lib/waitlist/applications';
import { submit, type Submitted } from '@/lib/waitlist/lifecycle';
import { applicationSubmittedMessage, notifySlack } from '@/lib/slack/notify';
import { agree, email, name } from '@/util/forms/fields';
import { intake, savingFailed } from '@/util/forms/intake';
import {
	formError,
	formValue,
	githubUsername,
	invalidFields,
} from '@/util/forms/parse';
import type { FormState } from '@/util/forms/types';
import { siteUrl } from '@/util/url.server';

const THANKS = '/join/thank-you';

const schema = z.object({
	name: name(),
	email: email(),
	pronouns: z.string().trim().max(100).optional(),
	githubUsername: githubUsername().optional(),
	howDidYouHear: z.string().trim().max(5000).optional(),
	journey: z.string().trim().max(5000).optional(),
	codeInterests: z.string().trim().max(5000).optional(),
	virtualCoffee: z.string().trim().max(5000).optional(),
	agree: agree(),
});

export async function submitMembershipApplication(
	_state: FormState,
	formData: FormData,
): Promise<FormState> {
	const parsed = intake(formData, { schema, thanks: THANKS });
	if (!parsed.ok) return parsed.state;

	let outcome: Exclude<Submitted, { kind: 'duplicate' }>;

	try {
		const submitted = await submit(
			parsed.data,
			formValue(formData, 'invite') ?? null,
		);
		if (submitted.kind === 'duplicate') {
			return invalidFields({
				email:
					'There’s already an application for this email address. If that’s a surprise, email hello@virtualcoffee.io.',
			});
		}
		outcome = submitted;
	} catch (error) {
		// Deliberately not surfaced to the applicant: the upstream message can
		// name tables and columns, and there is nothing they could do with it.
		console.error('Membership application failed to save', error);
		reportHandled(error, { area: 'join' });
		return formError(savingFailed('application'));
	}

	// redirect() throws, so it stays outside the try above. Same page as a real
	// signup: the reply must not tell a bot it was caught. A quarantined row
	// posts nothing to Slack and records no notification event; the next real
	// post's footer counts it instead.
	if (outcome.kind === 'quarantined-repeat' || outcome.flagged)
		redirect(THANKS);
	const result = outcome;

	/**
	 * Persist first, notify second, per docs/adr/0005 — and outside the try above,
	 * so a Slack outage can never be reported to the applicant as a failure to
	 * save. Every application is announced; an invited one is flagged because it
	 * jumps the queue. The outcome is recorded as an event either way, which is
	 * what makes a silent notification visible in /admin.
	 */
	await notifyAndRecord(
		applicationSubject(result.applicationId),
		{
			channel: 'slack',
			what: result.claimed
				? 'Slack notified of an invited application'
				: 'Slack notified of a new application',
		},
		async () => {
			const depth = await queueDepth();
			return notifySlack(
				'membership',
				applicationSubmittedMessage({
					name: parsed.data.name,
					email: parsed.data.email,
					adminUrl: `${siteUrl()}${applicationPath(result.applicationId)}`,
					waitlistUrl: `${siteUrl()}/admin/waitlist`,
					suspectedUrl: `${siteUrl()}/admin/waitlist/suspected-spam`,
					waiting: depth?.waiting ?? null,
					suspected: depth?.suspected ?? 0,
					invite: result.claimed && {
						inviterName: result.claimed.inviterName,
					},
				}),
			);
		},
	);

	redirect(THANKS);
}

/**
 * How many are awaiting a first decision, and how many are quarantined as
 * suspected spam, for the post's footer. Best-effort:
 * the row is saved and the announcement matters more than the number, so a
 * failed read is logged and the footer left off.
 */
async function queueDepth(): Promise<{
	waiting: number;
	suspected: number;
} | null> {
	try {
		const counts = await statusCounts();
		return {
			waiting: counts.waitlisted ?? 0,
			suspected: counts.suspected_spam ?? 0,
		};
	} catch (error) {
		console.error('Waitlist count unavailable for the Slack post', error);
		return null;
	}
}
