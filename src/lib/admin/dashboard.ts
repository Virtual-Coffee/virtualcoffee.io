import { DateTime } from 'luxon';

import { getEvents } from '@/data/events';
import { DISPLAY_ZONE } from '@/util/date';
import { statusCounts } from '@/lib/waitlist/applications';
import { recentEvents } from '@/lib/history/eventLog';
import { activeVolunteerCount } from '@/lib/volunteers/volunteers';
import type { Section } from '@/lib/access/permissions';
import { applicationPath, submissionPath } from '@/lib/admin/links';
import {
	openCount,
	SUBMISSION_KINDS,
	visibleSubmissionKinds,
	type SubmissionKind,
} from '@/lib/submissions/submissions';

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
	// The queue's own grouped count: one query cannot disagree with itself
	// about a row that changed status between the two figures.
	const counts = await statusCounts();

	return {
		section: 'waitlist',
		label: 'Waitlist',
		href: '/admin/waitlist',
		figures: [
			// Awaiting a first decision — nobody has looked at them yet.
			{ count: counts.waitlisted ?? 0, label: 'waiting' },
			// Sent a Coffee invite, awaiting a Membership Approval after it.
			{ count: counts.coffee_invited ?? 0, label: 'pending' },
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
	// The calendar's own cached read, so a card render costs no API call; every
	// admin write revalidates the tag, so the count is current after an edit.
	events: async () => {
		const weekEnd = DateTime.now().setZone(DISPLAY_ZONE).plus({ days: 7 });
		const events = await getEvents({ limit: 50 });
		return {
			section: 'events',
			label: 'Events',
			href: '/admin/events',
			figures: [
				{
					count: events.filter(
						(event) => DateTime.fromISO(event.start) < weekEnd,
					).length,
					label: 'in the next 7 days',
				},
			],
		};
	},
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
 * The Event Log reads and merges the rows (`recentEvents`); what is left here
 * is the part that is the dashboard's own: which Sections the viewer holds,
 * where an entry links to, and how its subject is named.
 */
export async function recentActivity(
	sections: readonly Section[],
): Promise<ActivityEntry[]> {
	const visibleKinds = visibleSubmissionKinds(sections);
	const kindByEventKey = new Map(
		visibleKinds.map((kind) => [SUBMISSION_KINDS[kind].eventKey, kind]),
	);

	const rows = await recentEvents({
		applications: sections.includes('waitlist'),
		submissions: visibleKinds.map((kind) => SUBMISSION_KINDS[kind]),
		limit: ACTIVITY_LIMIT,
	});

	return rows.flatMap((row): ActivityEntry[] => {
		const shared = {
			key: `${row.kind}-${row.id}`,
			createdAt: row.createdAt,
			type: row.type,
			body: row.body,
			actorName: row.actorName,
		};

		if (row.kind === 'application') {
			return [
				{
					...shared,
					href: applicationPath(row.subjectId),
					subject: row.name ?? `Application ${row.reference}`,
				},
			];
		}

		const kind = kindByEventKey.get(row.eventKey);
		if (!kind) return [];

		return [
			{
				...shared,
				href: submissionPath(kind, row.subjectId),
				subject: `${SUBMISSION_KINDS[kind].singular} ${row.reference}`,
			},
		];
	});
}
