'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import {
	emailFailed,
	type ActionResult,
	type EmailActionResult,
} from '@/lib/admin/actionResult';
import { isId } from '@/db/ids';
import {
	blockingInvite,
	giveBack,
	issueAndSend,
} from '@/lib/volunteers/invites';
import { actorId } from '@/lib/access/adminAccess';
import { requireVolunteer } from '@/lib/access/volunteerAccess';

const schema = z.object({
	name: z.string().trim().min(1, 'Please give their name.').max(200),
	email: z.email('That doesn’t look like an email address.').max(320),
});

/** A refusal where nothing was emailed — every `sendInvite` failure but the 'unknown' one. */
function fail(message: string): EmailActionResult {
	return { ok: false, message, emailSent: false };
}

/** Send an Invite; `issueAndSend` owns the write-first send (docs/adr/0011). */
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

	const outcome = await issueAndSend({
		inviter: {
			slackUserId,
			userId: actor,
			name: session.user.name || session.user.email,
		},
		invitee: { name, email },
		inviterName: session.user.name,
	});

	if (outcome.kind !== 'refused' && outcome.kind !== 'failed') {
		revalidatePath('/invites');
	}

	switch (outcome.kind) {
		case 'failed':
			return fail('Something went wrong saving that invite. Please try again.');
		case 'refused':
			switch (outcome.reason) {
				case 'no_volunteer':
					return fail(
						'We haven’t finished setting you up as a volunteer. Ask a maintainer to add you in Admin → Volunteers.',
					);
				case 'no_balance':
					return fail('You have no invites left. You get one more on the 1st.');
				case 'already_invited':
					// Another Volunteer got there between the pre-check and the write.
					return fail(
						`${name} already has an invite waiting at ${email}. Nothing has been sent and your invite is untouched.`,
					);
			}
		case 'not_sent_given_back':
			return emailFailed({
				message: `${outcome.message} Nothing was emailed and your invite has been given back — safe to try again.`,
				definitelyNotSent: true,
			});
		case 'not_sent_give_back_failed':
			return emailFailed({
				message: `${outcome.message} Nothing was emailed, but we couldn’t give the invite back automatically — cancel it from your list to get it back.`,
				definitelyNotSent: true,
			});
		case 'maybe_sent':
			return emailFailed({
				message: `${outcome.message} We can’t confirm whether the email went out, so the invite is still spent. Check with ${email} before sending another, or you may invite them twice — a maintainer can give the invite back.`,
				definitelyNotSent: false,
			});
		case 'sent':
			return {
				ok: true,
				message: outcome.warning
					? `Invite sent to ${email}. ${outcome.warning}`
					: `Invite sent to ${email}.`,
			};
	}
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
