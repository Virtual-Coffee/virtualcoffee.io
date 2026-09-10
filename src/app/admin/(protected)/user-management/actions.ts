'use server';

import { and, eq, isNull } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { db, pendingGrant, user } from '@/db';
import { getSlackMembers } from '@/data/slackMembers';
import { requirePermission } from '@/lib/adminAccess';
import { userForSlackId } from '@/lib/admins';
import { isId } from '@/db/ids';
import {
	DEFAULT_ROLE,
	parseRoles,
	roles as ROLE_DEFINITIONS,
	serialiseRoles,
	type RoleName,
} from '@/lib/permissions';

export type AdminActionResult = { ok: true } | { ok: false; message: string };

function isRoleName(value: string): value is RoleName {
	return value in ROLE_DEFINITIONS && value !== DEFAULT_ROLE;
}

/**
 * Whitelist the requested roles, or say so. Shared by every action here, since
 * all four accept the same array off the same dropdown.
 */
function validateRoles(
	next: string[],
): { ok: true; roles: RoleName[] } | { ok: false; message: string } {
	const requested = next.filter(isRoleName);

	if (requested.length !== next.length) {
		return { ok: false, message: 'That is not a role we recognise.' };
	}

	return { ok: true, roles: requested };
}

function revalidate() {
	revalidatePath('/admin/user-management');
	revalidatePath('/admin');
}

/**
 * Replace someone's roles outright.
 *
 * Roles live comma-separated in `user.role`; `serialiseRoles` is the only place
 * that encoding is written, and it collapses an empty selection back to the
 * default role rather than leaving a null the admin plugin would have to guess
 * about.
 */
export async function setUserRoles(
	userId: string,
	next: string[],
): Promise<AdminActionResult> {
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
		const current = parseRoles((session.user as { role?: string | null }).role);
		if (current.includes('admin') && !requested.includes('admin')) {
			return { ok: false, message: 'You cannot revoke your own admin access.' };
		}
	}

	const granting = requested.length > 0;

	const result = await db()
		.update(user)
		.set({
			role: serialiseRoles(requested),
			roleGrantedAt: granting ? new Date() : null,
			roleGrantedBy: granting ? session.user.name || session.user.email : null,
		})
		.where(eq(user.id, userId));

	// An id that matches nobody is a stale page, not a success — saying "ok"
	// would leave the maintainer believing they had granted something.
	if (result.rowCount === 0) {
		return {
			ok: false,
			message: 'That person no longer exists. Reload the page.',
		};
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
): Promise<AdminActionResult> {
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
	} catch {
		// The partial unique index is the authority on one-unclaimed-grant-each,
		// so a race lands here rather than creating a second row.
		return {
			ok: false,
			message: `${member.displayName} already has access pending. Edit it in the table below.`,
		};
	}

	revalidate();
	return { ok: true };
}

/** Change the roles on a Grant nobody has claimed yet. */
export async function setPendingGrantRoles(
	grantId: string,
	next: string[],
): Promise<AdminActionResult> {
	await requirePermission('admins', 'manage');

	// Postgres raises 22P02 on a malformed literal against a uuid column, so an
	// unchecked id throws rather than matching nothing. See docs/adr/0008.
	if (!isId(grantId)) {
		return {
			ok: false,
			message: 'That grant no longer exists. Reload the page.',
		};
	}

	const validated = validateRoles(next);
	if (!validated.ok) return validated;

	if (validated.roles.length === 0) {
		return {
			ok: false,
			message: 'Revoke the grant instead of leaving it with no roles.',
		};
	}

	const result = await db()
		.update(pendingGrant)
		.set({ role: serialiseRoles(validated.roles) })
		.where(and(eq(pendingGrant.id, grantId), isNull(pendingGrant.claimedAt)));

	if (result.rowCount === 0) {
		return {
			ok: false,
			message: 'That grant has already been claimed. Reload the page.',
		};
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
): Promise<AdminActionResult> {
	await requirePermission('admins', 'manage');

	if (!isId(grantId)) {
		return {
			ok: false,
			message: 'That grant no longer exists. Reload the page.',
		};
	}

	const result = await db()
		.delete(pendingGrant)
		.where(and(eq(pendingGrant.id, grantId), isNull(pendingGrant.claimedAt)));

	if (result.rowCount === 0) {
		return {
			ok: false,
			message: 'That grant has already been claimed. Reload the page.',
		};
	}

	revalidate();
	return { ok: true };
}
