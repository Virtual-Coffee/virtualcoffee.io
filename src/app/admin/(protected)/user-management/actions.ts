'use server';

import { and, eq, isNull } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { db, isUniqueViolation, pendingGrant, user } from '@/db';
import { getSlackMembers } from '@/data/slackMembers';
import { requirePermission, sessionRoles } from '@/lib/adminAccess';
import { userForSlackId } from '@/lib/admins';
import { claimPendingGrant } from '@/lib/pendingGrants';
import { isId } from '@/db/ids';
import {
	GRANTABLE_ROLE_NAMES,
	isRoleName,
	parseRoles,
	serialiseRoles,
	type RoleName,
} from '@/lib/permissions';
import type { ActionResult } from '@/lib/actionResult';

/**
 * Carry over any role this screen does not grant.
 *
 * The dropdown replaces the whole set rather than toggling one role, which is
 * what keeps the server from merging a stale client view — but it means an
 * empty selection, or a selection made while someone also holds `volunteer`,
 * would silently revoke a role granted somewhere else. `volunteer` is granted
 * from /admin/volunteers alongside a `volunteer` row; dropping it here would
 * leave that row active and accruing invites its owner can no longer spend.
 */
function preserveUngrantedRoles(
	current: string | null | undefined,
	requested: RoleName[],
): RoleName[] {
	const kept = parseRoles(current).filter(
		(role) => !GRANTABLE_ROLE_NAMES.has(role),
	);
	return [...new Set([...requested, ...kept])];
}

/**
 * Whitelist the requested roles, or say so. Shared by every action here, since
 * all four accept the same array off the same dropdown.
 *
 * A role that exists but is not grantable here (`volunteer`) is dropped rather
 * than refused: whether someone keeps it is decided from what is stored, by
 * `preserveUngrantedRoles`, so sending it grants nothing — but refusing it
 * would make the dropdown unusable for anyone who already holds it.
 */
function validateRoles(
	next: string[],
): { ok: true; roles: RoleName[] } | { ok: false; message: string } {
	const known = next.filter(isRoleName);

	if (known.length !== next.length) {
		return { ok: false, message: 'That is not a role we recognise.' };
	}

	return {
		ok: true,
		roles: known.filter((role) => GRANTABLE_ROLE_NAMES.has(role)),
	};
}

function revalidate() {
	revalidatePath('/admin/user-management');
	revalidatePath('/admin');
}

const STALE_ROLES =
	'Their roles changed while you were editing. Reload the page.';

/** `user.role` is nullable, and `eq(column, null)` never matches. */
function sameRole(column: typeof user.role, value: string | null) {
	return value === null ? isNull(column) : eq(column, value);
}

/** Replace someone's roles outright; `serialiseRoles` owns the encoding. */
export async function setUserRoles(
	userId: string,
	next: string[],
): Promise<ActionResult> {
	const session = await requirePermission('admins', 'manage');

	const validated = validateRoles(next);
	if (!validated.ok) return validated;
	const requested = validated.roles;

	/**
	 * Enforced here as well as hidden in the UI. The UI omits the control on
	 * your own row, but a forged request would otherwise let the last admin
	 * lock everyone out of /admin with no way back short of a SQL console.
	 */
	if (userId === session.user.id) {
		const current = sessionRoles(session);
		if (current.includes('admin') && !requested.includes('admin')) {
			return { ok: false, message: 'You cannot revoke your own admin access.' };
		}
	}

	const [target] = await db()
		.select({ role: user.role })
		.from(user)
		.where(eq(user.id, userId))
		.limit(1);

	if (!target) {
		return {
			ok: false,
			message: 'That person no longer exists. Reload the page.',
		};
	}

	const resulting = preserveUngrantedRoles(target.role, requested);
	const granting = resulting.length > 0;

	/**
	 * Pinned to the role string that was read. `resulting` was computed from it,
	 * and `grantVolunteerRole` writes the same column from its own transaction;
	 * an unpinned update would overwrite a `volunteer` added in between.
	 */
	const result = await db()
		.update(user)
		.set({
			role: serialiseRoles(resulting),
			roleGrantedAt: granting ? new Date() : null,
			roleGrantedBy: granting ? session.user.name || session.user.email : null,
		})
		.where(and(eq(user.id, userId), sameRole(user.role, target.role)));

	// A row that no longer matches is a stale page, not a success — saying
	// "ok" would leave the maintainer believing they had granted something.
	if (result.rowCount === 0) {
		return { ok: false, message: STALE_ROLES };
	}

	revalidate();
	return { ok: true };
}

/**
 * Pre-provision roles for a Slack member who has never signed in.
 *
 * The Grant is keyed on the Slack member id and carries a snapshot of their
 * name, so the row is readable without reaching Slack again. See `docs/adr/0009`.
 */
export async function grantPendingAccess(
	slackUserId: string,
	next: string[],
): Promise<ActionResult> {
	const session = await requirePermission('admins', 'manage');

	const validated = validateRoles(next);
	if (!validated.ok) return validated;
	const requested = validated.roles;

	if (requested.length === 0) {
		return { ok: false, message: 'Choose at least one role to grant.' };
	}

	/**
	 * Someone who has signed in has a user row, and a Grant against their Slack
	 * id would sit unclaimed forever — `claimPendingGrant` only ever runs when
	 * an account is first linked. Their roles are set in the table instead.
	 */
	const existing = await userForSlackId(slackUserId);
	if (existing) {
		return {
			ok: false,
			message: `${existing.name} has already signed in — set their roles in the table below.`,
		};
	}

	const member = (await getSlackMembers()).find(
		(candidate) => candidate.id === slackUserId,
	);

	if (!member) {
		return {
			ok: false,
			message: 'That is not someone in the Virtual Coffee Slack workspace.',
		};
	}

	try {
		await db()
			.insert(pendingGrant)
			.values({
				slackUserId: member.id,
				slackDisplayName: member.displayName,
				slackHandle: member.handle,
				role: serialiseRoles(requested),
				grantedBy: session.user.name || session.user.email,
			});
	} catch (error) {
		// The partial unique index is the authority on one-unclaimed-grant-each,
		// so a race lands here rather than creating a second row.
		if (!isUniqueViolation(error)) throw error;
		return {
			ok: false,
			message: `${member.displayName} already has access pending. Edit it in the table below.`,
		};
	}

	/**
	 * Their first sign-in may have landed between the check above and the
	 * insert, in which case `claimPendingGrant` ran against no grant. Their
	 * Slack id is written before that claim looks for one, so whichever order
	 * the two commits took, one of the two claims sees the other's write.
	 */
	const signedIn = await userForSlackId(member.id);
	if (signedIn) {
		const claimed = await claimPendingGrant({
			providerId: 'slack',
			accountId: member.id,
			userId: signedIn.id,
		});
		if (!claimed) {
			// The grant is written, so the table shows them as stranded either way.
			revalidate();
			return {
				ok: false,
				message: `${member.displayName} signed in while this was being saved and the grant could not be applied. They are listed below as stranded — set their roles there.`,
			};
		}
	}

	revalidate();
	return { ok: true };
}

/** Change the roles on a Grant nobody has claimed yet. */
export async function setPendingGrantRoles(
	grantId: string,
	next: string[],
): Promise<ActionResult> {
	await requirePermission('admins', 'manage');

	if (!isId(grantId)) {
		return {
			ok: false,
			message: 'That grant no longer exists. Reload the page.',
		};
	}

	const validated = validateRoles(next);
	if (!validated.ok) return validated;

	const [grant] = await db()
		.select({ role: pendingGrant.role })
		.from(pendingGrant)
		.where(and(eq(pendingGrant.id, grantId), isNull(pendingGrant.claimedAt)))
		.limit(1);

	if (!grant) {
		return {
			ok: false,
			message: 'That grant has already been claimed. Reload the page.',
		};
	}

	// Judged on what would be stored, not what was asked for: a Volunteer's
	// grant with its last grantable role unticked still holds `volunteer`.
	const resulting = preserveUngrantedRoles(grant.role, validated.roles);

	if (resulting.length === 0) {
		return {
			ok: false,
			message: 'Revoke the grant instead of leaving it with no roles.',
		};
	}

	// Pinned to the role that was read, for the same reason as `setUserRoles`.
	const result = await db()
		.update(pendingGrant)
		.set({ role: serialiseRoles(resulting) })
		.where(
			and(
				eq(pendingGrant.id, grantId),
				isNull(pendingGrant.claimedAt),
				eq(pendingGrant.role, grant.role),
			),
		);

	if (result.rowCount === 0) {
		return { ok: false, message: STALE_ROLES };
	}

	revalidate();
	return { ok: true };
}

/**
 * Withdraw a Grant nobody has claimed.
 *
 * A hard delete: it never took effect, so there is nothing to keep a record of.
 * Claimed Grants are never deleted — they are the record of who pre-provisioned
 * whom, and the User Management table reads the grantor off them.
 */
export async function revokePendingGrant(
	grantId: string,
): Promise<ActionResult> {
	await requirePermission('admins', 'manage');

	if (!isId(grantId)) {
		return {
			ok: false,
			message: 'That grant no longer exists. Reload the page.',
		};
	}

	const [grant] = await db()
		.select({ role: pendingGrant.role })
		.from(pendingGrant)
		.where(and(eq(pendingGrant.id, grantId), isNull(pendingGrant.claimedAt)))
		.limit(1);

	if (!grant) {
		return {
			ok: false,
			message: 'That grant has already been claimed. Reload the page.',
		};
	}

	/**
	 * "Revoke all" reaches this action rather than `setPendingGrantRoles`, so it
	 * is the one path that could delete a role this screen does not grant. A
	 * Grant carrying `volunteer` belongs to a `volunteer` row created in the
	 * same transaction; deleting it here would leave that row behind.
	 */
	const ungranted = parseRoles(grant.role).filter(
		(role) => !GRANTABLE_ROLE_NAMES.has(role),
	);

	if (ungranted.length > 0) {
		return {
			ok: false,
			message:
				'This grant includes Volunteer access. Remove it in Admin → Volunteers.',
		};
	}

	// The role check above only holds for the role that was read.
	const result = await db()
		.delete(pendingGrant)
		.where(
			and(
				eq(pendingGrant.id, grantId),
				isNull(pendingGrant.claimedAt),
				eq(pendingGrant.role, grant.role),
			),
		);

	if (result.rowCount === 0) {
		return { ok: false, message: STALE_ROLES };
	}

	revalidate();
	return { ok: true };
}
