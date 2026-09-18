'use server';

import { and, eq, gt, inArray, sql } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import { db, invite, membershipApplication } from '@/db';
import { applicationPath } from '@/lib/admin/links';
import { recordEvent, recordOutcome } from '@/lib/history/eventLog';
import { applicationSubject } from '@/lib/waitlist/applications';
import { hashClaimToken } from '@/lib/volunteers/invites';
import { QUEUE_STATUSES } from '@/lib/waitlist/applicationStatuses';
import { applicationSubmittedMessage, notifySlack } from '@/lib/slack/notify';
import { agree, email, name } from '@/util/forms/fields';
import { intake } from '@/util/forms/intake';
import {
	formError,
	formValue,
	githubUsername,
	invalidFields,
} from '@/util/forms/parse';
import type { FormState } from '@/util/forms/types';
import { siteUrl } from '@/util/url.server';

/** What redeeming a Claim Link yields, or null when there was nothing to redeem. */
type ClaimedInvite = {
	id: string;
	inviterName: string | null;
	inviterSlackUserId: string | null;
} | null;

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

	const now = new Date();
	const claimToken = formValue(formData, 'invite');
	let result: { applicationId: string; claimed: ClaimedInvite };

	try {
		/**
		 * One application per person in the pipeline. Someone who was declined,
		 * withdrew or lapsed can apply again; someone already waiting, invited or
		 * a member gets told so instead of a second row for a reviewer to notice.
		 *
		 * Checked before the transaction, so nothing is written and a Claim Link
		 * is not burned. Deliberately a lookup and not a unique index: the imported
		 * history holds duplicates, and this is a courtesy rather than a boundary —
		 * two submissions racing each other can still both land, and the spam
		 * guard's own scope (drive-by bots, not a determined sender) is unchanged.
		 *
		 * The message does tell a caller whether an address is in the pipeline.
		 * Accepted: this is a community waitlist behind the edge rate limit
		 * (netlify/edge-functions/rate-limit-join.ts), and telling someone they
		 * already applied is worth more than hiding that from a prober.
		 */
		const [existing] = await db()
			.select({ id: membershipApplication.id })
			.from(membershipApplication)
			.where(
				and(
					sql`lower(${membershipApplication.email}) = ${parsed.data.email.toLowerCase()}`,
					inArray(membershipApplication.status, [...QUEUE_STATUSES, 'member']),
				),
			)
			.limit(1);
		if (existing) {
			return invalidFields({
				email:
					'There’s already an application for this email address. If that’s a surprise, email hello@virtualcoffee.io.',
			});
		}

		result = await db().transaction(async (tx) => {
			let claimed: ClaimedInvite = null;
			/**
			 * Redeem the Claim Link and write the application together.
			 *
			 * The redemption is a conditional UPDATE, so two submissions racing on
			 * one link produce exactly one priority application — the second finds
			 * nothing to claim and is written as an ordinary signup. Doing it in the
			 * same transaction as the insert is what stops a failed insert burning
			 * the Invite: the applicant would lose both their answers and their
			 * friend's invite, having done nothing wrong.
			 */
			if (claimToken) {
				const [redeemed] = await tx
					.update(invite)
					.set({
						status: 'accepted',
						claimedAt: now,
						// Single-use: clearing the hash is what makes the link dead
						// rather than merely checked-against.
						tokenHash: null,
					})
					.where(
						and(
							eq(invite.tokenHash, hashClaimToken(claimToken)),
							eq(invite.status, 'pending'),
							gt(invite.tokenExpiresAt, now),
						),
					)
					.returning({
						id: invite.id,
						inviterName: invite.inviterName,
						inviterSlackUserId: invite.inviterSlackUserId,
					});

				claimed = redeemed ?? null;
			}

			const [row] = await tx
				.insert(membershipApplication)
				.values({
					name: parsed.data.name,
					email: parsed.data.email,
					pronouns: parsed.data.pronouns ?? null,
					githubUsername: parsed.data.githubUsername || null,
					howDidYouHear: parsed.data.howDidYouHear ?? null,
					journey: parsed.data.journey ?? null,
					codeInterests: parsed.data.codeInterests ?? null,
					virtualCoffee: parsed.data.virtualCoffee ?? null,
					status: 'waitlisted',
					/**
					 * An expired or already-used link still produces an application, as
					 * an ordinary signup. Refusing it would throw away the long answers
					 * they just wrote over a link they had no way to check.
					 */
					source: claimed ? 'volunteer_invite' : 'waitlist_signup',
					// Nothing derives one from the other; both are set by hand
					// everywhere an invited application is written.
					isPriority: Boolean(claimed),
					inviteId: claimed ? claimed.id : null,
					referrer: claimed ? claimed.inviterName : null,
					agreedToCocAt: now,
					submittedAt: now,
					waitlistedAt: now,
				})
				.returning({ id: membershipApplication.id });

			await recordEvent(
				applicationSubject(row.id),
				{
					type: 'submitted',
					toStatus: 'waitlisted',
					body: claimed
						? `Application submitted from an invite by ${claimed.inviterName ?? 'a volunteer'}`
						: 'Application submitted',
				},
				tx,
			);

			return { applicationId: row.id, claimed };
		});
	} catch (error) {
		// Deliberately not surfaced to the applicant: the upstream message can
		// name tables and columns, and there is nothing they could do with it.
		console.error('Membership application failed to save', error);
		return formError(
			'Something went wrong saving your application. Please try again, or email hello@virtualcoffee.io.',
		);
	}

	/**
	 * Persist first, notify second, per docs/adr/0005 — and outside the try above,
	 * so a Slack outage can never be reported to the applicant as a failure to
	 * save. Every application is announced; an invited one is flagged because it
	 * jumps the queue. The outcome is recorded as an event either way, which is
	 * what makes a silent notification visible in /admin.
	 */
	const notified = await notifySlack(
		'membership',
		applicationSubmittedMessage({
			name: parsed.data.name,
			email: parsed.data.email,
			adminUrl: `${siteUrl()}${applicationPath(result.applicationId)}`,
			invite: result.claimed && { inviterName: result.claimed.inviterName },
		}),
	);

	await recordOutcome(applicationSubject(result.applicationId), {
		channel: 'slack',
		outbound: notified,
		what: result.claimed
			? 'Slack notified of an invited application'
			: 'Slack notified of a new application',
	});

	redirect(THANKS);
}
