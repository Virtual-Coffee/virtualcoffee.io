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

	let result: Extract<Submitted, { kind: 'submitted' }>;

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
		result = submitted;
	} catch (error) {
		// Deliberately not surfaced to the applicant: the upstream message can
		// name tables and columns, and there is nothing they could do with it.
		console.error('Membership application failed to save', error);
		reportHandled(error, { area: 'join' });
		return formError(savingFailed('application'));
	}

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
		async () =>
			notifySlack(
				'membership',
				applicationSubmittedMessage({
					name: parsed.data.name,
					email: parsed.data.email,
					adminUrl: `${siteUrl()}${applicationPath(result.applicationId)}`,
					waitlistUrl: `${siteUrl()}/admin/waitlist`,
					waiting: await waitingCount(),
					invite: result.claimed && {
						inviterName: result.claimed.inviterName,
					},
				}),
			),
	);

	redirect(THANKS);
}

/**
 * How many are awaiting a first decision, for the post's footer. Best-effort:
 * the row is saved and the announcement matters more than the number, so a
 * failed read is logged and the footer left off.
 */
async function waitingCount(): Promise<number | null> {
	try {
		const counts = await statusCounts();
		return counts.waitlisted ?? 0;
	} catch (error) {
		console.error('Waitlist count unavailable for the Slack post', error);
		return null;
	}
}
