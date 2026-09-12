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
	visibleSubmissionKinds,
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

async function waitlistCard(): Promise<DashboardCard> {
	// Grouped rather than two counts: the two figures are halves of the same
	// set, and one query cannot disagree with itself about a row that changed
	// status between them.
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
		section: 'waitlist',
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

function submissionCard(kind: SubmissionKind): () => Promise<DashboardCard> {
	const { section, label } = SUBMISSION_KINDS[kind];
	return async () => ({
		section,
		label,
		href: `/admin/submissions/${kind}`,
		figures: [{ count: await openCount(kind), label: 'awaiting a response' }],
	});
}

/**
 * One card per Section, or null for a Section that is a list of people rather
 * than a queue of work. Keyed on `Section` so that adding one without deciding
 * its card is a type error rather than a card that silently never renders.
 */
const CARDS: Record<Section, (() => Promise<DashboardCard>) | null> = {
	waitlist: waitlistCard,
	coc: submissionCard('coc'),
	volunteerSignups: submissionCard('volunteers'),
	lunchAndLearn: submissionCard('lunch-and-learn'),
	coffeeTables: submissionCard('coffee-tables'),
	// A roster, not a queue: how many can currently give out Invites.
	volunteers: async () => ({
		section: 'volunteers',
		label: 'Volunteers',
		href: '/admin/volunteers',
		figures: [{ count: await activeVolunteerCount(), label: 'active' }],
	}),
	admins: null,
};

/**
 * One card per section the viewer holds `read` on. Built from the caller's
 * already-computed section list, so the dashboard can never show a card the
 * nav hides.
 */
export async function dashboardCards(
	sections: readonly Section[],
): Promise<DashboardCard[]> {
	return Promise.all(
		sections.flatMap((section) => {
			const build = CARDS[section];
			return build ? [build()] : [];
		}),
	);
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

	const visibleKinds = visibleSubmissionKinds(sections);

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
			const kind = visibleKinds.find(
				(candidate) => row[SUBMISSION_KINDS[candidate].eventKey] !== null,
			);

			if (!kind) continue;

			const submissionId = row[SUBMISSION_KINDS[kind].eventKey];

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
