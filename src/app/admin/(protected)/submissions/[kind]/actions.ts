'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { db, type SubmissionStatus } from '@/db';
import { isId } from '@/db/ids';
import type { ActionResult } from '@/lib/actionResult';
import { actorId, requirePermission } from '@/lib/adminAccess';
import type { Session } from '@/lib/auth';
import {
	getSubmission,
	isSubmissionKind,
	SUBMISSION_KINDS,
	type SubmissionKind,
} from '@/lib/submissions';
import { recordSubmissionEvent } from '@/lib/submitSubmission';
import { STATUS_ORDER } from './presentation';

/**
 * Every action re-checks `manage` on the kind's own section rather than
 * trusting the route it was reached from — per ADR 0003, and because a server
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
	const { table } = SUBMISSION_KINDS[context.kind];

	if (!isId(id))
		return { ok: false, message: 'That submission no longer exists.' };

	const [current] = await db()
		.select({ status: table.status })
		.from(table)
		.where(eq(table.id, id))
		.limit(1);

	if (!current)
		return { ok: false, message: 'That submission no longer exists.' };
	if (current.status === next) return { ok: true };

	// Resolve the actor before the update, so a lookup failure cannot leave a
	// status change behind with no event recording who made it.
	const actor = await actorId(context.session.user.id);

	// `closedAt` records when it stopped needing attention, so reopening clears
	// it rather than leaving a date that is no longer true.
	const closed = next === 'resolved' || next === 'dismissed';

	await db()
		.update(table)
		.set({ status: next, closedAt: closed ? new Date() : null })
		.where(eq(table.id, id));

	await recordSubmissionEvent({
		kind: context.kind,
		submissionId: id,
		type: 'status_changed',
		body: null,
		actorUserId: actor,
		fromStatus: current.status,
		toStatus: next,
	});

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

	const trimmed = body.trim();
	if (!trimmed) return { ok: false, message: 'A note needs some text.' };
	// Looked up first: recordSubmissionEvent() would otherwise throw on the
	// foreign key for a well-formed id that was deleted underneath the page.
	if (!isId(id) || !(await getSubmission(context.kind, id)))
		return { ok: false, message: 'That submission no longer exists.' };

	await recordSubmissionEvent({
		kind: context.kind,
		submissionId: id,
		type: 'note',
		body: trimmed,
		actorUserId: await actorId(context.session.user.id),
	});

	revalidatePath(`/admin/submissions/${context.kind}/${id}`);
	revalidatePath('/admin');

	return { ok: true };
}
