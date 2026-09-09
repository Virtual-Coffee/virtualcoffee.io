import { db, submissionEvent } from '@/db';
import type { SubmissionKind } from '@/lib/submissions';
import { SUBMISSION_KINDS } from '@/lib/submissions';

/**
 * The event-writing half of a Submission, shared by all four forms.
 *
 * Which foreign key to set is the only thing that varies, and getting it wrong
 * trips the `submission_event_exactly_one_subject` CHECK rather than writing a
 * bad row.
 */
function subjectColumn(kind: SubmissionKind, id: number) {
	switch (kind) {
		case 'coc':
			return { cocReportId: id };
		case 'volunteers':
			return { volunteerSignupId: id };
		case 'lunch-and-learn':
			return { lunchAndLearnIdeaId: id };
		case 'coffee-tables':
			return { coffeeTableGroupRequestId: id };
	}
}

export async function recordSubmissionEvent(input: {
	kind: SubmissionKind;
	submissionId: number;
	type: 'submitted' | 'notification_sent' | 'notification_failed' | 'imported';
	body?: string | null;
	actorUserId?: string | null;
}) {
	await db()
		.insert(submissionEvent)
		.values({
			...subjectColumn(input.kind, input.submissionId),
			type: input.type,
			body: input.body ?? null,
			actorUserId: input.actorUserId ?? null,
		});
}

export type NotifyOutcome =
	{ ok: true; detail: string } | { ok: false; detail: string };

/**
 * Announce a Submission, and record what happened either way.
 *
 * Called *after* the row is committed. The ordering is deliberate and inverts
 * the "send first, then write" rule CLAUDE.md states for admin actions: that
 * rule exists so an applicant is never emailed twice, whereas here the risk
 * runs the other way and losing a CoC report because Slack was unreachable is
 * the worse failure. A failure is therefore recorded and surfaced, never
 * raised. See docs/adr/0005.
 */
export async function notifyAndRecord(
	kind: SubmissionKind,
	submissionId: number,
	notify: () => Promise<NotifyOutcome>,
): Promise<void> {
	let outcome: NotifyOutcome;

	try {
		outcome = await notify();
	} catch (error) {
		outcome = {
			ok: false,
			detail:
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
			body: outcome.detail,
		});
	} catch (error) {
		// The submission itself is safe; only the audit line was lost.
		console.error(
			`Could not record the notification outcome for ${SUBMISSION_KINDS[kind].singular} ${submissionId}`,
			error,
		);
	}
}
