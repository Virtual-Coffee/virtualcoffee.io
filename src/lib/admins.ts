import { and, isNotNull, ne } from 'drizzle-orm';

import { db, user } from '@/db';
import { DEFAULT_ROLE, parseRoles, type RoleName } from '@/lib/permissions';

export type AdminRow = {
	id: string;
	name: string;
	email: string;
	roles: RoleName[];
	roleGrantedAt: Date | null;
	roleGrantedBy: string | null;
};

const COLUMNS = {
	id: user.id,
	name: user.name,
	email: user.email,
	role: user.role,
	roleGrantedAt: user.roleGrantedAt,
	roleGrantedBy: user.roleGrantedBy,
};

function toRow(row: {
	id: string;
	name: string;
	email: string;
	role: string | null;
	roleGrantedAt: Date | null;
	roleGrantedBy: string | null;
}): AdminRow {
	return {
		id: row.id,
		name: row.name,
		email: row.email,
		roles: parseRoles(row.role),
		roleGrantedAt: row.roleGrantedAt,
		roleGrantedBy: row.roleGrantedBy,
	};
}

/**
 * Everyone holding at least one granted role.
 *
 * Filtered in JavaScript rather than SQL because roles are stored as a
 * comma-separated string — `role = 'admin'` would miss someone who is
 * `admin,coc_reviewer`, which is exactly the case this screen exists to manage.
 */
export async function listAdmins(): Promise<AdminRow[]> {
	const rows = await db()
		.select(COLUMNS)
		.from(user)
		.where(and(isNotNull(user.role), ne(user.role, DEFAULT_ROLE)))
		.orderBy(user.name);

	return rows.map(toRow).filter((row) => row.roles.length > 0);
}

/**
 * Everyone who has signed in but holds nothing — the pool the "Grant access"
 * control can pick from. Granting to an address that has never signed in would
 * have nothing to attach a role to.
 */
export async function listGrantableUsers(): Promise<AdminRow[]> {
	// Holding nothing is `user`, null, or a string with no role we recognise —
	// none of which SQL can filter on cleanly, so the filter is in JavaScript
	// alongside the one in listAdmins().
	const rows = await db()
		.select(COLUMNS)
		.from(user)
		.where(isNotNull(user.email))
		.orderBy(user.name);

	return rows.map(toRow).filter((row) => row.roles.length === 0);
}
