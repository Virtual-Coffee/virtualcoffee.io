'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import {
	applicationEvent,
	db,
	invite,
	membershipApplication,
	type ApplicationStatus,
} from '@/db';
import type { EmailActionResult } from '@/lib/actionResult';
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

	const now = new Date();
	await db()
		.update(membershipApplication)
		.set({ status: 'coffee_invited', coffeeInvitedAt: now })
		.where(eq(membershipApplication.id, applicationId));

	await recordEvent({
		applicationId,
		actorUserId: actor,
		type: 'coffee_invited',
		fromStatus: 'waitlisted',
		toStatus: 'coffee_invited',
		body: `Coffee invite emailed to ${application.email}`,
	});

	revalidateApplication(applicationId);
	return { ok: true };
}

export async function recordAttendance(
	applicationId: string,
): Promise<EmailActionResult> {
	const session = await requirePermission('waitlist', 'manage');
	const actor = await actorId(session.user.id);
	const application = await getApplication(applicationId);

	if (!application) {
		return { ok: false, message: 'Application not found.', emailSent: false };
	}
	// The panel only offers this from coffee_invited, but a server action is
	// reachable without the panel.
	if (application.status !== 'coffee_invited') {
		return {
			ok: false,
			message: `Can only record attendance after a Coffee invite, not from ${application.status}.`,
			emailSent: false,
		};
	}

	const now = new Date();
	await db()
		.update(membershipApplication)
		.set({ coffeeAttendedAt: now })
		.where(eq(membershipApplication.id, applicationId));

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
	await db()
		.update(membershipApplication)
		.set({
			status: 'member',
			approvedAt: now,
			coffeeAttendedAt: application.coffeeAttendedAt ?? now,
		})
		.where(eq(membershipApplication.id, applicationId));

	/**
	 * Close the loop on the Invite that produced this application, if there was
	 * one. `completed` is what tells the Volunteer their invite actually worked —
	 * it is the only status change they ever see that is not their own doing.
	 *
	 * After the status change rather than before, and not fatal: an application
	 * that has been approved and emailed must not be reported as a failure
	 * because a second row would not update.
	 */
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
	return { ok: true };
}

async function close(
	applicationId: string,
	status: Extract<ApplicationStatus, 'declined' | 'withdrawn'>,
	note: string | null,
): Promise<EmailActionResult> {
	const session = await requirePermission('waitlist', 'manage');
	const actor = await actorId(session.user.id);
	const application = await getApplication(applicationId);

	if (!application) {
		return { ok: false, message: 'Application not found.', emailSent: false };
	}
	// The panel hides these buttons for a member, but a server action is
	// reachable without the panel. Closing twice would also write a second
	// event over the first one's timestamp.
	if (application.status === 'member') {
		return {
			ok: false,
			message: 'A member cannot be declined or withdrawn.',
			emailSent: false,
		};
	}
	if (application.status === 'declined' || application.status === 'withdrawn') {
		return {
			ok: false,
			message: `Already ${application.status}.`,
			emailSent: false,
		};
	}

	await db()
		.update(membershipApplication)
		.set({ status, closedAt: new Date() })
		.where(eq(membershipApplication.id, applicationId));

	await recordEvent({
		applicationId,
		actorUserId: actor,
		type: status === 'declined' ? 'declined' : 'withdrawn',
		fromStatus: application.status,
		toStatus: status,
		body: note,
	});

	revalidateApplication(applicationId);
	return { ok: true };
}

export async function declineApplication(
	applicationId: string,
	note: string | null,
): Promise<EmailActionResult> {
	return close(applicationId, 'declined', note);
}

export async function withdrawApplication(
	applicationId: string,
): Promise<EmailActionResult> {
	return close(applicationId, 'withdrawn', null);
}

export async function addNote(
	applicationId: string,
	body: string,
): Promise<EmailActionResult> {
	const session = await requirePermission('waitlist', 'manage');
	const actor = await actorId(session.user.id);
	const application = await getApplication(applicationId);

	if (!application) {
		return { ok: false, message: 'Application not found.', emailSent: false };
	}

	const trimmed = body.trim();
	if (!trimmed) {
		return { ok: false, message: 'A note cannot be empty.', emailSent: false };
	}

	await recordEvent({
		applicationId,
		actorUserId: actor,
		type: 'note',
		body: trimmed,
	});

	revalidatePath(`/admin/waitlist/${applicationId}`);
	return { ok: true };
}
