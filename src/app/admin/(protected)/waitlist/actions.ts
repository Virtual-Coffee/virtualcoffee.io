'use server';

import { and, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import {
	applicationEvent,
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
import { createSlackInviteToken } from '@/lib/inviteTokens';
import { getApplication } from '@/lib/applications';
import { siteUrl } from '@/util/url.server';

async function recordEvent(input: {
	applicationId: string;
	actorUserId: string | null;
	type:
		| 'coffee_invited'
		| 'attendance_recorded'
		| 'approved'
		| 'declined'
		| 'withdrawn'
		| 'note'
		| 'email_sent'
		| 'email_failed';
	fromStatus?: ApplicationStatus | null;
	toStatus?: ApplicationStatus | null;
	body?: string | null;
}) {
	await db()
		.insert(applicationEvent)
		.values({
			applicationId: input.applicationId,
			actorUserId: input.actorUserId,
			type: input.type,
			fromStatus: input.fromStatus ?? null,
			toStatus: input.toStatus ?? null,
			body: input.body ?? null,
		});
}

/**
 * Move an application on from the status it was read at.
 *
 * Conditional on that status still being current, so two maintainers acting
 * on the same row within seconds cannot both write — the second finds no row
 * and is told to reload, instead of overwriting a decline or recording a
 * second event with a stale `fromStatus`. Same shape as `cancelInvite` and
 * the maintenance sweep's `expire()`.
 */
async function transition(
	applicationId: string,
	from: ApplicationStatus,
	patch: Partial<typeof membershipApplication.$inferInsert>,
): Promise<boolean> {
	const moved = await db()
		.update(membershipApplication)
		.set(patch)
		.where(
			and(
				eq(membershipApplication.id, applicationId),
				eq(membershipApplication.status, from),
			),
		)
		.returning({ id: membershipApplication.id });
	return moved.length > 0;
}

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
		await recordEvent({
			applicationId,
			actorUserId: actor,
			type: 'email_failed',
			body: `Coffee invite to ${application.email} failed: ${sent.message}`,
		});
		return {
			ok: false,
			message: sent.message,
			emailSent: sent.definitelyNotSent ? false : 'unknown',
		};
	}

	const moved = await transition(applicationId, 'waitlisted', {
		status: 'coffee_invited',
		coffeeInvitedAt: new Date(),
	});

	if (!moved) {
		// The email has gone regardless, so the history must say so.
		await recordEvent({
			applicationId,
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

	await recordEvent({
		applicationId,
		actorUserId: actor,
		type: 'coffee_invited',
		fromStatus: 'waitlisted',
		toStatus: 'coffee_invited',
		body: `Coffee invite emailed to ${application.email}`,
	});

	revalidateApplication(applicationId);
	return { ok: true, message: sent.warning };
}

export async function recordAttendance(
	applicationId: string,
): Promise<ActionResult> {
	const session = await requirePermission('waitlist', 'manage');
	const actor = await actorId(session.user.id);
	const application = await getApplication(applicationId);

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
	// guard alone lets a second click overwrite the date and write a second
	// event.
	if (application.coffeeAttendedAt) {
		return { ok: false, message: 'Attendance is already recorded.' };
	}

	const recorded = await transition(applicationId, 'coffee_invited', {
		coffeeAttendedAt: new Date(),
	});
	if (!recorded) {
		return { ok: false, message: changedUnderneath(application.name) };
	}

	await recordEvent({
		applicationId,
		actorUserId: actor,
		type: 'attendance_recorded',
		body: 'Attended a Coffee',
	});

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

	// The token has to exist before the email that carries it. An unsent token
	// is harmless: it is single-use and expires on its own.
	const { token } = await createSlackInviteToken(applicationId);
	const inviteUrl = `${siteUrl()}/join-slack?code=${token}`;

	const welcome = welcomeEmail(application.name);
	const welcomeSent = await sendEmail({
		to: application.email,
		subject: welcome.subject,
		text: welcome.text,
		cc: copyMe ? session.user.email : null,
	});

	if (!welcomeSent.ok) {
		await recordEvent({
			applicationId,
			actorUserId: actor,
			type: 'email_failed',
			body: `Welcome email to ${application.email} failed: ${welcomeSent.message}`,
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
		await recordEvent({
			applicationId,
			actorUserId: actor,
			type: 'email_failed',
			body: `Slack invite to ${application.email} failed: ${slackSent.message}`,
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
	const approved = await transition(applicationId, 'coffee_invited', {
		status: 'member',
		approvedAt: now,
		coffeeAttendedAt: application.coffeeAttendedAt ?? now,
	});

	if (!approved) {
		// Both emails have gone regardless, so the history must say so.
		await recordEvent({
			applicationId,
			actorUserId: actor,
			type: 'email_sent',
			body: `Welcome and Slack invite emailed to ${application.email}, but the application had already left Coffee invited`,
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

	await recordEvent({
		applicationId,
		actorUserId: actor,
		type: 'approved',
		fromStatus: 'coffee_invited',
		toStatus: 'member',
		body: `Membership approved; welcome and Slack invite emailed to ${application.email}`,
	});

	revalidateApplication(applicationId);
	return { ok: true, message: welcomeSent.warning ?? slackSent.warning };
}

/**
 * A fresh Slack invite for someone who is already a member: the first link
 * was consumed by a scanner, expired unread, or went to a spam folder. The
 * previous link stops working — minting the new token expires it — so a
 * link that went astray cannot be redeemed by whoever finds it. No status
 * changes, so the send-first rule has nothing to protect; the event is what
 * records that a second link is out.
 */
export async function resendSlackInvite(
	applicationId: string,
	copyMe: boolean,
): Promise<EmailActionResult> {
	const session = await requirePermission('waitlist', 'manage');
	const actor = await actorId(session.user.id);
	const application = await getApplication(applicationId);

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

	const { token } = await createSlackInviteToken(applicationId);
	const template = slackInviteEmail(
		application.name,
		`${siteUrl()}/join-slack?code=${token}`,
	);
	const sent = await sendEmail({
		to: application.email,
		subject: template.subject,
		text: template.text,
		cc: copyMe ? session.user.email : null,
	});

	if (!sent.ok) {
		await recordEvent({
			applicationId,
			actorUserId: actor,
			type: 'email_failed',
			body: `Slack invite re-send to ${application.email} failed: ${sent.message}`,
		});
		return {
			ok: false,
			message: sent.message,
			emailSent: sent.definitelyNotSent ? false : 'unknown',
		};
	}

	await recordEvent({
		applicationId,
		actorUserId: actor,
		type: 'email_sent',
		body: `Slack invite re-sent to ${application.email}`,
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

	const closed = await transition(applicationId, application.status, {
		status,
		closedAt: new Date(),
	});
	if (!closed) {
		return { ok: false, message: changedUnderneath(application.name) };
	}

	await recordEvent({
		applicationId,
		actorUserId: actor,
		type: status === 'declined' ? 'declined' : 'withdrawn',
		fromStatus: application.status,
		toStatus: status,
		body,
	});

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

	await recordEvent({
		applicationId,
		actorUserId: actor,
		type: 'note',
		body: note.body,
	});

	revalidatePath(`/admin/waitlist/${applicationId}`);
	return { ok: true };
}
