'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

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
import { nextState, STATUS_ORDER } from '@/lib/submissions/status';

const statusSchema = z.enum(STATUS_ORDER);

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

	const parsed = statusSchema.safeParse(status);
	if (!parsed.success) return { ok: false, message: 'Unknown status.' };
	const next = parsed.data;

	const current = await getSubmission(context.kind, id);

	if (!current)
		return { ok: false, message: 'That submission no longer exists.' };
	if (current.status === next) return { ok: true };

	// Resolve the actor before the update, so a lookup failure cannot leave a
	// status change behind with no event recording who made it.
	const actor = await actorId(context.session.user.id);

	// Conditional on the status still being what was read — see
	// transitionAndRecord() — so two maintainers cannot both write the change
	// and both record it from a stale status.
	const changed = await transitionAndRecord(
		submissionSubject(context.kind, id),
		current.status,
		nextState(current, next),
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
	if (!(await getSubmission(context.kind, id)))
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
