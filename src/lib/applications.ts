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
	invite,
	membershipApplication,
	user,
	volunteer,
	type ApplicationStatus,
	type MembershipApplication,
} from '@/db';
import { isId } from '@/db/ids';

export const QUEUE_STATUSES: ApplicationStatus[] = [
	'waitlisted',
	'coffee_invited',
];

/**
 * Everything the queue is not. The Waitlist is a working queue and the Archive
 * is its history (CONTEXT.md), so the two never show the same row.
 */
export const ARCHIVE_STATUSES: ApplicationStatus[] = [
	'member',
	'lapsed',
	'declined',
	'withdrawn',
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
			// The id is the tie-break (ADR 0008): `submittedAt` is not unique, and
			// without a total order a row can straddle two pages of the queue.
			.orderBy(
				desc(membershipApplication.isPriority),
				order(SORT_COLUMNS[filters.sort]),
				desc(membershipApplication.id),
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

/**
 * Null for an id that is not one, rather than a thrown 22P02: every waitlist
 * server action reads its id from the client and comes through here.
 */
export async function getApplication(id: string) {
	if (!isId(id)) return null;

	const [row] = await db()
		.select()
		.from(membershipApplication)
		.where(eq(membershipApplication.id, id))
		.limit(1);

	return row ?? null;
}

export type ApplicationInviter = {
	/** What to show. The Volunteer's current name where we have one. */
	name: string;
	/** Set only when the inviter resolves to a Volunteer on the roster. */
	volunteerId: string | null;
};

/**
 * Who invited this applicant, for an application that came from an Invite.
 *
 * Not the `referrer` column. That is display text for the detail page's
 * "Referrer" row: Airtable's own free-text `referrer` for imported rows
 * ("Podcast", "a friend"), and the inviter's name for an application that
 * came in through a Claim Link, so the row reads the same for historic and
 * new applications. The join form has no referrer field. The inviter as a
 * fact — who, and which Invite — lives on the Invite, and is read from here.
 *
 * Prefers the Volunteer's current display name over `invite.inviter_name`,
 * which is a snapshot taken when the Invite was created and goes stale on a
 * rename. Falls back to the snapshot for the imported Invites the reviewed
 * mapping could not resolve to a Slack member, which have a name and nothing
 * else.
 */
export async function getApplicationInviter(
	inviteId: string | null,
): Promise<ApplicationInviter | null> {
	if (!inviteId) return null;

	const [row] = await db()
		.select({
			inviterName: invite.inviterName,
			volunteerId: volunteer.id,
			volunteerName: volunteer.slackDisplayName,
		})
		.from(invite)
		.leftJoin(volunteer, eq(volunteer.slackUserId, invite.inviterSlackUserId))
		.where(eq(invite.id, inviteId))
		.limit(1);

	if (!row) return null;

	const name = row.volunteerName ?? row.inviterName;
	if (!name) return null;

	return { name, volunteerId: row.volunteerId };
}

export type HistoryEntry = {
	id: string;
	type: string;
	body: string | null;
	fromStatus: ApplicationStatus | null;
	toStatus: ApplicationStatus | null;
	createdAt: Date;
	actorName: string | null;
};

export async function getApplicationHistory(
	applicationId: string,
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
		.orderBy(desc(applicationEvent.createdAt), desc(applicationEvent.id));
}
