import { and, eq, isNull } from 'drizzle-orm';

import { db, pendingGrant, user, volunteer, type Database } from '@/db';
import { parseRoles, serialiseRoles, type RoleName } from '@/lib/permissions';

/**
 * Pending Grants: a Role assigned to a Slack member id before that person has
 * ever signed in, applied the first time they do. See `docs/adr/0009`.
 */

/**
 * Slack member ids that become admins the first time they sign in.
 *
 * Bootstrap only, and really only for the very first admin — there is nobody to
 * create a Pending Grant on an empty database. Once someone is an admin, roles
 * are granted and revoked in /admin and live in the database; removing an id
 * here revokes nothing.
 *
 * Read at call time rather than module scope so a changed environment variable
 * takes effect without a restart.
 */
function bootstrapAdminSlackIds(): Set<string> {
	return new Set(
		(process.env.ADMIN_BOOTSTRAP_SLACK_IDS ?? '')
			.split(',')
			.map((entry) => entry.trim())
			.filter(Boolean),
	);
}

type RoleUpdate = {
	role: string;
	roleGrantedBy: string;
	roleGrantedAt: Date;
};

/** The handle `db().transaction()` passes to its callback. */
type Transaction = Parameters<Parameters<Database['transaction']>[0]>[0];

/** Add `volunteer` to whatever someone already holds, without dropping any of it. */
export function withVolunteerRole(current: string | null | undefined): string {
	const held = parseRoles(current);
	return serialiseRoles([...new Set<RoleName>([...held, 'volunteer'])]);
}

export function withoutVolunteerRole(
	current: string | null | undefined,
): string {
	return serialiseRoles(parseRoles(current).filter((r) => r !== 'volunteer'));
}

/**
 * Give someone the `volunteer` role, the way access is always given: directly
 * on the user if they have signed in, otherwise as a Pending Grant keyed on the
 * Slack member id that `claimPendingGrant()` applies at their first sign-in.
 *
 * Takes the caller's transaction rather than opening one, because the role is
 * only half of a Volunteer — the caller is also writing the `volunteer` row,
 * and either on its own is a broken state (docs/adr/0010). Shared by
 * /admin/volunteers and the Airtable import, which has no session and so
 * names itself as the grantor.
 *
 * Safe to repeat: an existing role string or Grant is merged into, not
 * duplicated, so a re-run over people already granted changes nothing.
 */
export async function grantVolunteerRole(
	tx: Transaction,
	member: {
		slackUserId: string;
		slackDisplayName: string;
		slackHandle: string | null;
	},
	grantedBy: string,
): Promise<void> {
	const [existing] = await tx
		.select({ id: user.id, role: user.role })
		.from(user)
		.where(eq(user.slackUserId, member.slackUserId))
		.limit(1);

	if (existing) {
		await tx
			.update(user)
			.set({
				role: withVolunteerRole(existing.role),
				roleGrantedAt: new Date(),
				roleGrantedBy: grantedBy,
			})
			.where(eq(user.id, existing.id));
		return;
	}

	/**
	 * A Grant may already exist from User Management for their other roles.
	 * Adding to it rather than inserting a second one, because the partial
	 * unique index allows only one unclaimed Grant per Slack member.
	 */
	const [grant] = await tx
		.select({ id: pendingGrant.id, role: pendingGrant.role })
		.from(pendingGrant)
		.where(
			and(
				eq(pendingGrant.slackUserId, member.slackUserId),
				isNull(pendingGrant.claimedAt),
			),
		)
		.limit(1);

	if (grant) {
		await tx
			.update(pendingGrant)
			.set({ role: withVolunteerRole(grant.role) })
			.where(eq(pendingGrant.id, grant.id));
		return;
	}

	await tx.insert(pendingGrant).values({
		slackUserId: member.slackUserId,
		slackDisplayName: member.slackDisplayName,
		slackHandle: member.slackHandle,
		role: serialiseRoles(['volunteer']),
		grantedBy,
	});
}

/**
 * Copy the Slack member id onto the user and apply whatever was pre-provisioned
 * for it. Called from `databaseHooks.account.create.after` (docs/adr/0009).
 *
 * Deliberately never throws: a failed claim must not fail sign-in. The grant
 * stays unclaimed and `listAccessRows()` surfaces the person anyway.
 */
export async function claimPendingGrant(account: {
	providerId: string;
	accountId: string;
	userId: string;
}): Promise<void> {
	if (account.providerId !== 'slack') return;

	try {
		await db().transaction(async (tx) => {
			const [existing] = await tx
				.select({ role: user.role })
				.from(user)
				.where(eq(user.id, account.userId))
				.limit(1);

			if (!existing) return;

			/**
			 * Only ever grants, never revokes. `account.create` also fires when an
			 * account is linked to a user that already exists, and rewriting the
			 * roles of someone a maintainer has already given access to — from an
			 * environment variable, or from a grant that predates that decision —
			 * would be a silent demotion.
			 */
			const holdsNothing = parseRoles(existing.role).length === 0;

			let roleUpdate: RoleUpdate | null = null;
			let claimedGrantId: string | null = null;

			if (holdsNothing) {
				const [grant] = await tx
					.select()
					.from(pendingGrant)
					.where(
						and(
							eq(pendingGrant.slackUserId, account.accountId),
							isNull(pendingGrant.claimedAt),
						),
					)
					.limit(1);

				// Both can apply at once — a bootstrap admin who was also given
				// `volunteer` from /admin/volunteers before signing in. The grant is
				// claimed either way, or it would sit unclaimed forever and show as
				// stranded in User Management.
				const bootstrapAdmin = bootstrapAdminSlackIds().has(account.accountId);
				const granted: RoleName[] = [
					...(bootstrapAdmin ? (['admin'] as const) : []),
					...parseRoles(grant?.role),
				];

				if (grant) {
					claimedGrantId = grant.id;
					roleUpdate = {
						role: serialiseRoles(granted),
						/**
						 * The grantor and the moment they decided, not the moment this
						 * person got round to signing in. "Granted" then means the same
						 * thing in the User Management table whether access was
						 * pre-provisioned or set after the fact.
						 */
						roleGrantedBy: grant.grantedBy,
						roleGrantedAt: grant.grantedAt,
					};
				} else if (bootstrapAdmin) {
					roleUpdate = {
						role: serialiseRoles(granted),
						roleGrantedBy: 'ADMIN_BOOTSTRAP_SLACK_IDS',
						roleGrantedAt: new Date(),
					};
				}
			}

			await tx
				.update(user)
				.set({ slackUserId: account.accountId, ...(roleUpdate ?? {}) })
				.where(eq(user.id, account.userId));

			if (claimedGrantId) {
				await tx
					.update(pendingGrant)
					.set({ claimedAt: new Date(), claimedUserId: account.userId })
					.where(eq(pendingGrant.id, claimedGrantId));
			}

			/**
			 * A Volunteer may have been designated — and carry an imported balance —
			 * long before this moment. The `volunteer` row is keyed on the Slack
			 * member id precisely so that it can exist first; this is the point at
			 * which it can finally learn the user id.
			 *
			 * Unconditional, not gated on `holdsNothing`: linking a row to its
			 * owner is not a grant, and someone who already had access can still be
			 * signing in with Slack for the first time.
			 */
			await tx
				.update(volunteer)
				.set({ userId: account.userId })
				.where(eq(volunteer.slackUserId, account.accountId));
		});
	} catch (error) {
		console.error('Failed to claim a Pending Grant', {
			slackUserId: account.accountId,
			error,
		});
	}
}
