import { and, eq, type SQL } from 'drizzle-orm';
import type { PgColumn, PgTable } from 'drizzle-orm/pg-core';

import {
	applicationEvent,
	db,
	membershipApplication,
	submissionEvent,
	type ApplicationEventType,
	type ApplicationStatus,
	type Database,
	type SubmissionEventType,
	type SubmissionStatus,
	type Transaction,
	type cocReport,
	type coffeeTableGroupRequest,
	type lunchAndLearnIdea,
	type volunteerSignup,
} from '@/db';

/**
 * The Event Log: `application_event` and `submission_event` as one concept.
 * Every write to either table comes through here, so what a send outcome or
 * a status change becomes in History is decided once. See CONTEXT.md.
 */

export type SubmissionTable =
	| typeof cocReport
	| typeof volunteerSignup
	| typeof lunchAndLearnIdea
	| typeof coffeeTableGroupRequest;

/** The `submission_event` column that points at a Submission of each kind. */
export type SubmissionEventKey = Extract<
	keyof typeof submissionEvent.$inferInsert,
	| 'cocReportId'
	| 'volunteerSignupId'
	| 'lunchAndLearnIdeaId'
	| 'coffeeTableGroupRequestId'
>;

export type ApplicationSubject = { kind: 'application'; id: string };
export type SubmissionSubject = {
	kind: 'submission';
	id: string;
	table: SubmissionTable;
	eventKey: SubmissionEventKey;
};
export type Subject = ApplicationSubject | SubmissionSubject;

type EventFields<Type, Status> = {
	type: Type;
	/** Null for system events (import, form submission). */
	actorUserId?: string | null;
	fromStatus?: Status | null;
	toStatus?: Status | null;
	body?: string | null;
	/** The seed backdates its History; the actions take the default. */
	createdAt?: Date;
};
export type ApplicationEventInput = EventFields<
	ApplicationEventType,
	ApplicationStatus
>;
export type SubmissionEventInput = EventFields<
	SubmissionEventType,
	SubmissionStatus
>;
export type EventInput<S extends Subject> = S extends ApplicationSubject
	? ApplicationEventInput
	: SubmissionEventInput;

export type StatusOf<S extends Subject> = S extends ApplicationSubject
	? ApplicationStatus
	: SubmissionStatus;
export type PatchOf<S extends Subject> = S extends ApplicationSubject
	? Partial<typeof membershipApplication.$inferInsert>
	: Partial<SubmissionTable['$inferInsert']>;

type Executor = Database | Transaction;

async function writeEvent(
	subject: Subject,
	event: ApplicationEventInput | SubmissionEventInput,
	executor: Executor,
): Promise<void> {
	const shared = {
		actorUserId: event.actorUserId ?? null,
		body: event.body ?? null,
		...(event.createdAt ? { createdAt: event.createdAt } : {}),
	};
	if (subject.kind === 'application') {
		const input = event as ApplicationEventInput;
		await executor.insert(applicationEvent).values({
			...shared,
			applicationId: subject.id,
			type: input.type,
			fromStatus: input.fromStatus ?? null,
			toStatus: input.toStatus ?? null,
		});
		return;
	}
	const input = event as SubmissionEventInput;
	// The wrong key trips `submission_event_exactly_one_subject` rather than
	// writing a bad row.
	await executor.insert(submissionEvent).values({
		...shared,
		[subject.eventKey]: subject.id,
		type: input.type,
		fromStatus: input.fromStatus ?? null,
		toStatus: input.toStatus ?? null,
	});
}

/** One History row. The only INSERT into either event table. */
export async function recordEvent<S extends Subject>(
	subject: S,
	event: EventInput<S>,
	executor: Executor = db(),
): Promise<void> {
	await writeEvent(subject, event, executor);
}

export type Channel = 'email' | 'slack' | 'github issue';

/** What `deliver()` returns (`Outbound` in lib/outbound.ts), as much of it as History needs. */
export type Outcome = { ok: boolean; message: string; warning?: string };

/** Only an application is ever emailed; a Submission's outcomes are all notifications. */
export type ChannelOf<S extends Subject> = S extends ApplicationSubject
	? Channel
	: Exclude<Channel, 'email'>;

/**
 * What a send came to, as History. `email` becomes `email_sent` /
 * `email_failed`, anything else `notification_sent` / `notification_failed`;
 * the body is `what` — "Coffee invite to a@b" — with the failure appended.
 *
 * Never throws. The send has already happened, so a lost audit line must not
 * turn a delivered email into an error page; it is logged and reported as
 * false, and the caller reports the send as it went.
 */
export async function recordOutcome<S extends Subject>(
	subject: S,
	input: {
		channel: ChannelOf<S>;
		outbound: Outcome;
		what: string;
		actorUserId?: string | null;
	},
): Promise<boolean> {
	const { outbound } = input;
	const email = input.channel === 'email';
	const type = outbound.ok
		? email
			? 'email_sent'
			: 'notification_sent'
		: email
			? 'email_failed'
			: 'notification_failed';
	const body = outbound.ok
		? outbound.warning
			? `${input.what} — ${outbound.warning}`
			: input.what
		: `${input.what} failed: ${outbound.message}`;

	try {
		await writeEvent(
			subject,
			{ type, body, actorUserId: input.actorUserId },
			db(),
		);
		return true;
	} catch (error) {
		console.error(
			`Could not record the ${input.channel} outcome for ${subject.kind} ${subject.id}`,
			error,
		);
		return false;
	}
}

type StatusTable = PgTable & { id: PgColumn; status: PgColumn };

/**
 * Move a row on from the status it was read at, and record it, in one
 * transaction.
 *
 * Conditional on that status still being current, so two maintainers acting
 * on the same row within seconds cannot both write — the second finds no row
 * and is told to reload, instead of overwriting a decline or recording a
 * second event with a stale `fromStatus`. `guard` narrows it further for a
 * write that leaves the status alone and so cannot be fenced by it.
 *
 * The event commits with the change, so a failed insert cannot leave a row
 * that moved with no history saying who moved it. False means the transition
 * did not apply and nothing was written.
 */
export async function transitionAndRecord<S extends Subject>(
	subject: S,
	from: StatusOf<S>,
	patch: PatchOf<S>,
	event: EventInput<S>,
	guard?: SQL,
): Promise<boolean> {
	const table: StatusTable =
		subject.kind === 'application' ? membershipApplication : subject.table;
	return db().transaction(async (tx) => {
		const moved = await tx
			.update(table)
			.set(patch)
			.where(
				and(eq(table.id, subject.id), eq(table.status, from as string), guard),
			)
			.returning({ id: table.id });
		if (moved.length === 0) return false;
		await writeEvent(subject, event, tx);
		return true;
	});
}
