import {
	db,
	submissionEvent,
	type SubmissionEventType,
	type SubmissionStatus,
} from '@/db';
import {
	SUBMISSION_KINDS,
	type SubmissionEventKey,
	type SubmissionKind,
} from '@/lib/submissions';
import type { NotifyResult } from '@/lib/slack/notify';
import type { FormState } from '@/util/forms/types';

/**
 * The event-writing half of a Submission, shared by all four forms. Which
 * foreign key to set is the only thing that varies; the wrong one trips the
 * `submission_event_exactly_one_subject` CHECK rather than writing a bad row.
 */
function subjectColumn(
	kind: SubmissionKind,
	id: string,
): Partial<Record<SubmissionEventKey, string>> {
	return { [SUBMISSION_KINDS[kind].eventKey]: id };
}

export async function recordSubmissionEvent(input: {
	kind: SubmissionKind;
	submissionId: string;
	type: SubmissionEventType;
	body?: string | null;
	actorUserId?: string | null;
	fromStatus?: SubmissionStatus | null;
	toStatus?: SubmissionStatus | null;
}) {
	await db()
		.insert(submissionEvent)
		.values({
			...subjectColumn(input.kind, input.submissionId),
			type: input.type,
			body: input.body ?? null,
			actorUserId: input.actorUserId ?? null,
			fromStatus: input.fromStatus ?? null,
			toStatus: input.toStatus ?? null,
		});
}

/**
 * The write half of a Submission: insert the row, log `submitted`, and turn a
 * failure into the form state to hand back. Persist first, notify second —
 * see docs/adr/0005 — so the caller only reaches `notifyAndRecord()` with an
 * id that is already committed.
 *
 * The upstream error is deliberately not surfaced: its message can name
 * tables and columns, and there is nothing the submitter could do with it.
 */
export async function persistSubmission(
	kind: SubmissionKind,
	insertRow: () => Promise<{ id: string }>,
	copy: { submitted: string; failed: string },
): Promise<{ id: string } | { error: FormState }> {
	try {
		const { id } = await insertRow();

		await recordSubmissionEvent({
			kind,
			submissionId: id,
			type: 'submitted',
			body: copy.submitted,
		});

		return { id };
	} catch (error) {
		console.error(`${SUBMISSION_KINDS[kind].singular} failed to save`, error);
		return { error: { is_error: true, message: copy.failed } };
	}
}

/**
 * Announce a Submission, and record what happened either way. Called *after*
 * the row is committed — persist first, notify second — and never throws.
 * See docs/adr/0005.
 */
export async function notifyAndRecord(
	kind: SubmissionKind,
	submissionId: string,
	notify: () => Promise<NotifyResult>,
): Promise<void> {
	let outcome: NotifyResult;

	try {
		outcome = await notify();
	} catch (error) {
		outcome = {
			ok: false,
			message:
				error instanceof Error
					? error.message
					: 'The notification threw unexpectedly.',
		};
	}

	try {
		await recordSubmissionEvent({
			kind,
			submissionId,
			type: outcome.ok ? 'notification_sent' : 'notification_failed',
			body: outcome.message,
		});
	} catch (error) {
		// The submission itself is safe; only the audit line was lost.
		console.error(
			`Could not record the notification outcome for ${SUBMISSION_KINDS[kind].singular} ${submissionId}`,
			error,
		);
	}
}
