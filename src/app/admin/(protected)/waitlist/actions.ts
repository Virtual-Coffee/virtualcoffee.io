'use server';

import { eq, isNull } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import {
	db,
	invite,
	membershipApplication,
	type ApplicationStatus,
} from '@/db';
import {
	emailFailed,
	emailWentButRowMoved,
	type ActionResult,
	type EmailActionResult,
} from '@/lib/admin/actionResult';
import { checkNote } from '@/lib/admin/notes';
import { actorId, requirePermission } from '@/lib/access/adminAccess';
import type { Session } from '@/lib/access/auth';
import { sendEmail } from '@/lib/email/transport';
import { renderEmail, type RenderedEmail } from '@/lib/email/render';
import { coffeeInvite } from '@/emails/coffeeInvite';
import { slackInvite } from '@/emails/slackInvite';
import { welcome } from '@/emails/welcome';
import {
	createSlackInviteToken,
	expireSlackInviteToken,
	supersedeSlackInviteTokens,
} from '@/lib/waitlist/inviteTokens';
import {
	applicationSubject,
	getApplication,
} from '@/lib/waitlist/applications';
import {
	recordEvent,
	recordOutcome,
	transitionAndRecord,
	type ApplicationSubject,
	type TransitionEventInput,
} from '@/lib/history/eventLog';
import type { Outbound } from '@/lib/outbound';
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

type Opened =
	| {
			ok: true;
			session: Session;
			actor: string | null;
			application: NonNullable<Awaited<ReturnType<typeof getApplication>>>;
			subject: ApplicationSubject;
	  }
	| { ok: false; message: string; emailSent: false };

/**
 * What every action on an application does before it does its own work: the
 * permission check, the actor, the row, its Subject.
 *
 * Called from each action rather than once for the file on purpose — docs/adr
 * 0003 and 0006 put the check in the action itself, so a new action that
 * forgets to call this is refused rather than open to every role. The refusal
 * it returns is assignable to both `ActionResult` and `EmailActionResult`, so
 * an action can hand it straight back.
 */
async function open(applicationId: string): Promise<Opened> {
	const session = await requirePermission('waitlist', 'manage');
	const actor = await actorId(session.user.id);
	const application = await getApplication(applicationId);

	if (!application) {
		return { ok: false, message: 'Application not found.', emailSent: false };
	}

	return {
		ok: true,
		session,
		actor,
		application,
		subject: applicationSubject(applicationId),
	};
}

type OpenedOk = Extract<Opened, { ok: true }>;

/**
 * One email to the applicant, whose failure is History. `what` is how History
 * names the send — "Coffee invite" — and `rollback` kills anything minted to
 * go in it before the failure is reported.
 */
async function emailApplicant(
	opened: OpenedOk,
	copyMe: boolean,
	what: string,
	email: RenderedEmail,
	rollback?: () => Promise<unknown>,
): Promise<Outbound> {
	const { session, actor, application, subject } = opened;

	const sent = await sendEmail({
		to: application.email,
		...email,
		cc: copyMe ? session.user.email : null,
	});
	if (sent.ok) return sent;

	await rollback?.();
	await recordOutcome(subject, {
		channel: 'email',
		outbound: sent,
		what: `${what} to ${application.email}`,
		actorUserId: actor,
	});
	return sent;
}

/**
 * The status change that follows a send, and never precedes it: reversed, a
 * failed send leaves the applicant marked as invited with no email and the
 * maintainer no way to tell.
 *
 * Null means the row moved and the caller carries on. Otherwise the race was
 * lost — the email has gone regardless, so History says so and `rollback`
 * kills a link this request is no longer entitled to — and the caller hands
 * the answer back. A transition that throws instead is rolled back the same
 * way before the error propagates: the row did not move, so the emailed
 * link would admit someone who is not a member.
 */
async function transitionAfterSend(
	opened: OpenedOk,
	from: ApplicationStatus,
	patch: Partial<typeof membershipApplication.$inferInsert>,
	event: Omit<TransitionEventInput<ApplicationSubject>, 'actorUserId'>,
	stranded: string,
	rollback?: () => Promise<unknown>,
): Promise<EmailActionResult | null> {
	const { actor, application, subject } = opened;

	let moved: boolean;
	try {
		moved = await transitionAndRecord(subject, from, patch, {
			...event,
			actorUserId: actor,
		});
	} catch (error) {
		try {
			await rollback?.();
		} catch (rollbackError) {
			console.error('Failed to roll back after a transition threw', {
				applicationId: subject.id,
				error: rollbackError,
			});
		}
		throw error;
	}
	if (moved) return null;

	await rollback?.();
	await recordEvent(subject, {
		actorUserId: actor,
		type: 'email_sent',
		body: stranded,
	});
	revalidateApplication(subject.id);
	return emailWentButRowMoved(changedUnderneath(application.name));
}

export async function sendCoffeeInvite(
	applicationId: string,
	copyMe: boolean,
): Promise<EmailActionResult> {
	const opened = await open(applicationId);
	if (!opened.ok) return opened;
	const { application } = opened;

	if (application.status !== 'waitlisted') {
		return {
			ok: false,
			message: `Can only send a Coffee invite from Waitlisted, not ${application.status}.`,
			emailSent: false,
		};
	}

	const sent = await emailApplicant(
		opened,
		copyMe,
		'Coffee invite',
		await renderEmail(coffeeInvite, {}),
	);
	if (!sent.ok) return emailFailed(sent);

	const stranded = await transitionAfterSend(
		opened,
		'waitlisted',
		{ status: 'coffee_invited', coffeeInvitedAt: new Date() },
		{
			type: 'coffee_invited',
			body: `Coffee invite emailed to ${application.email}`,
		},
		`Coffee invite emailed to ${application.email}, but the application had already left Waitlisted`,
	);
	if (stranded) return stranded;

	revalidateApplication(applicationId);
	return { ok: true, message: sent.warning };
}

export async function recordAttendance(
	applicationId: string,
): Promise<ActionResult> {
	const opened = await open(applicationId);
	if (!opened.ok) return opened;
	const { actor, application, subject } = opened;

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
	const opened = await open(applicationId);
	if (!opened.ok) return opened;
	const { application } = opened;

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
	const expireToken = () => expireSlackInviteToken(tokenId, new Date());

	const welcomeSent = await emailApplicant(
		opened,
		copyMe,
		'Welcome email',
		await renderEmail(welcome, { name: application.name }),
		expireToken,
	);
	if (!welcomeSent.ok) return emailFailed(welcomeSent);

	const slackSent = await emailApplicant(
		opened,
		copyMe,
		'Slack invite',
		await renderEmail(slackInvite, {
			name: application.name,
			inviteUrl: `${siteUrl()}/join-slack?code=${token}`,
		}),
		expireToken,
	);
	if (!slackSent.ok) {
		// The welcome email has already gone out, so this is not a clean retry:
		// say so rather than implying nothing happened.
		return {
			ok: false,
			message: `The welcome email was sent, but the Slack invite was not: ${slackSent.message} ${application.name} has not been made a member — approving again will re-send both emails.`,
			emailSent: true,
		};
	}

	const now = new Date();
	const stranded = await transitionAfterSend(
		opened,
		'coffee_invited',
		{
			status: 'member',
			approvedAt: now,
			coffeeAttendedAt: application.coffeeAttendedAt ?? now,
		},
		{
			type: 'approved',
			body: `Membership approved; welcome and Slack invite emailed to ${application.email}`,
		},
		`Welcome and Slack invite emailed to ${application.email}, but the application had already left Coffee invited; the Slack link has been invalidated`,
		expireToken,
	);
	if (stranded) return stranded;

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
	const opened = await open(applicationId);
	if (!opened.ok) return opened;
	const { actor, application, subject } = opened;

	if (application.status !== 'member') {
		return {
			ok: false,
			message: `Only a member can be sent another Slack invite, not ${application.status}. Approving sends the first one.`,
			emailSent: false,
		};
	}

	const minted = await createSlackInviteToken(applicationId);
	const sent = await emailApplicant(
		opened,
		copyMe,
		'Slack invite re-send',
		await renderEmail(slackInvite, {
			name: application.name,
			inviteUrl: `${siteUrl()}/join-slack?code=${minted.token}`,
		}),
		// Only this request's link: the previous one is still the one the
		// member holds.
		() => expireSlackInviteToken(minted.id, new Date()),
	);
	if (!sent.ok) return emailFailed(sent);

	// The email has gone, so a supersession that fails is not an error page:
	// the send is recorded either way, and History says the old link is still
	// live so a maintainer can re-send once more to retire it.
	let what = `Slack invite re-sent to ${application.email}`;
	try {
		await supersedeSlackInviteTokens(applicationId, minted, new Date());
	} catch (error) {
		console.error('Failed to supersede the previous Slack invite links', {
			applicationId,
			error,
		});
		what += ' — the previous link is still live';
	}
	await recordOutcome(subject, {
		channel: 'email',
		outbound: sent,
		what,
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
	const opened = await open(applicationId);
	if (!opened.ok) return opened;
	const { actor, application, subject } = opened;

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
		subject,
		application.status,
		{ status, closedAt: new Date() },
		{
			actorUserId: actor,
			type: status === 'declined' ? 'declined' : 'withdrawn',
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
	const opened = await open(applicationId);
	if (!opened.ok) return opened;
	const { actor, subject } = opened;

	const note = checkNote(body);
	if (!note.ok) return note;

	await recordEvent(subject, {
		actorUserId: actor,
		type: 'note',
		body: note.body,
	});

	revalidatePath(`/admin/waitlist/${applicationId}`);
	return { ok: true };
}
