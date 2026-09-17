'use server';

import { revalidatePath } from 'next/cache';

import type { SubmissionStatus } from '@/db';
import { isId } from '@/db/ids';
import type { ActionResult } from '@/lib/admin/actionResult';
import { checkNote } from '@/lib/admin/notes';
import { actorId, requirePermission } from '@/lib/access/adminAccess';
import type { Session } from '@/lib/access/auth';
import { recordEvent, transitionAndRecord } from '@/lib/history/eventLog';
import {
	getSubmission,
	isSubmissionKind,
	SUBMISSION_KINDS,
	submissionSubject,
	type SubmissionKind,
} from '@/lib/submissions/submissions';
import { STATUS_ORDER } from './presentation';

/**
 * Every action re-checks `manage` on the kind's own section rather than
 * trusting the route it was reached from — per ADR 0006, and because a server
 * action is reachable by anyone who can guess its id.
 */
async function authorise(
	kind: string,
): Promise<{ kind: SubmissionKind; session: Session } | null> {
	if (!isSubmissionKind(kind)) {
		return null;
	}

	const session = await requirePermission(
		SUBMISSION_KINDS[kind].section,
		'manage',
	);

	return { kind, session };
}

export async function setSubmissionStatus(
	kind: string,
	id: string,
	status: string,
): Promise<ActionResult> {
	const context = await authorise(kind);
	if (!context) return { ok: false, message: 'Unknown submission type.' };

	if (!STATUS_ORDER.includes(status as SubmissionStatus)) {
		return { ok: false, message: 'Unknown status.' };
	}

	const next = status as SubmissionStatus;

	if (!isId(id))
		return { ok: false, message: 'That submission no longer exists.' };

	const current = await getSubmission(context.kind, id);

	if (!current)
		return { ok: false, message: 'That submission no longer exists.' };
	if (current.status === next) return { ok: true };

	// Resolve the actor before the update, so a lookup failure cannot leave a
	// status change behind with no event recording who made it.
	const actor = await actorId(context.session.user.id);

	// `closedAt` records when it stopped needing attention, so reopening clears
	// it rather than leaving a date that is no longer true, and moving between
	// the two closed statuses keeps the original.
	const closed = next === 'resolved' || next === 'dismissed';

	// Conditional on the status still being what was read — see
	// transitionAndRecord() — so two maintainers cannot both write the change
	// and both record it from a stale status.
	const changed = await transitionAndRecord(
		submissionSubject(context.kind, id),
		current.status,
		{
			status: next,
			closedAt: closed ? (current.closedAt ?? new Date()) : null,
		},
		{
			type: 'status_changed',
			body: null,
			actorUserId: actor,
		},
	);
	if (!changed) {
		return {
			ok: false,
			message:
				'That submission changed while you were looking at it. Reload the page.',
		};
	}

	revalidatePath(`/admin/submissions/${context.kind}`);
	revalidatePath(`/admin/submissions/${context.kind}/${id}`);
	revalidatePath('/admin');

	return { ok: true };
}

export async function addSubmissionNote(
	kind: string,
	id: string,
	body: string,
): Promise<ActionResult> {
	const context = await authorise(kind);
	if (!context) return { ok: false, message: 'Unknown submission type.' };

	const note = checkNote(body);
	if (!note.ok) return note;
	// Looked up first: recordEvent() would otherwise throw on the foreign key
	// for a well-formed id that was deleted underneath the page.
	if (!isId(id) || !(await getSubmission(context.kind, id)))
		return { ok: false, message: 'That submission no longer exists.' };

	await recordEvent(submissionSubject(context.kind, id), {
		type: 'note',
		body: note.body,
		actorUserId: await actorId(context.session.user.id),
	});

	revalidatePath(`/admin/submissions/${context.kind}/${id}`);
	revalidatePath('/admin');

	return { ok: true };
}
