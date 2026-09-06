import { eq, isNotNull, and, ne } from 'drizzle-orm';

import { db, user } from '@/db';

export type AdminRow = {
	id: string;
	name: string;
	email: string;
	roleGrantedAt: Date | null;
	roleGrantedBy: string | null;
};

export async function listAdmins(): Promise<AdminRow[]> {
	return db()
		.select({
			id: user.id,
			name: user.name,
			email: user.email,
			roleGrantedAt: user.roleGrantedAt,
			roleGrantedBy: user.roleGrantedBy,
		})
		.from(user)
		.where(eq(user.role, 'admin'))
		.orderBy(user.name);
}

/**
 * Everyone who has signed in but isn't an admin — the pool the "Grant admin"
 * control can pick from. Granting to an address that has never signed in would
 * have nothing to attach a role to.
 */
export async function listGrantableUsers(): Promise<AdminRow[]> {
	return db()
		.select({
			id: user.id,
			name: user.name,
			email: user.email,
			roleGrantedAt: user.roleGrantedAt,
			roleGrantedBy: user.roleGrantedBy,
		})
		.from(user)
		.where(and(isNotNull(user.email), ne(user.role, 'admin')))
		.orderBy(user.name);
}
