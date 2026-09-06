'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { db, user } from '@/db';
import { requireAdmin } from '@/lib/adminAccess';

export type AdminActionResult = { ok: true } | { ok: false; message: string };

export async function grantAdmin(userId: string): Promise<AdminActionResult> {
	const session = await requireAdmin();

	await db()
		.update(user)
		.set({
			role: 'admin',
			roleGrantedAt: new Date(),
			roleGrantedBy: session.user.name || session.user.email,
		})
		.where(eq(user.id, userId));

	revalidatePath('/admin/admins');
	return { ok: true };
}

export async function revokeAdmin(userId: string): Promise<AdminActionResult> {
	const session = await requireAdmin();

	/**
	 * Enforced here as well as hidden in the UI. The UI simply omits the button
	 * on your own row, but a forged request would otherwise let the last admin
	 * lock everyone out of /admin with no way back in short of a SQL console.
	 */
	if (userId === session.user.id) {
		return { ok: false, message: 'You cannot revoke your own admin access.' };
	}

	await db()
		.update(user)
		.set({ role: 'user', roleGrantedAt: null, roleGrantedBy: null })
		.where(eq(user.id, userId));

	revalidatePath('/admin/admins');
	return { ok: true };
}
