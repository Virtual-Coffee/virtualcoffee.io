'use server';

import { and, eq, isNull } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { db, isUniqueViolation, pendingGrant, user } from '@/db';
import { getSlackMembers } from '@/data/slackMembers';
import { requirePermission, sessionRoles } from '@/lib/access/adminAccess';
import { userForSlackId } from '@/lib/access/admins';
import {
	claimGrant,
	findUnclaimedGrant,
	lockSlackMember,
} from '@/lib/access/pendingGrants';
import { grantDmMessage, sendSlackDm } from '@/lib/slack/dm';
import { isId } from '@/db/ids';
import {
	GRANTABLE_ROLE_NAMES,
	isRoleName,
	parseRoles,
	serialiseRoles,
	type RoleName,
} from '@/lib/access/permissions';
import type { ActionResult } from '@/lib/admin/actionResult';

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

	const result = await db().transaction(async (tx): Promise<ActionResult> => {
		const [target] = await tx
			.select({ role: user.role, slackUserId: user.slackUserId })
			.from(user)
			.where(eq(user.id, userId))
			.limit(1);

		if (!target) {
			return {
				ok: false,
				message: 'That person no longer exists. Reload the page.',
			};
		}

		/**
		 * A Grant beside a signed-in user is one their first sign-in failed to
		 * claim; this edit is the recovery. Its roles join what is carried over,
		 * so a `volunteer` it holds survives the replace, and it is claimed below
		 * — a Grant left unclaimed would be hidden once they hold a role.
		 */
		let grant = null;
		if (target.slackUserId) {
			await lockSlackMember(tx, target.slackUserId);
			grant = await findUnclaimedGrant(tx, target.slackUserId);
		}

		const resulting = preserveUngrantedRoles(
			[target.role, grant?.role].filter(Boolean).join(','),
			requested,
		);
		const granting = resulting.length > 0;

		/**
		 * Pinned to the role string that was read. `resulting` was computed from
		 * it, and `grantVolunteerRole` writes the same column from its own
		 * transaction; an unpinned update would overwrite a `volunteer` added in
		 * between.
		 */
		const updated = await tx
			.update(user)
			.set({
				role: serialiseRoles(resulting),
				roleGrantedAt: granting ? new Date() : null,
				roleGrantedBy: granting
					? session.user.name || session.user.email
					: null,
			})
			.where(and(eq(user.id, userId), sameRole(user.role, target.role)));

		// A row that no longer matches is a stale page, not a success — saying
		// "ok" would leave the maintainer believing they had granted something.
		if (updated.rowCount === 0) {
			return { ok: false, message: STALE_ROLES };
		}

		if (grant) {
			// Claimed only if something was applied. "Revoke all" on a stranded
			// row withdraws a Grant that never took effect, as it does for a
			// pending one — a claimed Grant is the record of who granted what.
			if (granting) await claimGrant(tx, grant.id, userId);
			else await tx.delete(pendingGrant).where(eq(pendingGrant.id, grant.id));
		}

		return { ok: true };
	});

	if (result.ok) revalidate();
	return result;
}

/**
 * Give roles to a Slack member: directly on their user row if they have signed
 * in holding nothing, otherwise as a Pending Grant keyed on their Slack member
 * id, carrying a snapshot of their name so the row is readable without
 * reaching Slack again. See `docs/adr/0009`.
 *
 * Someone already holding a role is in the table, and is edited there — a
 * one-role picker is the wrong control for changing an existing set.
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

	const member = (await getSlackMembers()).find(
		(candidate) => candidate.id === slackUserId,
	);

	if (!member) {
		return {
			ok: false,
			message: 'That is not someone in the Virtual Coffee Slack workspace.',
		};
	}

	const grantedBy = session.user.name || session.user.email;
	const alreadyPending: ActionResult = {
		ok: false,
		message: `${member.displayName} already has access pending. Edit it in the table below.`,
	};

	let result: ActionResult;
	let preProvisioned = false;

	try {
		/**
		 * The lock covers "have they signed in?" and the write that depends on
		 * the answer. `claimPendingGrant` stores the Slack id before it takes
		 * the same lock, so a first sign-in either lands before this looks and
		 * is granted directly, or waits on the lock and claims the Grant.
		 */
		result = await db().transaction(async (tx): Promise<ActionResult> => {
			await lockSlackMember(tx, member.id);

			const existing = await userForSlackId(member.id, tx);

			if (existing && parseRoles(existing.role).length > 0) {
				return {
					ok: false,
					message: `${existing.name} has already signed in — set their roles in the table below.`,
				};
			}

			// A stranded user is in the table too, with the Grant that failed to
			// apply; it is edited there, which applies the Grant.
			if (await findUnclaimedGrant(tx, member.id)) return alreadyPending;

			if (existing) {
				await tx
					.update(user)
					.set({
						role: serialiseRoles(requested),
						roleGrantedAt: new Date(),
						roleGrantedBy: grantedBy,
					})
					.where(eq(user.id, existing.id));

				return { ok: true, message: `${existing.name} has access now.` };
			}

			await tx.insert(pendingGrant).values({
				slackUserId: member.id,
				slackDisplayName: member.displayName,
				slackHandle: member.handle,
				role: serialiseRoles(requested),
				grantedBy,
			});

			preProvisioned = true;
			return { ok: true };
		});
	} catch (error) {
		// The partial unique index is still the authority on one-unclaimed-grant
		// each; the check above is what the lock makes reliable.
		if (!isUniqueViolation(error)) throw error;
		return alreadyPending;
	}

	if (!result.ok) return result;

	/**
	 * Best-effort: the grant already stands regardless of whether the DM lands.
	 * A Pending Grant's DM says where to sign in and can be re-sent from the
	 * table; a direct grant's says the access is live, and its outcome rides
	 * on the "has access now" line since there is no row action to retry it.
	 */
	const dm = await sendSlackDm(
		member.id,
		grantDmMessage({ roles: requested, active: !preProvisioned }),
	);
	result = {
		ok: true,
		message: [result.message, dm.message].filter(Boolean).join(' '),
	};

	revalidate();
	return result;
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

	const grant = await unclaimedGrantById(grantId);

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
	const result = await db().transaction(async (tx) => {
		await lockSlackMember(tx, grant.slackUserId);
		return tx
			.update(pendingGrant)
			.set({ role: serialiseRoles(resulting) })
			.where(
				and(
					eq(pendingGrant.id, grantId),
					isNull(pendingGrant.claimedAt),
					eq(pendingGrant.role, grant.role),
				),
			);
	});

	if (result.rowCount === 0) {
		return { ok: false, message: STALE_ROLES };
	}

	revalidate();
	return { ok: true };
}

/** Re-send the "you've been given access" DM for a Grant nobody has claimed. */
export async function resendPendingGrantDm(
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
		.select({ slackUserId: pendingGrant.slackUserId, role: pendingGrant.role })
		.from(pendingGrant)
		.where(and(eq(pendingGrant.id, grantId), isNull(pendingGrant.claimedAt)))
		.limit(1);

	if (!grant) {
		return {
			ok: false,
			message: 'That grant has already been claimed. Reload the page.',
		};
	}

	const sent = await sendSlackDm(
		grant.slackUserId,
		grantDmMessage({ roles: parseRoles(grant.role) }),
	);

	return sent.ok
		? { ok: true, message: sent.message }
		: { ok: false, message: sent.message };
}

/**
 * Read for a write to the Grant itself. The write is pinned to the role read
 * here and made under `lockSlackMember`, so it cannot land between a claim
 * reading the Grant and applying it — a claim of roles the Grant no longer
 * holds, both reporting success.
 */
async function unclaimedGrantById(grantId: string) {
	const [grant] = await db()
		.select({ role: pendingGrant.role, slackUserId: pendingGrant.slackUserId })
		.from(pendingGrant)
		.where(and(eq(pendingGrant.id, grantId), isNull(pendingGrant.claimedAt)))
		.limit(1);

	return grant ?? null;
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

	const grant = await unclaimedGrantById(grantId);

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
	const result = await db().transaction(async (tx) => {
		await lockSlackMember(tx, grant.slackUserId);
		return tx
			.delete(pendingGrant)
			.where(
				and(
					eq(pendingGrant.id, grantId),
					isNull(pendingGrant.claimedAt),
					eq(pendingGrant.role, grant.role),
				),
			);
	});

	if (result.rowCount === 0) {
		return { ok: false, message: STALE_ROLES };
	}

	revalidate();
	return { ok: true };
}
