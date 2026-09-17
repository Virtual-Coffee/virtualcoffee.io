import { db, type Transaction } from '@/db';
import {
	recordEvent,
	recordOutcome,
	type ChannelOf,
	type SubmissionSubject,
} from '@/lib/history/eventLog';
import type { Outbound } from '@/lib/outbound';
import {
	SUBMISSION_KINDS,
	submissionSubject,
	type SubmissionKind,
} from '@/lib/submissions/submissions';
import { formError } from '@/util/forms/parse';
import type { FormState } from '@/util/forms/types';

/**
 * The write half of a Submission: insert the row, log `submitted`, and turn a
 * failure into the form state to hand back. Persist first, notify second —
 * see docs/adr/0005 — so the caller only reaches `notifyAndRecord()` with an
 * id that is already committed.
 *
 * Row and event commit together. The submitter is told to try again on any
 * failure, so a row that made it without its event would be duplicated by
 * the retry.
 *
 * The upstream error is deliberately not surfaced: its message can name
 * tables and columns, and there is nothing the submitter could do with it.
 */
export async function persistSubmission(
	kind: SubmissionKind,
	insertRow: (tx: Transaction) => Promise<{ id: string }>,
	copy: { submitted: string; failed: string },
): Promise<{ id: string } | { error: FormState }> {
	try {
		const id = await db().transaction(async (tx) => {
			const { id } = await insertRow(tx);

			await recordEvent(
				submissionSubject(kind, id),
				{ type: 'submitted', body: copy.submitted },
				tx,
			);

			return id;
		});

		return { id };
	} catch (error) {
		console.error(`${SUBMISSION_KINDS[kind].singular} failed to save`, error);
		return { error: formError(copy.failed) };
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
	input: { channel: ChannelOf<SubmissionSubject>; what: string },
	notify: () => Promise<Outbound>,
): Promise<void> {
	let outcome: Outbound;

	try {
		outcome = await notify();
	} catch (error) {
		outcome = {
			ok: false,
			definitelyNotSent: true,
			message:
				error instanceof Error
					? error.message
					: 'The notification threw unexpectedly.',
		};
	}

	await recordOutcome(submissionSubject(kind, submissionId), {
		channel: input.channel,
		outbound: outcome,
		what: input.what,
	});
}
