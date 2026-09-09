import { count, desc, eq, inArray, sql } from 'drizzle-orm';

import {
	cocReport,
	coffeeTableGroupRequest,
	db,
	lunchAndLearnIdea,
	submissionEvent,
	user,
	volunteerSignup,
	type SubmissionStatus,
} from '@/db';
import type { Section } from '@/lib/permissions';

/**
 * The four Submission kinds, keyed by the URL segment they live at.
 *
 * Everything that varies between them is declared here once — the table, the
 * event table's foreign key, the permission that guards it, and how a row is
 * summarised in a list. The admin screens are then written once against this
 * table rather than four times.
 */
export const SUBMISSION_KINDS = {
	coc: {
		label: 'CoC reports',
		singular: 'CoC report',
		section: 'coc',
		table: cocReport,
		eventColumn: submissionEvent.cocReportId,
	},
	volunteers: {
		label: 'Volunteers',
		singular: 'Volunteer signup',
		section: 'volunteers',
		table: volunteerSignup,
		eventColumn: submissionEvent.volunteerSignupId,
	},
	'lunch-and-learn': {
		label: 'Lunch & Learn',
		singular: 'Lunch & Learn idea',
		section: 'lunchAndLearn',
		table: lunchAndLearnIdea,
		eventColumn: submissionEvent.lunchAndLearnIdeaId,
	},
	'coffee-tables': {
		label: 'Coffee Tables',
		singular: 'Coffee Table group request',
		section: 'coffeeTables',
		table: coffeeTableGroupRequest,
		eventColumn: submissionEvent.coffeeTableGroupRequestId,
	},
} as const;

export type SubmissionKind = keyof typeof SUBMISSION_KINDS;

export const SUBMISSION_KEYS = Object.keys(
	SUBMISSION_KINDS,
) as SubmissionKind[];

export function kindForSection(section: Section): SubmissionKind | null {
	return (
		SUBMISSION_KEYS.find((key) => SUBMISSION_KINDS[key].section === section) ??
		null
	);
}

/** `new` and `in_progress` are the two a maintainer still has to do something about. */
export const OPEN_STATUSES: SubmissionStatus[] = ['new', 'in_progress'];

export const PAGE_SIZE = 50;

/**
 * How many submissions of one kind are still open.
 *
 * A count over the kind's own table rather than a union across all four: they
 * have different columns, and the dashboard only needs a number per card.
 */
export async function openCount(kind: SubmissionKind): Promise<number> {
	const { table } = SUBMISSION_KINDS[kind];

	const [row] = await db()
		.select({ value: count() })
		.from(table)
		.where(inArray(table.status, OPEN_STATUSES));

	return row?.value ?? 0;
}

export type SubmissionEventEntry = {
	id: number;
	type: string;
	body: string | null;
	fromStatus: SubmissionStatus | null;
	toStatus: SubmissionStatus | null;
	createdAt: Date;
	actorName: string | null;
};

export async function getSubmissionHistory(
	kind: SubmissionKind,
	submissionId: number,
): Promise<SubmissionEventEntry[]> {
	const { eventColumn } = SUBMISSION_KINDS[kind];

	return db()
		.select({
			id: submissionEvent.id,
			type: sql<string>`${submissionEvent.type}`,
			body: submissionEvent.body,
			fromStatus: submissionEvent.fromStatus,
			toStatus: submissionEvent.toStatus,
			createdAt: submissionEvent.createdAt,
			actorName: user.name,
		})
		.from(submissionEvent)
		.leftJoin(user, eq(submissionEvent.actorUserId, user.id))
		.where(eq(eventColumn, submissionId))
		.orderBy(desc(submissionEvent.createdAt));
}

/**
 * Submissions whose most recent notification attempt failed.
 *
 * This is what backs the warning banner. A submission that was stored but never
 * announced is the failure mode the persist-then-notify ordering accepts, so it
 * has to be visible rather than merely logged — see docs/adr/0005.
 */
export async function failedNotifications(
	kinds: readonly SubmissionKind[],
): Promise<Record<string, number>> {
	if (kinds.length === 0) return {};

	const results = await Promise.all(
		kinds.map(async (kind) => {
			const { eventColumn } = SUBMISSION_KINDS[kind];
			const [row] = await db()
				.select({ value: count() })
				.from(submissionEvent)
				.where(
					sql`${submissionEvent.type} = 'notification_failed' and ${eventColumn} is not null`,
				);
			return [kind, row?.value ?? 0] as const;
		}),
	);

	return Object.fromEntries(results.filter(([, value]) => value > 0));
}

/**
 * How each kind is rendered, kept next to the tables it describes.
 *
 * `summary` is the line the list shows; `fields` are the labelled values on the
 * detail screen, in the order they appeared on the form the person filled in.
 */
export const SUBMISSION_DISPLAY: Record<
	SubmissionKind,
	{
		summary: (row: Record<string, unknown>) => {
			title: string;
			subtitle: string;
		};
		fields: { label: string; key: string; long?: boolean }[];
	}
> = {
	coc: {
		summary: (row) => ({
			// Anonymous reports are the point of the form, not an edge case.
			title: `Report about ${String(row.reporteeName ?? '—')}`,
			subtitle: row.name ? String(row.name) : 'Anonymous',
		}),
		fields: [
			{ label: 'Reporter', key: 'name' },
			{ label: 'Email', key: 'email' },
			{ label: 'Member reported', key: 'reporteeName' },
			{ label: 'Time / location', key: 'timeLocation' },
			{ label: 'What happened', key: 'description', long: true },
			{ label: 'Anyone else involved', key: 'anyoneElseInvolved', long: true },
		],
	},
	volunteers: {
		summary: (row) => ({
			title: String(row.name ?? '—'),
			subtitle: String(row.position ?? 'No role given'),
		}),
		fields: [
			{ label: 'Name', key: 'name' },
			{ label: 'Email', key: 'email' },
			{ label: 'GitHub', key: 'githubUsername' },
			{ label: 'Role', key: 'position' },
			{ label: 'Details', key: 'description', long: true },
		],
	},
	'lunch-and-learn': {
		summary: (row) => ({
			title: String(row.topic ?? '—'),
			subtitle: String(row.name ?? '—'),
		}),
		fields: [
			{ label: 'Name', key: 'name' },
			{ label: 'Email', key: 'email' },
			{ label: 'Title', key: 'topic' },
			{ label: 'Description', key: 'description', long: true },
			{ label: 'Format', key: 'format' },
			{ label: 'Timing', key: 'timing' },
			{ label: 'GitHub issue', key: 'githubIssueUrl' },
		],
	},
	'coffee-tables': {
		summary: (row) => ({
			title: String(row.groupName ?? '—'),
			subtitle: String(row.name ?? '—'),
		}),
		fields: [
			{ label: 'Name', key: 'name' },
			{ label: 'Email', key: 'email' },
			{ label: 'Group name', key: 'groupName' },
			{ label: 'Description', key: 'description', long: true },
		],
	},
};

export function isSubmissionKind(value: string): value is SubmissionKind {
	return SUBMISSION_KEYS.includes(value as SubmissionKind);
}

export type SubmissionRow = Record<string, unknown> & {
	id: number;
	status: SubmissionStatus;
	submittedAt: Date;
};

export async function listSubmissions(
	kind: SubmissionKind,
	options: { statuses?: SubmissionStatus[]; page?: number } = {},
): Promise<{ rows: SubmissionRow[]; rowCount: number }> {
	const { table } = SUBMISSION_KINDS[kind];
	const page = options.page ?? 0;
	const where = options.statuses?.length
		? inArray(table.status, options.statuses)
		: undefined;

	const [rows, [totals]] = await Promise.all([
		db()
			.select()
			.from(table)
			.where(where)
			.orderBy(desc(table.submittedAt))
			.limit(PAGE_SIZE)
			.offset(page * PAGE_SIZE),
		db().select({ value: count() }).from(table).where(where),
	]);

	return {
		rows: rows as unknown as SubmissionRow[],
		rowCount: totals?.value ?? 0,
	};
}

export async function getSubmission(
	kind: SubmissionKind,
	id: number,
): Promise<SubmissionRow | null> {
	const { table } = SUBMISSION_KINDS[kind];

	const [row] = await db()
		.select()
		.from(table)
		.where(eq(table.id, id))
		.limit(1);

	return (row as unknown as SubmissionRow) ?? null;
}

/** Counts per status, for the filter chips on a list screen. */
export async function submissionStatusCounts(
	kind: SubmissionKind,
): Promise<Record<string, number>> {
	const { table } = SUBMISSION_KINDS[kind];

	const rows = await db()
		.select({ status: table.status, value: count() })
		.from(table)
		.groupBy(table.status);

	const counts: Record<string, number> = {};
	let total = 0;
	for (const row of rows) {
		counts[row.status] = row.value;
		total += row.value;
	}
	counts.all = total;
	return counts;
}
