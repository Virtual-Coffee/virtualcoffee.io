import { and, eq, isNotNull, isNull, ne, or } from 'drizzle-orm';

import { db, pendingGrant, user } from '@/db';
import { getSlackMembers, type SlackMember } from '@/data/slackMembers';
import { DEFAULT_ROLE, parseRoles, type RoleName } from '@/lib/permissions';

/**
 * A row on the User Management screen: everyone who can reach /admin, signed
 * in or not. `kind` is what the row's controls dispatch on.
 */
export type AccessRow = {
	/** A user id for `kind: 'user'`, a Pending Grant id otherwise. */
	id: string;
	name: string;
	roles: RoleName[];
	grantedAt: Date | null;
	grantedBy: string | null;
} & (
	| { kind: 'user'; email: string; handle: null; stranded: boolean }
	| { kind: 'pending'; email: null; handle: string | null; stranded: false }
);

/** A Slack member the "Grant access" picker can offer. */
export type GrantCandidate = SlackMember & {
	/**
	 * They already have a user row, so a Pending Grant would never be claimed.
	 * Shown but not selectable, so the server's refusal is not a surprise.
	 */
	hasAccount: boolean;
	/** An unclaimed Grant already exists — edit it in the table instead. */
	hasPendingGrant: boolean;
};

const USER_COLUMNS = {
	id: user.id,
	name: user.name,
	email: user.email,
	role: user.role,
	slackUserId: user.slackUserId,
	roleGrantedAt: user.roleGrantedAt,
	roleGrantedBy: user.roleGrantedBy,
};

/**
 * Everyone who can reach /admin, plus everyone pre-provisioned to.
 *
 * The role filter is in JavaScript rather than SQL because roles are stored as
 * a comma-separated string — `role = 'admin'` would miss someone who is
 * `admin,coc_reviewer`, which is exactly the case this screen exists to manage.
 */
export async function listAccessRows(): Promise<AccessRow[]> {
	const [userRows, grants] = await Promise.all([
		/**
		 * Role-holders, plus anyone whose Slack member id matches an unclaimed
		 * Grant. That second group is the recovery path for a claim that failed:
		 * they hold nothing, so the picker refuses them as already signed in, and
		 * without this they would appear in neither place and could never be
		 * given the access somebody already decided they should have.
		 */
		db()
			.select(USER_COLUMNS)
			.from(user)
			.leftJoin(
				pendingGrant,
				and(
					eq(pendingGrant.slackUserId, user.slackUserId),
					isNull(pendingGrant.claimedAt),
				),
			)
			.where(
				or(
					and(isNotNull(user.role), ne(user.role, DEFAULT_ROLE)),
					isNotNull(pendingGrant.id),
				),
			)
			.orderBy(user.name),
		listPendingGrants(),
	]);

	const rows: AccessRow[] = [];

	for (const row of userRows) {
		const roles = parseRoles(row.role);

		rows.push({
			kind: 'user',
			id: row.id,
			name: row.name,
			email: row.email,
			handle: null,
			roles,
			// Somebody pre-provisioned them, but they signed in holding nothing.
			stranded: roles.length === 0,
			grantedAt: row.roleGrantedAt,
			grantedBy: row.roleGrantedBy,
		});
	}

	/** Their user row is already listed above, badged as stranded. */
	const strandedSlackIds = new Set(
		userRows.filter((row) => row.slackUserId).map((row) => row.slackUserId),
	);

	for (const grant of grants) {
		if (strandedSlackIds.has(grant.slackUserId)) continue;

		rows.push({
			kind: 'pending',
			id: grant.id,
			name: grant.slackDisplayName,
			email: null,
			handle: grant.slackHandle,
			roles: parseRoles(grant.role),
			stranded: false,
			grantedAt: grant.grantedAt,
			grantedBy: grant.grantedBy,
		});
	}

	return rows.sort((a, b) => a.name.localeCompare(b.name));
}

/** Every Grant nobody has claimed yet. */
export async function listPendingGrants() {
	return db()
		.select()
		.from(pendingGrant)
		.where(isNull(pendingGrant.claimedAt))
		.orderBy(pendingGrant.slackDisplayName);
}

/**
 * The Slack workspace, annotated with what the site already knows about each
 * member.
 *
 * Candidates come from Slack rather than from `user`, which is the whole point
 * of the feature: someone who has never visited the site has nothing to attach
 * a role to, but they do have a Slack member id.
 */
export async function grantCandidates(): Promise<GrantCandidate[]> {
	const [members, linked, grants] = await Promise.all([
		getSlackMembers(),
		db()
			.select({ slackUserId: user.slackUserId })
			.from(user)
			.where(isNotNull(user.slackUserId)),
		listPendingGrants(),
	]);

	const withAccounts = new Set(linked.map((row) => row.slackUserId));
	const withGrants = new Set(grants.map((grant) => grant.slackUserId));

	return members.map((member) => ({
		...member,
		hasAccount: withAccounts.has(member.id),
		hasPendingGrant: withGrants.has(member.id),
	}));
}

/** The user holding a Slack member id, if that member has ever signed in. */
export async function userForSlackId(slackUserId: string) {
	const [row] = await db()
		.select({ id: user.id, name: user.name, role: user.role })
		.from(user)
		.where(eq(user.slackUserId, slackUserId))
		.limit(1);

	return row ?? null;
}
