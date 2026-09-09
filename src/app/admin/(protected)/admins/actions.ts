'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { db, user } from '@/db';
import { requirePermission } from '@/lib/adminAccess';
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

	const requested = next.filter(isRoleName);

	if (requested.length !== next.length) {
		return { ok: false, message: 'That is not a role we recognise.' };
	}

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

	await db()
		.update(user)
		.set({
			role: serialiseRoles(requested),
			roleGrantedAt: granting ? new Date() : null,
			roleGrantedBy: granting ? session.user.name || session.user.email : null,
		})
		.where(eq(user.id, userId));

	revalidatePath('/admin/admins');
	revalidatePath('/admin');
	return { ok: true };
}

/** Revoking everything is setting no roles at all. */
export async function revokeAllRoles(
	userId: string,
): Promise<AdminActionResult> {
	return setUserRoles(userId, []);
}
