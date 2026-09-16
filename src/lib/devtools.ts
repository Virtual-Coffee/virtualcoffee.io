import { defineDevtoolsConfig } from 'better-auth-devtools';

import { db, user } from '@/db';
import { newId } from '@/db/ids';
import { GRANTABLE_ROLES, type RoleName } from '@/lib/permissions';

/**
 * The devtools panel on /admin (`src/app/admin/(protected)/layout.tsx`):
 * one managed test user per Role, so "switch user" lands on a session that
 * holds something. Only ever active where `NODE_ENV` is not production — the
 * library refuses everywhere else.
 *
 * `pnpm db:seed` registers its own users with the panel (`scripts/seed/users.ts`),
 * among them a Volunteer with an allowance; a `volunteer` created from here
 * is a fresh one with no roster row and nothing to spend.
 */
const TEMPLATE_ROLES: ReadonlyArray<{ name: RoleName; description: string }> = [
	...GRANTABLE_ROLES,
	{ name: 'volunteer', description: 'Invite Allowance on /invites' },
];

export const devtoolsConfig = defineDevtoolsConfig({
	enabled: true,
	templates: Object.fromEntries(
		TEMPLATE_ROLES.map((role) => [
			role.name,
			{ label: role.description, meta: { role: role.name } },
		]),
	),
	/**
	 * Written with Drizzle rather than through Better Auth: the
	 * `user.create.before` hook in `src/lib/auth.ts` sets every new user's
	 * role to the default, which is right for a Slack sign-in and wrong for a
	 * test user whose whole point is the role.
	 */
	createManagedUser: async ({ templateKey, template, email }) => {
		const role = template.meta?.role;
		if (typeof role !== 'string') {
			throw new Error(`Devtools template ${templateKey} names no role.`);
		}
		// The library makes the email unique per managed user; reuse its suffix.
		const suffix = email.slice(email.indexOf('+') + 1, email.indexOf('@'));
		const [row] = await db()
			.insert(user)
			.values({
				id: newId(),
				name: template.label,
				email,
				emailVerified: true,
				role,
				roleGrantedBy: 'devtools',
				roleGrantedAt: new Date(),
				slackUserId: `U_DEVTOOLS_${suffix}`,
			})
			.returning({ id: user.id });
		return { userId: row.id, email, label: template.label };
	},
});
