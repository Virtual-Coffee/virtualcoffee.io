import { and, eq, inArray, type InferSelectModel } from 'drizzle-orm';

import {
	cocReport,
	coffeeTableGroupRequest,
	db,
	lunchAndLearnIdea,
	submissionEvent,
	volunteerSignup,
	type SubmissionStatus,
} from '@/db';
import { isId } from '@/db/ids';
import {
	neverAnnounced,
	neverAnnouncedCount,
	type AnnouncedScope,
	type SubmissionSubject,
} from '@/lib/history/eventLog';
import { countRows, pagedList } from '@/lib/admin/pagedList';
import type { Section } from '@/lib/access/permissions';
import { countByStatus } from '@/lib/admin/statusCounts';

/**
 * The four Submission kinds, keyed by the URL segment they live at.
 *
 * Everything that varies between them is declared here once — the table, the
 * event table's foreign key (as a column for queries and as a key for rows),
 * the permission that guards it, and how a row is summarised in a list. The
 * admin screens are then written once against this table rather than four
 * times.
 */
export const SUBMISSION_KINDS = {
	coc: {
		label: 'CoC reports',
		singular: 'CoC report',
		section: 'coc',
		table: cocReport,
		eventColumn: submissionEvent.cocReportId,
		eventKey: 'cocReportId',
	},
	volunteers: {
		label: 'Volunteer signups',
		singular: 'Volunteer signup',
		section: 'volunteerSignups',
		table: volunteerSignup,
		eventColumn: submissionEvent.volunteerSignupId,
		eventKey: 'volunteerSignupId',
	},
	'lunch-and-learn': {
		label: 'Lunch & Learn',
		singular: 'Lunch & Learn idea',
		section: 'lunchAndLearn',
		table: lunchAndLearnIdea,
		eventColumn: submissionEvent.lunchAndLearnIdeaId,
		eventKey: 'lunchAndLearnIdeaId',
	},
	'coffee-tables': {
		label: 'Coffee Tables',
		singular: 'Coffee Table group request',
		section: 'coffeeTables',
		table: coffeeTableGroupRequest,
		eventColumn: submissionEvent.coffeeTableGroupRequestId,
		eventKey: 'coffeeTableGroupRequestId',
	},
} as const;

export type SubmissionKind = keyof typeof SUBMISSION_KINDS;

/** The Subject a Submission's events are recorded and read against. */
export function submissionSubject(
	kind: SubmissionKind,
	id: string,
): SubmissionSubject {
	const { table, eventKey } = SUBMISSION_KINDS[kind];
	return { kind: 'submission', id, table, eventKey };
}

/** The Submissions of one kind, as "never announced" is asked over them. */
export function submissionScope(kind: SubmissionKind): AnnouncedScope {
	const { table, eventKey } = SUBMISSION_KINDS[kind];
	return { kind: 'submission', table, eventKey };
}

export const SUBMISSION_KEYS = Object.keys(
	SUBMISSION_KINDS,
) as SubmissionKind[];

/** The kinds whose section is among the ones the viewer holds. */
export function visibleSubmissionKinds(
	sections: readonly Section[],
): SubmissionKind[] {
	return SUBMISSION_KEYS.filter((kind) =>
		sections.includes(SUBMISSION_KINDS[kind].section),
	);
}

/** `new` and `in_progress` are the two a maintainer still has to do something about. */
export const OPEN_STATUSES: SubmissionStatus[] = ['new', 'in_progress'];

/**
 * How many submissions of one kind are still open.
 *
 * A count over the kind's own table rather than a union across all four: they
 * have different columns, and the dashboard only needs a number per card.
 */
export async function openCount(kind: SubmissionKind): Promise<number> {
	const { table } = SUBMISSION_KINDS[kind];

	return countRows(table, inArray(table.status, OPEN_STATUSES));
}

/** How many Submissions of each kind were never announced, for the banner. */
export async function failedNotifications(
	kinds: readonly SubmissionKind[],
): Promise<Record<string, number>> {
	const results = await Promise.all(
		kinds.map(
			async (kind) =>
				[kind, await neverAnnouncedCount(submissionScope(kind))] as const,
		),
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

/**
 * One stored Submission of a kind. `id` is what URLs carry; `reference` is
 * the number shown to maintainers and never goes in a URL (ADR 0008).
 */
export type SubmissionRow<K extends SubmissionKind = SubmissionKind> =
	InferSelectModel<(typeof SUBMISSION_KINDS)[K]['table']>;

/**
 * The columns a Submission list may be ordered by.
 *
 * Deliberately only the ones every kind has. The four tables share just the
 * `submissionColumns` spread, and of those only `status` and `submittedAt`
 * carry an index on all four. The title a list actually shows is per-kind
 * (`reporteeName`, `topic`, `groupName`, `name`), so it cannot be a uniform
 * sort key at all — `reference` is the stable per-kind ordinal that stands in
 * for it.
 */
export type SubmissionSortField = 'reference' | 'status' | 'submittedAt';

export const SUBMISSION_SORT_FIELDS: SubmissionSortField[] = [
	'reference',
	'status',
	'submittedAt',
];

export async function listSubmissions(
	kind: SubmissionKind,
	options: {
		statuses?: SubmissionStatus[];
		/** Only the ones never announced; see `neverAnnounced` in eventLog. */
		failed?: boolean;
		page?: number;
		sort?: SubmissionSortField;
		direction?: 'asc' | 'desc';
	} = {},
): Promise<{ rows: SubmissionRow[]; rowCount: number }> {
	const { table } = SUBMISSION_KINDS[kind];

	return pagedList(table, {
		where: and(
			options.statuses?.length
				? inArray(table.status, options.statuses)
				: undefined,
			options.failed ? neverAnnounced(submissionScope(kind)) : undefined,
		),
		sort: {
			reference: table.reference,
			status: table.status,
			submittedAt: table.submittedAt,
		}[options.sort ?? 'submittedAt'],
		direction: options.direction ?? 'desc',
		page: options.page ?? 0,
	});
}

export function getSubmission<K extends SubmissionKind>(
	kind: K,
	id: string,
): Promise<SubmissionRow<K> | null>;
// The plain signature last: `withStaleRead` checks the last one, and cannot
// match a generic.
export function getSubmission(
	kind: SubmissionKind,
	id: string,
): Promise<SubmissionRow | null>;
export async function getSubmission(
	kind: SubmissionKind,
	id: string,
): Promise<SubmissionRow | null> {
	if (!isId(id)) return null;
	const { table } = SUBMISSION_KINDS[kind];

	const [row] = await db()
		.select()
		.from(table)
		.where(eq(table.id, id))
		.limit(1);

	return row ?? null;
}

/** Counts per status, for the filter chips on a list screen. */
export async function submissionStatusCounts(
	kind: SubmissionKind,
): Promise<Record<string, number>> {
	return countByStatus(SUBMISSION_KINDS[kind].table);
}
