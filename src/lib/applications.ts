import {
	and,
	asc,
	count,
	desc,
	eq,
	ilike,
	inArray,
	or,
	sql,
} from 'drizzle-orm';

import {
	applicationEvent,
	db,
	membershipApplication,
	user,
	type ApplicationStatus,
	type MembershipApplication,
} from '@/db';

export const QUEUE_STATUSES: ApplicationStatus[] = [
	'waitlisted',
	'coffee_invited',
];

export const PAGE_SIZE = 50;

export type SortField = 'name' | 'email' | 'status' | 'source' | 'submittedAt';

export type ListFilters = {
	statuses?: ApplicationStatus[];
	source?: 'waitlist_signup' | 'volunteer_invite';
	search?: string;
	page: number;
	pageSize: number;
	sort: SortField;
	direction: 'asc' | 'desc';
};

const SORT_COLUMNS = {
	name: membershipApplication.name,
	email: membershipApplication.email,
	status: membershipApplication.status,
	source: membershipApplication.source,
	submittedAt: membershipApplication.submittedAt,
} as const;

function buildWhere(filters: ListFilters) {
	const clauses = [];

	if (filters.statuses?.length) {
		clauses.push(inArray(membershipApplication.status, filters.statuses));
	}

	if (filters.source) {
		clauses.push(eq(membershipApplication.source, filters.source));
	}

	const search = filters.search?.trim();
	if (search) {
		const pattern = `%${search}%`;
		clauses.push(
			or(
				ilike(membershipApplication.name, pattern),
				ilike(membershipApplication.email, pattern),
				ilike(membershipApplication.githubUsername, pattern),
			),
		);
	}

	return clauses.length ? and(...clauses) : undefined;
}

export type ApplicationListResult = {
	rows: MembershipApplication[];
	rowCount: number;
};

/**
 * Filtering, sorting and pagination all happen here rather than in the table
 * component. The table runs in manual mode: it renders exactly the rows this
 * returns and is told the total separately, so it never sees the other 2,500.
 */
export async function listApplications(
	filters: ListFilters,
): Promise<ApplicationListResult> {
	const database = db();
	const where = buildWhere(filters);
	const order = filters.direction === 'asc' ? asc : desc;

	const [rows, [totals]] = await Promise.all([
		database
			.select()
			.from(membershipApplication)
			.where(where)
			// Volunteer invites sort to the front of the queue no matter what else
			// is applied; that priority is the point of the invite.
			.orderBy(
				desc(membershipApplication.isPriority),
				order(SORT_COLUMNS[filters.sort]),
			)
			.limit(filters.pageSize)
			.offset(filters.page * filters.pageSize),
		database
			.select({ value: count() })
			.from(membershipApplication)
			.where(where),
	]);

	return { rows, rowCount: totals?.value ?? 0 };
}

/** Counts for the queue's filter chips. */
export async function statusCounts(): Promise<Record<string, number>> {
	const rows = await db()
		.select({
			status: membershipApplication.status,
			value: count(),
		})
		.from(membershipApplication)
		.groupBy(membershipApplication.status);

	const counts: Record<string, number> = {};
	let total = 0;
	for (const row of rows) {
		counts[row.status] = row.value;
		total += row.value;
	}
	counts.all = total;
	return counts;
}

export async function getApplication(id: number) {
	const [row] = await db()
		.select()
		.from(membershipApplication)
		.where(eq(membershipApplication.id, id))
		.limit(1);

	return row ?? null;
}

export type HistoryEntry = {
	id: number;
	type: string;
	body: string | null;
	fromStatus: ApplicationStatus | null;
	toStatus: ApplicationStatus | null;
	createdAt: Date;
	actorName: string | null;
};

export async function getApplicationHistory(
	applicationId: number,
): Promise<HistoryEntry[]> {
	return db()
		.select({
			id: applicationEvent.id,
			type: sql<string>`${applicationEvent.type}`,
			body: applicationEvent.body,
			fromStatus: applicationEvent.fromStatus,
			toStatus: applicationEvent.toStatus,
			createdAt: applicationEvent.createdAt,
			actorName: user.name,
		})
		.from(applicationEvent)
		.leftJoin(user, eq(applicationEvent.actorUserId, user.id))
		.where(eq(applicationEvent.applicationId, applicationId))
		.orderBy(desc(applicationEvent.createdAt));
}
