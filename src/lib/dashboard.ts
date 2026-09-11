import { count, desc, eq, inArray, isNotNull, or, sql } from 'drizzle-orm';

import {
	applicationEvent,
	cocReport,
	coffeeTableGroupRequest,
	db,
	lunchAndLearnIdea,
	membershipApplication,
	submissionEvent,
	user,
	volunteerSignup,
} from '@/db';
import { QUEUE_STATUSES } from '@/lib/applications';
import { activeVolunteerCount } from '@/lib/volunteers';
import type { Section } from '@/lib/permissions';
import {
	openCount,
	SUBMISSION_KINDS,
	type SubmissionKind,
} from '@/lib/submissions';

/** One number on a card. Most sections have a single one; the queue has two. */
export type DashboardFigure = {
	count: number;
	label: string;
};

export type DashboardCard = {
	section: Section;
	label: string;
	href: string;
	/**
	 * Things still waiting on a maintainer, as one or more numbers.
	 *
	 * A list rather than a count and a label, because the Waitlist is two
	 * different jobs sharing a card: people awaiting a first decision, and people
	 * who have been sent a Coffee invite and are awaiting a second. Summing them
	 * into one number said "43 in the queue" and hid which half needed doing.
	 */
	figures: DashboardFigure[];
};

export type ActivityEntry = {
	key: string;
	createdAt: Date;
	type: string;
	body: string | null;
	actorName: string | null;
	/** Where the entry links to, or null when the viewer cannot open it. */
	href: string | null;
	subject: string;
};

const SUBMISSION_SECTIONS = Object.fromEntries(
	(Object.keys(SUBMISSION_KINDS) as SubmissionKind[]).map((kind) => [
		SUBMISSION_KINDS[kind].section,
		kind,
	]),
) as Record<string, SubmissionKind>;

/**
 * One card per section the viewer holds `read` on.
 *
 * Built from the caller's already-computed section list rather than re-deriving
 * it, so the dashboard can never show a card the nav hides.
 */
export async function dashboardCards(
	sections: readonly Section[],
): Promise<DashboardCard[]> {
	const cards = await Promise.all(
		sections.map(async (section): Promise<DashboardCard | null> => {
			if (section === 'waitlist') {
				/**
				 * Grouped rather than two counts, because the two figures are the two
				 * halves of the same set — one query, and they cannot disagree about
				 * a row that changed status between them.
				 */
				const rows = await db()
					.select({
						status: membershipApplication.status,
						value: count(),
					})
					.from(membershipApplication)
					.where(inArray(membershipApplication.status, QUEUE_STATUSES))
					.groupBy(membershipApplication.status);

				const byStatus = new Map(rows.map((row) => [row.status, row.value]));

				return {
					section,
					label: 'Waitlist',
					href: '/admin/waitlist',
					figures: [
						// Awaiting a first decision — nobody has looked at them yet.
						{ count: byStatus.get('waitlisted') ?? 0, label: 'waiting' },
						// Sent a Coffee invite, awaiting a Membership Approval after it.
						{ count: byStatus.get('coffee_invited') ?? 0, label: 'pending' },
					],
				};
			}

			/**
			 * Volunteers are a roster, not a queue, so the count is how many can
			 * currently give out Invites rather than how much work is waiting.
			 * A new Section that is neither the waitlist nor a Submission kind
			 * falls through to `SUBMISSION_SECTIONS` below and silently produces no
			 * card at all, which is why this branch has to exist.
			 */
			if (section === 'volunteers') {
				return {
					section,
					label: 'Volunteers',
					href: '/admin/volunteers',
					figures: [{ count: await activeVolunteerCount(), label: 'active' }],
				};
			}

			// The User Management screen is a list of people, not a queue of work.
			if (section === 'admins') return null;

			const kind = SUBMISSION_SECTIONS[section];
			if (!kind) return null;

			return {
				section,
				label: SUBMISSION_KINDS[kind].label,
				href: `/admin/submissions/${kind}`,
				figures: [
					{ count: await openCount(kind), label: 'awaiting a response' },
				],
			};
		}),
	);

	return cards.filter((card): card is DashboardCard => card !== null);
}

const ACTIVITY_LIMIT = 15;

/**
 * The most recent events across everything the viewer can see.
 *
 * Merged in JavaScript rather than as a SQL UNION: the two event tables have
 * different shapes and different foreign keys, and at fifteen rows the cost of
 * over-fetching a little from each is irrelevant next to the complexity of
 * keeping a union in step with both.
 */
export async function recentActivity(
	sections: readonly Section[],
): Promise<ActivityEntry[]> {
	const entries: ActivityEntry[] = [];

	if (sections.includes('waitlist')) {
		const rows = await db()
			.select({
				id: applicationEvent.id,
				applicationId: applicationEvent.applicationId,
				type: sql<string>`${applicationEvent.type}`,
				body: applicationEvent.body,
				createdAt: applicationEvent.createdAt,
				actorName: user.name,
				subject: membershipApplication.name,
				reference: membershipApplication.reference,
			})
			.from(applicationEvent)
			.leftJoin(user, eq(applicationEvent.actorUserId, user.id))
			.leftJoin(
				membershipApplication,
				eq(applicationEvent.applicationId, membershipApplication.id),
			)
			// `createdAt` is not unique; the v7 id breaks ties by creation order.
			.orderBy(desc(applicationEvent.createdAt), desc(applicationEvent.id))
			.limit(ACTIVITY_LIMIT);

		for (const row of rows) {
			entries.push({
				key: `application-${row.id}`,
				createdAt: row.createdAt,
				type: row.type,
				body: row.body,
				actorName: row.actorName,
				href: `/admin/waitlist/${row.applicationId}`,
				subject: row.subject ?? `Application ${row.reference}`,
			});
		}
	}

	const visibleKinds = (
		Object.keys(SUBMISSION_KINDS) as SubmissionKind[]
	).filter((kind) => sections.includes(SUBMISSION_KINDS[kind].section));

	if (visibleKinds.length > 0) {
		// One query across every visible kind: the columns are shared, only which
		// foreign key is set differs.
		const rows = await db()
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
				eq(
					submissionEvent.coffeeTableGroupRequestId,
					coffeeTableGroupRequest.id,
				),
			)
			.where(
				or(
					...visibleKinds.map((kind) =>
						isNotNull(SUBMISSION_KINDS[kind].eventColumn),
					),
				),
			)
			.orderBy(desc(submissionEvent.createdAt), desc(submissionEvent.id))
			.limit(ACTIVITY_LIMIT);

		for (const row of rows) {
			const kind = visibleKinds.find((candidate) => {
				switch (candidate) {
					case 'coc':
						return row.cocReportId !== null;
					case 'volunteers':
						return row.volunteerSignupId !== null;
					case 'lunch-and-learn':
						return row.lunchAndLearnIdeaId !== null;
					case 'coffee-tables':
						return row.coffeeTableGroupRequestId !== null;
				}
			});

			if (!kind) continue;

			const submissionId =
				row.cocReportId ??
				row.volunteerSignupId ??
				row.lunchAndLearnIdeaId ??
				row.coffeeTableGroupRequestId;

			entries.push({
				key: `submission-${row.id}`,
				createdAt: row.createdAt,
				type: row.type,
				body: row.body,
				actorName: row.actorName,
				href: `/admin/submissions/${kind}/${submissionId}`,
				subject: `${SUBMISSION_KINDS[kind].singular} ${row.reference}`,
			});
		}
	}

	return entries
		.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
		.slice(0, ACTIVITY_LIMIT);
}
