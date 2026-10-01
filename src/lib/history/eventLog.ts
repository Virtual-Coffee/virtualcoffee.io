import { and, desc, eq, isNotNull, or, sql, type SQL } from 'drizzle-orm';
import type { PgColumn, PgTable } from 'drizzle-orm/pg-core';

import {
	applicationEvent,
	cocReport,
	coffeeTableGroupRequest,
	db,
	lunchAndLearnIdea,
	membershipApplication,
	submissionEvent,
	user,
	volunteerEvent,
	volunteerSignup,
	type ApplicationEventType,
	type ApplicationStatus,
	type Database,
	type SubmissionEventType,
	type SubmissionStatus,
	type Transaction,
	type VolunteerEventType,
} from '@/db';
import { reportHandled } from '@/lib/monitoring/reportHandled';
import type { Outbound } from '@/lib/outbound';

/**
 * History: `application_event`, `submission_event` and `volunteer_event` as
 * one concept. Every read and every write of any of the three comes through
 * here, so what a send outcome or a status change becomes in History is
 * decided once, and the subjects' timelines cannot drift apart. See
 * CONTEXT.md.
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
/** A Volunteer has History but no status: only outcomes are recorded. */
export type VolunteerSubject = { kind: 'volunteer'; id: string };
export type Subject = ApplicationSubject | SubmissionSubject | VolunteerSubject;
/** The subjects a status change can be recorded against. */
export type StatusSubject = ApplicationSubject | SubmissionSubject;

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
export type VolunteerEventInput = Omit<
	EventFields<VolunteerEventType, never>,
	'fromStatus' | 'toStatus'
>;
export type EventInput<S extends Subject> = S extends ApplicationSubject
	? ApplicationEventInput
	: S extends SubmissionSubject
		? SubmissionEventInput
		: VolunteerEventInput;

/**
 * What `transitionAndRecord` takes: the statuses are not the caller's to
 * supply, they come from the transition itself.
 */
export type TransitionEventInput<S extends StatusSubject> =
	S extends ApplicationSubject
		? Omit<ApplicationEventInput, 'fromStatus' | 'toStatus'>
		: Omit<SubmissionEventInput, 'fromStatus' | 'toStatus'>;

export type StatusOf<S extends Subject> = S extends ApplicationSubject
	? ApplicationStatus
	: S extends SubmissionSubject
		? SubmissionStatus
		: never;
export type PatchOf<S extends StatusSubject> = S extends ApplicationSubject
	? Partial<typeof membershipApplication.$inferInsert>
	: Partial<SubmissionTable['$inferInsert']>;

type Executor = Database | Transaction;

/** The columns the event tables share, which is all History reads. */
type EventTable = PgTable & {
	id: PgColumn;
	type: PgColumn;
	body: PgColumn;
	createdAt: PgColumn;
	actorUserId: PgColumn;
};

/** What every event row carries whatever its subject. */
type SharedValues = {
	actorUserId: string | null;
	body: string | null;
	createdAt?: Date;
};

/**
 * Where each kind of subject keeps its History: the table, how a row is
 * written, which rows belong to one subject, and its status columns — null
 * for a Volunteer, which has none.
 */
type HistorySource<S extends Subject> = {
	table: EventTable;
	insert: (
		executor: Executor,
		subject: S,
		event: EventInput<S>,
		shared: SharedValues,
	) => Promise<unknown>;
	belongsTo: (subject: S) => SQL;
	status: { fromStatus: PgColumn; toStatus: PgColumn } | null;
};

const sources: {
	[K in Subject['kind']]: HistorySource<Extract<Subject, { kind: K }>>;
} = {
	application: {
		table: applicationEvent,
		insert: (executor, subject, event, shared) =>
			executor.insert(applicationEvent).values({
				...shared,
				applicationId: subject.id,
				type: event.type,
				fromStatus: event.fromStatus ?? null,
				toStatus: event.toStatus ?? null,
			}),
		belongsTo: (subject) => eq(applicationEvent.applicationId, subject.id),
		status: {
			fromStatus: applicationEvent.fromStatus,
			toStatus: applicationEvent.toStatus,
		},
	},
	submission: {
		table: submissionEvent,
		// The wrong key trips `submission_event_exactly_one_subject` rather than
		// writing a bad row.
		insert: (executor, subject, event, shared) =>
			executor.insert(submissionEvent).values({
				...shared,
				[subject.eventKey]: subject.id,
				type: event.type,
				fromStatus: event.fromStatus ?? null,
				toStatus: event.toStatus ?? null,
			}),
		belongsTo: (subject) => eq(submissionEvent[subject.eventKey], subject.id),
		status: {
			fromStatus: submissionEvent.fromStatus,
			toStatus: submissionEvent.toStatus,
		},
	},
	volunteer: {
		table: volunteerEvent,
		insert: (executor, subject, event, shared) =>
			executor.insert(volunteerEvent).values({
				...shared,
				volunteerId: subject.id,
				type: event.type,
			}),
		belongsTo: (subject) => eq(volunteerEvent.volunteerId, subject.id),
		status: null,
	},
};

/** The one lookup: `S` picks its own entry, which TypeScript cannot follow. */
function sourceOf<S extends Subject>(subject: S): HistorySource<S> {
	return sources[subject.kind] as unknown as HistorySource<S>;
}

/**
 * One History row.
 *
 * Every INSERT into any event table goes through here — directly, or from
 * `recordOutcome`, `recordImport` or `transitionAndRecord` — and nothing
 * outside this module inserts at all.
 */
export async function recordEvent<S extends Subject>(
	subject: S,
	event: EventInput<S>,
	executor: Executor = db(),
): Promise<void> {
	await sourceOf(subject).insert(executor, subject, event, {
		actorUserId: event.actorUserId ?? null,
		body: event.body ?? null,
		...(event.createdAt ? { createdAt: event.createdAt } : {}),
	});
}

/**
 * The History line for a row that came from Airtable, written by the seed and
 * by the one-off importers.
 *
 * Backdated to the row's own submission time so the timeline reads in the
 * order things actually happened rather than in import order. `toStatus` is the
 * status the import classified the row into, for a subject whose import decides
 * one; a Submission is imported at whatever status it already had, so it passes
 * nothing.
 */
export async function recordImport<S extends StatusSubject>(
	subject: S,
	airtableRecordId: string,
	at: Date,
	toStatus?: StatusOf<S>,
	executor: Executor = db(),
): Promise<void> {
	// `StatusOf<S>` cannot be resolved against either member of the union while
	// `S` is still generic; the subject is what picks the table, as everywhere.
	const event = {
		type: 'imported',
		body: `Imported from Airtable (${airtableRecordId})`,
		createdAt: at,
		...(toStatus ? { toStatus } : {}),
	} as EventInput<S>;

	await recordEvent(subject, event, executor);
}

export type Channel = 'email' | 'slack' | 'github issue';

/** A Submission's outcomes are all notifications; Applications and Volunteers are emailed too. */
export type ChannelOf<S extends Subject> = S extends SubmissionSubject
	? Exclude<Channel, 'email'>
	: Channel;

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
		outbound: Outbound;
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
		await recordEvent(subject, {
			type,
			body,
			actorUserId: input.actorUserId,
		} as EventInput<S>);
		return true;
	} catch (error) {
		console.error(
			`Could not record the ${input.channel} outcome for ${subject.kind} ${subject.id}`,
			error,
		);
		reportHandled(error, { area: 'history', tags: { channel: input.channel } });
		return false;
	}
}

/**
 * Announce a subject and record what happened either way, for a public form.
 * Called *after* the row is committed — persist first, notify second, per
 * docs/adr/0005 — and never throws: a sender that throws despite `deliver()`'s
 * contract is recorded as a failure.
 */
export async function notifyAndRecord<S extends Subject>(
	subject: S,
	input: { channel: ChannelOf<S>; what: string },
	notify: () => Promise<Outbound>,
): Promise<void> {
	let outbound: Outbound;

	try {
		outbound = await notify();
	} catch (error) {
		// A throw here bypassed `deliver()`, so nothing else reports it.
		reportHandled(error, { area: 'history', tags: { channel: input.channel } });
		outbound = {
			ok: false,
			definitelyNotSent: true,
			message:
				error instanceof Error
					? error.message
					: 'The notification threw unexpectedly.',
		};
	}

	await recordOutcome(subject, { ...input, outbound });
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
 *
 * The recorded `fromStatus`/`toStatus` are `from` and `patch.status`, so
 * History cannot disagree with the row; a patch that leaves the status alone
 * records neither.
 */
export async function transitionAndRecord<S extends StatusSubject>(
	subject: S,
	from: StatusOf<S>,
	patch: PatchOf<S>,
	event: TransitionEventInput<S>,
	guard?: SQL,
): Promise<boolean> {
	const table: StatusTable =
		subject.kind === 'application' ? membershipApplication : subject.table;
	const to = (patch as { status?: StatusOf<S> }).status;
	const recorded = {
		...event,
		fromStatus: to === undefined ? null : from,
		toStatus: to ?? null,
	} as EventInput<S>;
	return db().transaction(async (tx) => {
		const moved = await tx
			.update(table)
			.set(patch)
			.where(
				and(eq(table.id, subject.id), eq(table.status, from as string), guard),
			)
			.returning({ id: table.id });
		if (moved.length === 0) return false;
		await recordEvent(subject, recorded, tx);
		return true;
	});
}

/**
 * One row of History, as a detail screen's timeline renders it.
 *
 * `type` is widened from the enum on purpose: the timelines are client
 * components that look the label up in `eventLabels.ts`, so they never switch
 * on the value and must not carry one subject's enum into the browser bundle.
 */
export type HistoryEntry<S extends Subject> = {
	id: string;
	type: string;
	body: string | null;
	fromStatus: StatusOf<S> | null;
	toStatus: StatusOf<S> | null;
	createdAt: Date;
	actorName: string | null;
};

/** One subject's History, newest first, with the actor's current name. */
export async function history<S extends Subject>(
	subject: S,
): Promise<HistoryEntry<S>[]> {
	const { table, belongsTo, status } = sourceOf(subject);

	const rows = await db()
		.select({
			id: table.id,
			type: sql<string>`${table.type}`,
			body: table.body,
			// A Volunteer's rows have no status columns; the timeline reads null.
			fromStatus: status?.fromStatus ?? sql<null>`null`,
			toStatus: status?.toStatus ?? sql<null>`null`,
			createdAt: table.createdAt,
			actorName: user.name,
		})
		.from(table)
		.leftJoin(user, eq(table.actorUserId, user.id))
		.where(belongsTo(subject))
		// `createdAt` is not unique; the v7 id breaks ties by creation order.
		.orderBy(desc(table.createdAt), desc(table.id));

	return rows as HistoryEntry<S>[];
}

/**
 * One row of recent activity from either table, with enough of its subject to
 * name and link it. `reference` is the number a screen shows; never put it in
 * a URL (ADR 0008).
 */
export type RecentEvent = {
	id: string;
	type: string;
	body: string | null;
	createdAt: Date;
	actorName: string | null;
	reference: number;
	/** The subject's own name where it has one; a Submission has none. */
	name: string | null;
} & (
	| { kind: 'application'; subjectId: string; eventKey: null }
	| { kind: 'submission'; subjectId: string; eventKey: SubmissionEventKey }
);

/**
 * The newest Submission events over the kinds asked for.
 *
 * One query across all of them: the columns are shared, only which foreign key
 * is set differs, and the row's own kind is recovered from whichever of those
 * keys came back non-null.
 */
async function recentSubmissionEvents(
	kinds: readonly { eventKey: SubmissionEventKey }[],
	limit: number,
): Promise<RecentEvent[]> {
	const keys = kinds.map(({ eventKey }) => eventKey);

	const found = await db()
		.select({
			id: submissionEvent.id,
			cocReportId: submissionEvent.cocReportId,
			volunteerSignupId: submissionEvent.volunteerSignupId,
			lunchAndLearnIdeaId: submissionEvent.lunchAndLearnIdeaId,
			coffeeTableGroupRequestId: submissionEvent.coffeeTableGroupRequestId,
			type: sql<string>`${submissionEvent.type}`,
			body: submissionEvent.body,
			createdAt: submissionEvent.createdAt,
			actorName: user.name,
			// The kinds are mutually exclusive, so exactly one of these is set.
			reference: sql<number>`coalesce(${cocReport.reference}, ${volunteerSignup.reference}, ${lunchAndLearnIdea.reference}, ${coffeeTableGroupRequest.reference})`,
		})
		.from(submissionEvent)
		.leftJoin(user, eq(submissionEvent.actorUserId, user.id))
		.leftJoin(cocReport, eq(submissionEvent.cocReportId, cocReport.id))
		.leftJoin(
			volunteerSignup,
			eq(submissionEvent.volunteerSignupId, volunteerSignup.id),
		)
		.leftJoin(
			lunchAndLearnIdea,
			eq(submissionEvent.lunchAndLearnIdeaId, lunchAndLearnIdea.id),
		)
		.leftJoin(
			coffeeTableGroupRequest,
			eq(submissionEvent.coffeeTableGroupRequestId, coffeeTableGroupRequest.id),
		)
		.where(or(...keys.map((key) => isNotNull(submissionEvent[key]))))
		.orderBy(desc(submissionEvent.createdAt), desc(submissionEvent.id))
		.limit(limit);

	return found.flatMap((row) => {
		const eventKey = keys.find((key) => row[key] !== null);
		const subjectId = eventKey ? row[eventKey] : null;
		if (!eventKey || !subjectId) return [];

		return [
			{
				id: row.id,
				type: row.type,
				body: row.body,
				createdAt: row.createdAt,
				actorName: row.actorName,
				reference: row.reference,
				name: null,
				kind: 'submission' as const,
				subjectId,
				eventKey,
			},
		];
	});
}

/**
 * The newest events over the tables the caller asks for.
 *
 * Merged in JavaScript rather than as a SQL UNION: the two event tables have
 * different shapes and different foreign keys, and at fifteen rows the cost of
 * over-fetching a little from each is irrelevant next to the complexity of
 * keeping a union in step with both.
 *
 * The caller says which kinds of Submission to include, because it — not this
 * module — knows what the viewer may see. `src/lib/submissions/submissions.ts` reads from
 * here, so this module cannot import it back for the mapping.
 */
export async function recentEvents(input: {
	applications: boolean;
	submissions: readonly { eventKey: SubmissionEventKey }[];
	limit: number;
}): Promise<RecentEvent[]> {
	const { limit } = input;
	const rows: RecentEvent[] = [];

	if (input.applications) {
		const found = await db()
			.select({
				id: applicationEvent.id,
				subjectId: applicationEvent.applicationId,
				type: sql<string>`${applicationEvent.type}`,
				body: applicationEvent.body,
				createdAt: applicationEvent.createdAt,
				actorName: user.name,
				reference: membershipApplication.reference,
				name: membershipApplication.name,
			})
			.from(applicationEvent)
			.leftJoin(user, eq(applicationEvent.actorUserId, user.id))
			// Inner: `application_id` is NOT NULL and cascades, so the row is there.
			.innerJoin(
				membershipApplication,
				eq(applicationEvent.applicationId, membershipApplication.id),
			)
			.orderBy(desc(applicationEvent.createdAt), desc(applicationEvent.id))
			.limit(limit);

		for (const row of found) {
			rows.push({ ...row, kind: 'application', eventKey: null });
		}
	}

	if (input.submissions.length > 0) {
		rows.push(...(await recentSubmissionEvents(input.submissions, limit)));
	}

	// The same order as each query's ORDER BY, so a tie across the two tables
	// falls to the newer UUIDv7 rather than to which table was read first.
	return rows
		.sort(
			(a, b) =>
				b.createdAt.getTime() - a.createdAt.getTime() ||
				b.id.localeCompare(a.id),
		)
		.slice(0, limit);
}
