import { and, desc, eq, ilike, inArray, or } from 'drizzle-orm';

import {
	db,
	invite,
	membershipApplication,
	volunteer,
	type ApplicationStatus,
	type MembershipApplication,
} from '@/db';
import { isId } from '@/db/ids';
import type { ApplicationSubject } from '@/lib/eventLog';
import { pagedList } from '@/lib/pagedList';
import { countByStatus } from '@/lib/statusCounts';

/** The Subject a Membership Application's events are recorded and read against. */
export function applicationSubject(id: string): ApplicationSubject {
	return { kind: 'application', id };
}

export type SortField = 'name' | 'email' | 'status' | 'source' | 'submittedAt';

export type ListFilters = {
	statuses?: ApplicationStatus[];
	source?: 'waitlist_signup' | 'volunteer_invite';
	search?: string;
	page: number;
	pageSize: number;
	sort: SortField;
	direction: 'asc' | 'desc';
	/** Priority (invited) applications first, ahead of the column sort. */
	priorityFirst?: boolean;
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
 * Filtering and sorting happen here rather than in the table component, and
 * the paging itself is `pagedList`. What is this module's own is which columns
 * an application may be sorted by and that an invite sorts ahead of them.
 */
export async function listApplications(
	filters: ListFilters,
): Promise<ApplicationListResult> {
	return pagedList(membershipApplication, {
		where: buildWhere(filters),
		sort: SORT_COLUMNS[filters.sort],
		direction: filters.direction,
		leading: filters.priorityFirst
			? [desc(membershipApplication.isPriority)]
			: [],
		page: filters.page,
		pageSize: filters.pageSize,
	});
}

/** Counts for the queue's filter chips. */
export async function statusCounts(): Promise<Record<string, number>> {
	return countByStatus(membershipApplication);
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
