'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import type { ActionResult, EmailActionResult } from '@/lib/admin/actionResult';
import { isId } from '@/db/ids';
import { volunteerInviteEmail } from '@/lib/email/templates';
import { sendEmail } from '@/lib/email/transport';
import {
	blockingInvite,
	giveBack,
	hashClaimToken,
	issueInvite,
	newClaimToken,
	type IssuedInvite,
} from '@/lib/volunteers/invites';
import { actorId } from '@/lib/access/adminAccess';
import { requireVolunteer } from '@/lib/access/volunteerAccess';
import { siteUrl } from '@/util/url.server';

const schema = z.object({
	name: z.string().trim().min(1, 'Please give their name.').max(200),
	email: z.email('That doesn’t look like an email address.').max(320),
});

/** A refusal where nothing was emailed — every `sendInvite` failure but the 'unknown' one. */
function fail(message: string): EmailActionResult {
	return { ok: false, message, emailSent: false };
}

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
		return fail(parsed.error.issues[0]?.message ?? 'Please check the form.');
	}
	const { name, email } = parsed.data;

	const blocking = await blockingInvite(email);
	if (blocking === 'invited') {
		return fail(
			`${name} already has an invite waiting at ${email}. Nothing has been sent and your invite is untouched.`,
		);
	}
	if (blocking === 'member') {
		return fail(
			`${name} is already a member of Virtual Coffee — no invite needed.`,
		);
	}
	if (blocking === 'in_progress') {
		return fail(
			`${name} already has an application in progress, so an invite would duplicate it. Nothing has been sent and your invite is untouched.`,
		);
	}

	const { token, expiresAt } = newClaimToken();

	let issued: IssuedInvite;
	try {
		issued = await issueInvite({
			inviter: {
				slackUserId,
				userId: actor,
				name: session.user.name || session.user.email,
			},
			invitee: { name, email },
			token: { hash: hashClaimToken(token), expiresAt },
		});
	} catch (error) {
		console.error('Failed to record an invite', { slackUserId, error });
		return fail('Something went wrong saving that invite. Please try again.');
	}

	if (!issued.ok) {
		if (issued.reason === 'no_volunteer') {
			return fail(
				'We haven’t finished setting you up as a volunteer. Ask a maintainer to add you in Admin → Volunteers.',
			);
		}
		if (issued.reason === 'no_balance') {
			return fail('You have no invites left. You get one more on the 1st.');
		}
		// Another Volunteer invited the same person between the pre-check above
		// and the write. The index is what makes that impossible to charge for.
		return fail(
			`${name} already has an invite waiting at ${email}. Nothing has been sent and your invite is untouched.`,
		);
	}

	const { inviteId } = issued;

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
			 * ninety-day expiry sweep, which gives back too — and while the ledger's
			 * refund index would refuse the second credit, an Invite nobody can ever
			 * claim has no business sitting in the Volunteer's list as "Sent".
			 */
			try {
				await giveBack({
					inviteId,
					reason: 'refund_cancelled',
					actorUserId: actor,
					body: `Send to ${email} failed: ${sent.message}`,
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
				return fail(
					`${sent.message} Nothing was emailed, but we couldn’t give the invite back automatically — cancel it from your list to get it back.`,
				);
			}

			revalidatePath('/invites');
			return fail(
				`${sent.message} Nothing was emailed and your invite has been given back — safe to try again.`,
			);
		}

		revalidatePath('/invites');
		return {
			ok: false,
			message: `${sent.message} We can’t confirm whether the email went out, so the invite is still spent. Check with ${email} before sending another, or you may invite them twice — a maintainer can give the invite back.`,
			emailSent: 'unknown',
		};
	}

	revalidatePath('/invites');
	return {
		ok: true,
		message: sent.warning
			? `Invite sent to ${email}. ${sent.warning}`
			: `Invite sent to ${email}.`,
	};
}

/**
 * Give an Invite back before anyone claims it.
 *
 * `inviter` scopes it to the caller — an id from someone else's list is not
 * theirs to cancel, and this is the only place that is enforced.
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

	const outcome = await giveBack({
		inviteId,
		reason: 'refund_cancelled',
		actorUserId: actor,
		body: 'Cancelled',
		inviter: slackUserId,
	});

	if (outcome === 'not_pending') {
		return {
			ok: false,
			message:
				'That invite can’t be cancelled — it may already have been used. Reload the page.',
		};
	}

	revalidatePath('/invites');
	// An imported Invite was never charged, so there is nothing to give back;
	// cancelling it is still the right outcome (docs/adr/0011).
	return outcome === 'given_back'
		? { ok: true, message: 'Invite cancelled and given back.' }
		: { ok: true, message: 'Invite cancelled.' };
}
