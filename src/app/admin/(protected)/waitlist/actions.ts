'use server';

import { revalidatePath } from 'next/cache';

import {
	emailFailed,
	emailWentButRowMoved,
	type ActionResult,
	type EmailActionResult,
} from '@/lib/admin/actionResult';
import { checkNote } from '@/lib/admin/notes';
import { actorId, requirePermission } from '@/lib/access/adminAccess';
import {
	applicationSubject,
	getApplication,
} from '@/lib/waitlist/applications';
import { recordEvent } from '@/lib/history/eventLog';
import {
	approve,
	close,
	coffeeInviteApplicant,
	recordAttendance as recordAttendanceFor,
	release,
	resendSlackInvite as resendSlackInviteTo,
	type Actor,
	type Outcome,
} from '@/lib/waitlist/lifecycle';

function changedUnderneath(name: string): string {
	return `${name}’s application changed while you were looking at it. Reload the page to see where it is now.`;
}

/**
 * A status change moves an application between the list views — off the
 * queue and into the archive, out of quarantine, or back — so all of them have
 * to be revalidated, or one keeps showing a row that now belongs to another.
 */
function revalidateApplication(applicationId: string) {
	revalidatePath('/admin/waitlist');
	revalidatePath('/admin/waitlist/archive');
	revalidatePath('/admin/waitlist/suspected-spam');
	revalidatePath(`/admin/waitlist/${applicationId}`);
}

/**
 * What every action on an application does before it does its own work: the
 * permission check and the actor.
 *
 * Called from each action rather than once for the file on purpose — docs/adr
 * 0003 and 0006 put the check in the action itself, so a new action that
 * forgets to call this is refused rather than open to every role.
 */
async function manage(): Promise<Actor> {
	const session = await requirePermission('waitlist', 'manage');
	return {
		userId: await actorId(session.user.id),
		email: session.user.email,
	};
}

const NOT_FOUND = 'Application not found.';

/**
 * The outcomes every email action shares, as the answer the panel renders.
 * `done` and the action's own refusals are for the caller to place.
 */
function emailRefusal(
	outcome: Extract<
		Outcome,
		{ kind: 'not-found' | 'email-failed' | 'stranded' }
	>,
): EmailActionResult {
	switch (outcome.kind) {
		case 'not-found':
			return { ok: false, message: NOT_FOUND, emailSent: false };
		case 'email-failed':
			return emailFailed(outcome.outbound);
		case 'stranded':
			return emailWentButRowMoved(changedUnderneath(outcome.name));
	}
}

export async function sendCoffeeInvite(
	applicationId: string,
	copyMe: boolean,
): Promise<EmailActionResult> {
	const actor = await manage();
	const outcome = await coffeeInviteApplicant(applicationId, actor, { copyMe });

	if (outcome.kind === 'wrong-status') {
		return {
			ok: false,
			message: `Can only send a Coffee invite from Waitlisted, not ${outcome.status}.`,
			emailSent: false,
		};
	}
	if (outcome.kind === 'stranded') revalidateApplication(applicationId);
	if (outcome.kind !== 'done') return emailRefusal(outcome);

	revalidateApplication(applicationId);
	return { ok: true, message: outcome.warning };
}

export async function recordAttendance(
	applicationId: string,
): Promise<ActionResult> {
	const actor = await manage();
	const outcome = await recordAttendanceFor(applicationId, actor);

	switch (outcome.kind) {
		case 'done':
			revalidatePath(`/admin/waitlist/${applicationId}`);
			return { ok: true };
		case 'not-found':
			return { ok: false, message: NOT_FOUND };
		case 'wrong-status':
			return {
				ok: false,
				message: `Can only record attendance after a Coffee invite, not from ${outcome.status}.`,
			};
		case 'already-recorded':
			return { ok: false, message: 'Attendance is already recorded.' };
		case 'changed':
			return { ok: false, message: changedUnderneath(outcome.name) };
	}
}

export async function approveMembership(
	applicationId: string,
	copyMe: boolean,
): Promise<EmailActionResult> {
	const actor = await manage();
	const outcome = await approve(applicationId, actor, { copyMe });

	if (outcome.kind === 'wrong-status') {
		return {
			ok: false,
			message: `Can only approve membership from Coffee invited, not ${outcome.status}.`,
			emailSent: false,
		};
	}
	if (outcome.kind === 'stranded') revalidateApplication(applicationId);
	if (outcome.kind !== 'done') return emailRefusal(outcome);

	revalidateApplication(applicationId);
	return { ok: true, message: outcome.warning };
}

export async function resendSlackInvite(
	applicationId: string,
	copyMe: boolean,
): Promise<EmailActionResult> {
	const actor = await manage();
	const outcome = await resendSlackInviteTo(applicationId, actor, { copyMe });

	if (outcome.kind === 'wrong-status') {
		return {
			ok: false,
			message: `Only a member can be sent another Slack invite, not ${outcome.status}. Approving sends the first one.`,
			emailSent: false,
		};
	}
	if (outcome.kind !== 'done') return emailRefusal(outcome);

	revalidatePath(`/admin/waitlist/${applicationId}`);
	return { ok: true, message: outcome.warning };
}

async function closeApplication(
	applicationId: string,
	status: 'declined' | 'withdrawn',
	note: string | null,
): Promise<ActionResult> {
	const actor = await manage();
	const outcome = await close(applicationId, actor, { status, note });

	switch (outcome.kind) {
		case 'done':
			revalidateApplication(applicationId);
			return { ok: true };
		case 'not-found':
			return { ok: false, message: NOT_FOUND };
		case 'wrong-status':
			return {
				ok: false,
				message:
					outcome.status === 'member'
						? 'A member cannot be declined or withdrawn.'
						: outcome.status === 'declined' || outcome.status === 'withdrawn'
							? `Already ${outcome.status}.`
							: `Cannot be declined or withdrawn from ${outcome.status}.`,
			};
		case 'invalid-note':
			return { ok: false, message: outcome.message };
		case 'changed':
			return { ok: false, message: changedUnderneath(outcome.name) };
	}
}

export async function releaseApplication(
	applicationId: string,
): Promise<ActionResult> {
	const actor = await manage();
	const outcome = await release(applicationId, actor);

	switch (outcome.kind) {
		case 'done':
			revalidateApplication(applicationId);
			return { ok: true };
		case 'not-found':
			return { ok: false, message: NOT_FOUND };
		case 'wrong-status':
			return {
				ok: false,
				message: `Only a suspected-spam application can be released, not ${outcome.status}.`,
			};
		case 'changed':
			return { ok: false, message: changedUnderneath(outcome.name) };
		case 'already-active':
			return {
				ok: false,
				message: `${outcome.name}’s email already has a live application. Decline this one instead.`,
			};
	}
}

export async function declineApplication(
	applicationId: string,
	note: string | null,
): Promise<ActionResult> {
	return closeApplication(applicationId, 'declined', note);
}

export async function withdrawApplication(
	applicationId: string,
	note: string | null,
): Promise<ActionResult> {
	return closeApplication(applicationId, 'withdrawn', note);
}

export async function addNote(
	applicationId: string,
	body: string,
): Promise<ActionResult> {
	const actor = await manage();
	if (!(await getApplication(applicationId))) {
		return { ok: false, message: NOT_FOUND };
	}

	const note = checkNote(body);
	if (!note.ok) return note;

	await recordEvent(applicationSubject(applicationId), {
		actorUserId: actor.userId,
		type: 'note',
		body: note.body,
	});

	revalidatePath(`/admin/waitlist/${applicationId}`);
	return { ok: true };
}
