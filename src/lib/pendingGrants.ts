import { and, eq, isNull } from 'drizzle-orm';

import { db, pendingGrant, user } from '@/db';
import { parseRoles } from '@/lib/permissions';

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

/**
 * Copy the Slack member id onto the user and apply whatever was pre-provisioned
 * for it.
 *
 * Called from `databaseHooks.account.create.after`, not from the user hook: the
 * Slack member id only exists on the account, and a field Better Auth declares
 * `input: false` cannot be filled by `mapProfileToUser` — the same reason `role`
 * has never been set there either.
 *
 * Deliberately never throws. A failed claim must not fail sign-in; the grant is
 * left unclaimed, and `listAccessRows()` surfaces the person anyway so a
 * maintainer can set their roles by hand.
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

			if (holdsNothing && bootstrapAdminSlackIds().has(account.accountId)) {
				roleUpdate = {
					role: 'admin',
					roleGrantedBy: 'ADMIN_BOOTSTRAP_SLACK_IDS',
					roleGrantedAt: new Date(),
				};
			} else if (holdsNothing) {
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

				if (grant) {
					claimedGrantId = grant.id;
					roleUpdate = {
						role: grant.role,
						/**
						 * The grantor and the moment they decided, not the moment this
						 * person got round to signing in. "Granted" then means the same
						 * thing in the User Management table whether access was
						 * pre-provisioned or set after the fact.
						 */
						roleGrantedBy: grant.grantedBy,
						roleGrantedAt: grant.grantedAt,
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
		});
	} catch (error) {
		console.error('Failed to claim a Pending Grant', {
			slackUserId: account.accountId,
			error,
		});
	}
}
