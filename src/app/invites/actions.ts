'use server';

import { and, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import {
	db,
	invite,
	volunteer,
	volunteerInviteLedger,
	type Transaction,
} from '@/db';
import type { ActionResult, EmailActionResult } from '@/lib/actionResult';
import { isUniqueViolation } from '@/db/errors';
import { isId } from '@/db/ids';
import { volunteerInviteEmail } from '@/lib/email/templates';
import { sendEmail } from '@/lib/email/transport';
import {
	blockingInvite,
	hashClaimToken,
	newClaimToken,
	volunteerBalance,
} from '@/lib/invites';
import { actorId } from '@/lib/adminAccess';
import { requireVolunteer } from '@/lib/volunteerAccess';
import { siteUrl } from '@/util/url.server';

const schema = z.object({
	name: z.string().trim().min(1, 'Please give their name.').max(200),
	email: z.email('That doesn’t look like an email address.').max(320),
});

/**
 * Send an Invite.
 *
 * The write has to come first: the Claim Link carries a token that must exist
 * in the database before the email can be composed. That inverts the
 * "send first, then write" rule the waitlist actions follow, so the failure
 * path compensates — on a send failure we know did not deliver, the Invite is
 * cancelled and the allowance refunded, and the Volunteer is told plainly that
 * nothing went out. On a failure we cannot be sure about, it stays charged and
 * they are told that instead; refunding there risks two invitations reaching
 * one person. See docs/adr/0011.
 */
export async function sendInvite(
	rawName: string,
	rawEmail: string,
): Promise<EmailActionResult> {
	const { session, slackUserId } = await requireVolunteer();
	const actor = await actorId(session.user.id);

	// Trimmed here too, not only in the form: the preview the Volunteer
	// confirmed showed the trimmed address, and `z.email()` would refuse a
	// pasted trailing space.
	const parsed = schema.safeParse({ name: rawName, email: rawEmail.trim() });
	if (!parsed.success) {
		return {
			ok: false,
			message: parsed.error.issues[0]?.message ?? 'Please check the form.',
			emailSent: false,
		};
	}
	const { name, email } = parsed.data;

	const blocking = await blockingInvite(email);
	if (blocking === 'invited') {
		return {
			ok: false,
			message: `${name} already has an invite waiting at ${email}. Nothing has been sent and your invite is untouched.`,
			emailSent: false,
		};
	}
	if (blocking === 'member') {
		return {
			ok: false,
			message: `${name} is already a member of Virtual Coffee — no invite needed.`,
			emailSent: false,
		};
	}
	if (blocking === 'in_progress') {
		return {
			ok: false,
			message: `${name} already has an application in progress, so an invite would duplicate it. Nothing has been sent and your invite is untouched.`,
			emailSent: false,
		};
	}

	const { token, expiresAt } = newClaimToken();

	let inviteId: string;
	try {
		inviteId = await db().transaction(async (tx) => {
			/**
			 * Lock the Volunteer's row before reading the balance. Two sends started
			 * at once would otherwise both read the same balance, both find it
			 * sufficient, and both spend it — the ledger's unique indexes stop an
			 * Invite being charged twice, but nothing stops two Invites being
			 * charged once each against one remaining allowance.
			 */
			const [held] = await tx
				.select({ id: volunteer.id })
				.from(volunteer)
				.where(eq(volunteer.slackUserId, slackUserId))
				.limit(1)
				.for('update');

			if (!held) throw new Error('NO_VOLUNTEER_ROW');

			if ((await volunteerBalance(slackUserId, tx)) < 1) {
				throw new Error('NO_BALANCE');
			}

			const [row] = await tx
				.insert(invite)
				.values({
					inviterUserId: actor,
					inviterName: session.user.name || session.user.email,
					inviterSlackUserId: slackUserId,
					inviteeName: name,
					inviteeEmail: email,
					status: 'pending',
					tokenHash: hashClaimToken(token),
					tokenExpiresAt: expiresAt,
				})
				.returning({ id: invite.id });

			await tx.insert(volunteerInviteLedger).values({
				slackUserId,
				delta: -1,
				reason: 'spend',
				inviteId: row.id,
				actorUserId: actor,
				body: `Invited ${name} <${email}>`,
			});

			return row.id;
		});
	} catch (error) {
		const reason = error instanceof Error ? error.message : '';

		if (reason === 'NO_VOLUNTEER_ROW') {
			return {
				ok: false,
				message:
					'We haven’t finished setting you up as a volunteer. Ask a maintainer to add you in Admin → Volunteers.',
				emailSent: false,
			};
		}
		if (reason === 'NO_BALANCE') {
			return {
				ok: false,
				message: 'You have no invites left. You get one more on the 1st.',
				emailSent: false,
			};
		}
		// Another Volunteer invited the same person between the check above and
		// this write. The index is what makes that impossible to charge for.
		if (isUniqueViolation(error, 'invite_pending_email_idx')) {
			return {
				ok: false,
				message: `${name} already has an invite waiting at ${email}. Nothing has been sent and your invite is untouched.`,
				emailSent: false,
			};
		}

		console.error('Failed to record an invite', { slackUserId, error });
		return {
			ok: false,
			message: 'Something went wrong saving that invite. Please try again.',
			emailSent: false,
		};
	}

	const template = volunteerInviteEmail(
		session.user.name || 'A Virtual Coffee volunteer',
		name,
		`${siteUrl()}/join?invite=${token}`,
	);

	const sent = await sendEmail({
		to: email,
		subject: template.subject,
		text: template.text,
	});

	if (!sent.ok) {
		if (sent.definitelyNotSent) {
			/**
			 * Cancel as well as refund. Leaving it `pending` would hand it to the
			 * ninety-day expiry sweep, which refunds too — and while the ledger's
			 * refund index would refuse the second credit, an Invite nobody can ever
			 * claim has no business sitting in the Volunteer's list as "Sent".
			 */
			try {
				await db().transaction(async (tx) => {
					await tx
						.update(invite)
						.set({ status: 'cancelled', tokenHash: null, tokenExpiresAt: null })
						.where(eq(invite.id, inviteId));

					await refund(
						tx,
						inviteId,
						slackUserId,
						actor,
						'refund_cancelled',
						`Send to ${email} failed: ${sent.message}`,
					);
				});
			} catch (error) {
				// The one fact the Volunteer needs is that nothing went out. The
				// Invite is still `pending` and charged, and Cancel on the list is
				// the same transaction again.
				console.error('Failed to give back an unsent invite', {
					inviteId,
					slackUserId,
					error,
				});
				revalidatePath('/invites');
				return {
					ok: false,
					message: `${sent.message} Nothing was emailed, but we couldn’t give the invite back automatically — cancel it from your list to get it back.`,
					emailSent: false,
				};
			}

			revalidatePath('/invites');
			return {
				ok: false,
				message: `${sent.message} Nothing was emailed and your invite has been given back — safe to try again.`,
				emailSent: false,
			};
		}

		revalidatePath('/invites');
		return {
			ok: false,
			message: `${sent.message} We can’t confirm whether the email went out, so the invite is still spent. Check with ${email} before sending another, or you may invite them twice — a maintainer can give the invite back.`,
			emailSent: 'unknown',
		};
	}

	revalidatePath('/invites');
	return { ok: true, message: `Invite sent to ${email}.` };
}

/**
 * Give an Invite back before anyone claims it.
 *
 * The status change is conditional on it still being `pending`, so two clicks
 * cannot produce two refunds even before the ledger's partial unique index on
 * invite_id over both refund reasons refuses the second row.
 */
export async function cancelInvite(inviteId: string): Promise<ActionResult> {
	const { session, slackUserId } = await requireVolunteer();
	const actor = await actorId(session.user.id);

	if (!isId(inviteId)) {
		return {
			ok: false,
			message: 'That invite no longer exists. Reload the page.',
		};
	}

	// The status change and the refund commit together: an Invite that is no
	// longer `pending` is invisible to the expiry sweep, so a refund that failed
	// after the flip would never be made good.
	const cancelled = await db().transaction(async (tx) => {
		const rows = await tx
			.update(invite)
			.set({ status: 'cancelled', tokenHash: null, tokenExpiresAt: null })
			.where(
				and(
					eq(invite.id, inviteId),
					// Scoped to the caller: an id from someone else's list is not theirs
					// to cancel, and this is the only place that is enforced.
					eq(invite.inviterSlackUserId, slackUserId),
					eq(invite.status, 'pending'),
				),
			)
			.returning({ id: invite.id });

		if (rows.length > 0) {
			await refund(
				tx,
				inviteId,
				slackUserId,
				actor,
				'refund_cancelled',
				'Cancelled',
			);
		}

		return rows.length > 0;
	});

	if (!cancelled) {
		return {
			ok: false,
			message:
				'That invite can’t be cancelled — it may already have been used. Reload the page.',
		};
	}

	revalidatePath('/invites');
	return { ok: true, message: 'Invite cancelled and given back.' };
}

/**
 * Append the compensating credit.
 *
 * `onConflictDoNothing` leans on `volunteer_invite_ledger_refund_idx`, the
 * partial unique index on invite_id where the reason is either refund: if a
 * refund for this Invite already exists — of either kind — the second one is
 * silently dropped rather than doubling the allowance.
 */
async function refund(
	tx: Transaction,
	inviteId: string,
	slackUserId: string,
	actorUserId: string | null,
	reason: 'refund_cancelled' | 'refund_expired',
	body: string,
): Promise<void> {
	await tx
		.insert(volunteerInviteLedger)
		.values({ slackUserId, delta: 1, reason, inviteId, actorUserId, body })
		.onConflictDoNothing();
}
