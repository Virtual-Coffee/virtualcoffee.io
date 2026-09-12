import type { Section } from '@/lib/permissions';

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

/**
 * One card per Section, or null for a Section that is a list of people rather
 * than a queue of work. Keyed on `Section` so that adding one without deciding
 * its card is a type error rather than a card that silently never renders.
 *
 * A Section whose pages have not landed yet is null too, and gets its card in
 * the same change as its pages.
 */
const CARDS: Record<Section, (() => Promise<DashboardCard>) | null> = {
	waitlist: null,
	coc: null,
	volunteerSignups: null,
	lunchAndLearn: null,
	coffeeTables: null,
	volunteers: null,
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
 * Each Section that keeps an event log contributes its rows here, merged in
 * JavaScript rather than as a SQL UNION: the event tables have different
 * shapes and different foreign keys, and at fifteen rows the cost of
 * over-fetching a little from each is irrelevant next to the complexity of
 * keeping a union in step with all of them. No Section with a log has landed
 * yet.
 */
export async function recentActivity(
	// Consulted by each Section's branch as it lands.
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	sections: readonly Section[],
): Promise<ActivityEntry[]> {
	const entries: ActivityEntry[] = [];

	return entries
		.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
		.slice(0, ACTIVITY_LIMIT);
}
