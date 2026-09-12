'use server';

import { and, eq, gt } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import { applicationEvent, db, invite, membershipApplication } from '@/db';
import { hashClaimToken } from '@/lib/invites';
import { inviteClaimedMessage, notifySlack } from '@/lib/slack/notify';
import { formValue, fieldErrorsFrom } from '@/util/forms/parse';
import { looksLikeSpam } from '@/util/forms/spamGuard';

/** What redeeming a Claim Link yields, or null when there was nothing to redeem. */
type ClaimedInvite = {
	id: string;
	inviterName: string | null;
	inviterSlackUserId: string | null;
} | null;

export type JoinFormState = null | {
	is_error: boolean;
	message?: string;
	/** Field name -> first error, so inputs can be marked individually. */
	fieldErrors?: Record<string, string>;
};

const schema = z.object({
	name: z.string().trim().min(1, 'Please tell us your name.').max(200),
	email: z.email('That doesn’t look like an email address.').max(320),
	pronouns: z.string().trim().max(100).optional(),
	githubUsername: z
		.string()
		.trim()
		.max(100)
		// Accept a pasted profile URL or an @handle as well as a bare username.
		.transform((value) =>
			value
				.replace(/^https?:\/\/(www\.)?github\.com\//i, '')
				.replace(/^@/, '')
				.replace(/\/$/, ''),
		)
		.optional(),
	howDidYouHear: z.string().trim().max(5000).optional(),
	journey: z.string().trim().max(5000).optional(),
	codeInterests: z.string().trim().max(5000).optional(),
	virtualCoffee: z.string().trim().max(5000).optional(),
	agree: z.literal('agree', {
		message: 'Please confirm you’ve read the Code of Conduct.',
	}),
});

export async function submitMembershipApplication(
	_state: JoinFormState,
	formData: FormData,
): Promise<JoinFormState> {
	// Same silent success the four submission forms give a bot: it sees the
	// thank-you page and nothing is written.
	if (looksLikeSpam(formData)) {
		redirect('/join/thank-you');
	}

	const parsed = schema.safeParse({
		name: formData.get('name') ?? '',
		email: formData.get('email') ?? '',
		pronouns: formValue(formData, 'pronouns'),
		githubUsername: formValue(formData, 'githubUsername'),
		howDidYouHear: formValue(formData, 'howDidYouHear'),
		journey: formValue(formData, 'journey'),
		codeInterests: formValue(formData, 'codeInterests'),
		virtualCoffee: formValue(formData, 'virtualCoffee'),
		agree: formData.get('agree') ?? '',
	});

	if (!parsed.success) {
		return {
			is_error: true,
			message: 'Please check the highlighted fields.',
			fieldErrors: fieldErrorsFrom(parsed.error),
		};
	}

	const now = new Date();
	const claimToken = formValue(formData, 'invite');
	let result: { applicationId: string; claimed: ClaimedInvite };

	try {
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

			await tx.insert(applicationEvent).values({
				applicationId: row.id,
				type: 'submitted',
				toStatus: 'waitlisted',
				body: claimed
					? `Application submitted from an invite by ${claimed.inviterName ?? 'a volunteer'}`
					: 'Application submitted',
			});

			return { applicationId: row.id, claimed };
		});
	} catch (error) {
		// Deliberately not surfaced to the applicant: the upstream message can
		// name tables and columns, and there is nothing they could do with it.
		console.error('Membership application failed to save', error);
		return {
			is_error: true,
			message:
				'Something went wrong saving your application. Please try again, or email hello@virtualcoffee.io.',
		};
	}

	/**
	 * Persist first, notify second, per docs/adr/0005 — and outside the try above,
	 * so a Slack outage can never be reported to the applicant as a failure to
	 * save. An invited application jumps the queue, so a reviewer wants to know it
	 * arrived; the outcome is recorded as an event either way, which is what makes
	 * a silent notification visible in /admin.
	 */
	if (result.claimed) {
		const invited = result.claimed;
		const notified = await notifySlack(
			'membership',
			inviteClaimedMessage({
				inviteeName: parsed.data.name,
				inviteeEmail: parsed.data.email,
				inviterName: invited.inviterName,
			}),
		);

		try {
			await db()
				.insert(applicationEvent)
				.values({
					applicationId: result.applicationId,
					type: notified.ok ? 'notification_sent' : 'notification_failed',
					body: notified.ok
						? 'Slack notified of an invited application'
						: `Slack notification failed: ${notified.message}`,
				});
		} catch (error) {
			// The application is safe; only the audit line was lost.
			console.error('Failed to record an invite notification', error);
		}
	}

	redirect('/join/thank-you');
}
