'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { db, type SubmissionStatus } from '@/db';
import { requirePermission } from '@/lib/adminAccess';
import type { Session } from '@/lib/auth';
import {
	isSubmissionKind,
	SUBMISSION_KINDS,
	type SubmissionKind,
} from '@/lib/submissions';
import { recordSubmissionEvent } from '@/lib/submitSubmission';

export type ActionResult = { ok: true } | { ok: false; message: string };

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

const VALID_STATUSES: SubmissionStatus[] = [
	'new',
	'in_progress',
	'resolved',
	'dismissed',
];

export async function setSubmissionStatus(
	kind: string,
	id: string,
	status: string,
): Promise<ActionResult> {
	const context = await authorise(kind);
	if (!context) return { ok: false, message: 'Unknown submission type.' };

	if (!VALID_STATUSES.includes(status as SubmissionStatus)) {
		return { ok: false, message: 'Unknown status.' };
	}

	const next = status as SubmissionStatus;
	const { table } = SUBMISSION_KINDS[context.kind];

	const [current] = await db()
		.select({ status: table.status })
		.from(table)
		.where(eq(table.id, id))
		.limit(1);

	if (!current)
		return { ok: false, message: 'That submission no longer exists.' };
	if (current.status === next) return { ok: true };

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
		actorUserId: actorId(context.session.user.id),
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

	await recordSubmissionEvent({
		kind: context.kind,
		submissionId: id,
		type: 'note',
		body: trimmed,
		actorUserId: actorId(context.session.user.id),
	});

	revalidatePath(`/admin/submissions/${context.kind}/${id}`);
	revalidatePath('/admin');

	return { ok: true };
}

/**
 * The local dev bypass has no row in `user`, so its id would break the foreign
 * key. Recording the event with no actor is the honest outcome there.
 */
function actorId(userId: string): string | null {
	return userId === 'dev-bypass' ? null : userId;
}
