'use server';

import { eq, isNull } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import {
	db,
	invite,
	membershipApplication,
	type ApplicationStatus,
} from '@/db';
import type { ActionResult, EmailActionResult } from '@/lib/actionResult';
import { checkNote } from '@/lib/notes';
import { actorId, requirePermission } from '@/lib/adminAccess';
import { sendEmail } from '@/lib/email/transport';
import {
	coffeeInviteEmail,
	slackInviteEmail,
	welcomeEmail,
} from '@/lib/email/templates';
import {
	createSlackInviteToken,
	expireSlackInviteToken,
	supersedeSlackInviteTokens,
} from '@/lib/inviteTokens';
import { getApplication } from '@/lib/applications';
import {
	recordEvent,
	recordOutcome,
	transitionAndRecord,
} from '@/lib/eventLog';
import { siteUrl } from '@/util/url.server';

function changedUnderneath(name: string): string {
	return `${name}’s application changed while you were looking at it. Reload the page to see where it is now.`;
}

/**
 * A status change moves an application between the two list views — off the
 * queue and into the archive, or back — so both have to be revalidated, or one
 * of them keeps showing a row that now belongs to the other.
 */
function revalidateApplication(applicationId: string) {
	revalidatePath('/admin/waitlist');
	revalidatePath('/admin/waitlist/archive');
	revalidatePath(`/admin/waitlist/${applicationId}`);
}

export async function sendCoffeeInvite(
	applicationId: string,
	copyMe: boolean,
): Promise<EmailActionResult> {
	const session = await requirePermission('waitlist', 'manage');
	const actor = await actorId(session.user.id);
	const application = await getApplication(applicationId);
	const subject = { kind: 'application', id: applicationId } as const;

	if (!application) {
		return { ok: false, message: 'Application not found.', emailSent: false };
	}
	if (application.status !== 'waitlisted') {
		return {
			ok: false,
			message: `Can only send a Coffee invite from Waitlisted, not ${application.status}.`,
			emailSent: false,
		};
	}

	const template = coffeeInviteEmail(application.name);

	// Send BEFORE the status change. If this is reversed, a failed send leaves
	// the applicant marked as invited with no email, and the maintainer has no
	// way to tell.
	const sent = await sendEmail({
		to: application.email,
		subject: template.subject,
		text: template.text,
		cc: copyMe ? session.user.email : null,
	});

	if (!sent.ok) {
		await recordOutcome(subject, {
			channel: 'email',
			outbound: sent,
			what: `Coffee invite to ${application.email}`,
			actorUserId: actor,
		});
		return {
			ok: false,
			message: sent.message,
			emailSent: sent.definitelyNotSent ? false : 'unknown',
		};
	}

	const moved = await transitionAndRecord(
		subject,
		'waitlisted',
		{ status: 'coffee_invited', coffeeInvitedAt: new Date() },
		{
			actorUserId: actor,
			type: 'coffee_invited',
			fromStatus: 'waitlisted',
			toStatus: 'coffee_invited',
			body: `Coffee invite emailed to ${application.email}`,
		},
	);

	if (!moved) {
		// The email has gone regardless, so the history must say so.
		await recordEvent(subject, {
			actorUserId: actor,
			type: 'email_sent',
			body: `Coffee invite emailed to ${application.email}, but the application had already left Waitlisted`,
		});
		revalidateApplication(applicationId);
		return {
			ok: false,
			message: changedUnderneath(application.name),
			emailSent: true,
		};
	}

	revalidateApplication(applicationId);
	return { ok: true, message: sent.warning };
}

export async function recordAttendance(
	applicationId: string,
): Promise<ActionResult> {
	const session = await requirePermission('waitlist', 'manage');
	const actor = await actorId(session.user.id);
	const application = await getApplication(applicationId);
	const subject = { kind: 'application', id: applicationId } as const;

	if (!application) {
		return { ok: false, message: 'Application not found.' };
	}
	// The panel only offers this from coffee_invited, but a server action is
	// reachable without the panel.
	if (application.status !== 'coffee_invited') {
		return {
			ok: false,
			message: `Can only record attendance after a Coffee invite, not from ${application.status}.`,
		};
	}
	// The status does not change when attendance is recorded, so the status
	// fence alone lets two clicks both overwrite the date and each write an
	// event. The write itself requires the date to still be unset; a read
	// beforehand would let two requests both pass it.
	const recorded = await transitionAndRecord(
		subject,
		'coffee_invited',
		{ coffeeAttendedAt: new Date() },
		{
			actorUserId: actor,
			type: 'attendance_recorded',
			body: 'Attended a Coffee',
		},
		isNull(membershipApplication.coffeeAttendedAt),
	);
	if (!recorded) {
		const current = await getApplication(applicationId);
		if (current?.coffeeAttendedAt) {
			return { ok: false, message: 'Attendance is already recorded.' };
		}
		return { ok: false, message: changedUnderneath(application.name) };
	}

	revalidatePath(`/admin/waitlist/${applicationId}`);
	return { ok: true };
}

export async function approveMembership(
	applicationId: string,
	copyMe: boolean,
): Promise<EmailActionResult> {
	const session = await requirePermission('waitlist', 'manage');
	const actor = await actorId(session.user.id);
	const application = await getApplication(applicationId);
	const subject = { kind: 'application', id: applicationId } as const;

	if (!application) {
		return { ok: false, message: 'Application not found.', emailSent: false };
	}
	if (application.status !== 'coffee_invited') {
		return {
			ok: false,
			message: `Can only approve membership from Coffee invited, not ${application.status}.`,
			emailSent: false,
		};
	}

	// The token has to exist before the email that carries it, so every exit
	// below that does not make a member expires it: a timed-out send may still
	// have delivered a working link, and /join-slack checks only the token.
	// Another approval may be racing this one, and its link must survive if
	// it wins. The loser expires its own.
	const { id: tokenId, token } = await createSlackInviteToken(applicationId);
	const inviteUrl = `${siteUrl()}/join-slack?code=${token}`;

	const welcome = welcomeEmail(application.name);
	const welcomeSent = await sendEmail({
		to: application.email,
		subject: welcome.subject,
		text: welcome.text,
		cc: copyMe ? session.user.email : null,
	});

	if (!welcomeSent.ok) {
		await expireSlackInviteToken(tokenId, new Date());
		await recordOutcome(subject, {
			channel: 'email',
			outbound: welcomeSent,
			what: `Welcome email to ${application.email}`,
			actorUserId: actor,
		});
		return {
			ok: false,
			message: welcomeSent.message,
			emailSent: welcomeSent.definitelyNotSent ? false : 'unknown',
		};
	}

	const slack = slackInviteEmail(application.name, inviteUrl);
	const slackSent = await sendEmail({
		to: application.email,
		subject: slack.subject,
		text: slack.text,
		cc: copyMe ? session.user.email : null,
	});

	if (!slackSent.ok) {
		// A timeout may have delivered the link anyway; kill it before saying so.
		await expireSlackInviteToken(tokenId, new Date());
		await recordOutcome(subject, {
			channel: 'email',
			outbound: slackSent,
			what: `Slack invite to ${application.email}`,
			actorUserId: actor,
		});
		// The welcome email has already gone out, so this is not a clean retry:
		// say so rather than implying nothing happened.
		return {
			ok: false,
			message: `The welcome email was sent, but the Slack invite was not: ${slackSent.message} ${application.name} has not been made a member — approving again will re-send both emails.`,
			emailSent: true,
		};
	}

	const now = new Date();
	const approved = await transitionAndRecord(
		subject,
		'coffee_invited',
		{
			status: 'member',
			approvedAt: now,
			coffeeAttendedAt: application.coffeeAttendedAt ?? now,
		},
		{
			actorUserId: actor,
			type: 'approved',
			fromStatus: 'coffee_invited',
			toStatus: 'member',
			body: `Membership approved; welcome and Slack invite emailed to ${application.email}`,
		},
	);

	if (!approved) {
		// Both emails have gone regardless, so the history must say so — and the
		// Slack link in one of them must stop working, since this request is not
		// making anyone a member. Only this request's link: if the race was lost
		// to another approval, that one's link is the member's way in.
		await expireSlackInviteToken(tokenId, new Date());
		await recordEvent(subject, {
			actorUserId: actor,
			type: 'email_sent',
			body: `Welcome and Slack invite emailed to ${application.email}, but the application had already left Coffee invited; the Slack link has been invalidated`,
		});
		revalidateApplication(applicationId);
		return {
			ok: false,
			message: changedUnderneath(application.name),
			emailSent: true,
		};
	}

	// Complete the Invite that produced this application, if any. After the
	// status change and not fatal: the applicant has already been approved and
	// emailed.
	if (application.inviteId) {
		try {
			await db()
				.update(invite)
				.set({ status: 'completed' })
				.where(eq(invite.id, application.inviteId));
		} catch (error) {
			console.error('Failed to complete an invite', {
				applicationId,
				error,
			});
		}
	}

	revalidateApplication(applicationId);
	return { ok: true, message: welcomeSent.warning ?? slackSent.warning };
}

/**
 * A fresh Slack invite for someone who is already a member: the first link
 * was consumed by a scanner, expired unread, or went to a spam folder. Once
 * the new link has gone the previous one stops working, so a link that went
 * astray cannot be redeemed by whoever finds it — but only once it has gone:
 * superseding before the send would leave a member whose re-send failed with
 * no working link at all. No status changes, so the send-first rule has
 * nothing to protect; the event is what records that a second link is out.
 */
export async function resendSlackInvite(
	applicationId: string,
	copyMe: boolean,
): Promise<EmailActionResult> {
	const session = await requirePermission('waitlist', 'manage');
	const actor = await actorId(session.user.id);
	const application = await getApplication(applicationId);
	const subject = { kind: 'application', id: applicationId } as const;

	if (!application) {
		return { ok: false, message: 'Application not found.', emailSent: false };
	}
	if (application.status !== 'member') {
		return {
			ok: false,
			message: `Only a member can be sent another Slack invite, not ${application.status}. Approving sends the first one.`,
			emailSent: false,
		};
	}

	const minted = await createSlackInviteToken(applicationId);
	const template = slackInviteEmail(
		application.name,
		`${siteUrl()}/join-slack?code=${minted.token}`,
	);
	const sent = await sendEmail({
		to: application.email,
		subject: template.subject,
		text: template.text,
		cc: copyMe ? session.user.email : null,
	});

	if (!sent.ok) {
		// A timeout may have delivered the new link anyway; kill it, and only
		// it — the previous link is still the one the member holds.
		await expireSlackInviteToken(minted.id, new Date());
		await recordOutcome(subject, {
			channel: 'email',
			outbound: sent,
			what: `Slack invite re-send to ${application.email}`,
			actorUserId: actor,
		});
		return {
			ok: false,
			message: sent.message,
			emailSent: sent.definitelyNotSent ? false : 'unknown',
		};
	}

	await supersedeSlackInviteTokens(applicationId, minted, new Date());
	await recordOutcome(subject, {
		channel: 'email',
		outbound: sent,
		what: `Slack invite re-sent to ${application.email}`,
		actorUserId: actor,
	});

	revalidatePath(`/admin/waitlist/${applicationId}`);
	return { ok: true, message: sent.warning };
}

async function close(
	applicationId: string,
	status: Extract<ApplicationStatus, 'declined' | 'withdrawn'>,
	note: string | null,
): Promise<ActionResult> {
	const session = await requirePermission('waitlist', 'manage');
	const actor = await actorId(session.user.id);
	const application = await getApplication(applicationId);

	if (!application) {
		return { ok: false, message: 'Application not found.' };
	}
	// The panel hides these buttons for a member, but a server action is
	// reachable without the panel. Closing twice would also write a second
	// event over the first one's timestamp.
	if (application.status === 'member') {
		return {
			ok: false,
			message: 'A member cannot be declined or withdrawn.',
		};
	}
	if (application.status === 'declined' || application.status === 'withdrawn') {
		return {
			ok: false,
			message: `Already ${application.status}.`,
		};
	}

	// The note is optional, but one that is given is held to the same rules
	// as a History note — checked before the status changes, so an over-long
	// reason is refused rather than closing the application without it.
	let body: string | null = null;
	if (note?.trim()) {
		const checked = checkNote(note);
		if (!checked.ok) return checked;
		body = checked.body;
	}

	const closed = await transitionAndRecord(
		{ kind: 'application', id: applicationId },
		application.status,
		{ status, closedAt: new Date() },
		{
			actorUserId: actor,
			type: status === 'declined' ? 'declined' : 'withdrawn',
			fromStatus: application.status,
			toStatus: status,
			body,
		},
	);
	if (!closed) {
		return { ok: false, message: changedUnderneath(application.name) };
	}

	revalidateApplication(applicationId);
	return { ok: true };
}

export async function declineApplication(
	applicationId: string,
	note: string | null,
): Promise<ActionResult> {
	return close(applicationId, 'declined', note);
}

export async function withdrawApplication(
	applicationId: string,
	note: string | null,
): Promise<ActionResult> {
	return close(applicationId, 'withdrawn', note);
}

export async function addNote(
	applicationId: string,
	body: string,
): Promise<ActionResult> {
	const session = await requirePermission('waitlist', 'manage');
	const actor = await actorId(session.user.id);
	const application = await getApplication(applicationId);

	if (!application) {
		return { ok: false, message: 'Application not found.' };
	}

	const note = checkNote(body);
	if (!note.ok) return note;

	await recordEvent(
		{ kind: 'application', id: applicationId },
		{ actorUserId: actor, type: 'note', body: note.body },
	);

	revalidatePath(`/admin/waitlist/${applicationId}`);
	return { ok: true };
}
