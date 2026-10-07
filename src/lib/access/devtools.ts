import { defineDevtoolsConfig } from 'better-auth-devtools';

import { db, user } from '@/db';
import { newId } from '@/db/ids';
import { deployContext } from '@/lib/deployContext';
import { GRANTABLE_ROLES, type RoleName } from '@/lib/access/permissions';

/**
 * The devtools panel (`src/app/admin/testUserPanel.tsx`), mounted on /admin
 * and both sign-in pages: the local way to sign in without Slack. One managed
 * test user per Role, so "switch user" lands on a session that holds
 * something. Active only on a local checkout — `devtoolsEnabled()` — and the
 * library itself also refuses where `NODE_ENV` is production.
 *
 * `pnpm db:seed` registers its own users with the panel (`scripts/seed/users.ts`),
 * among them a Volunteer with an allowance; a `volunteer` created from here
 * is a fresh one with no roster row and nothing to spend.
 */
const TEMPLATE_ROLES: ReadonlyArray<{ name: RoleName; description: string }> = [
	...GRANTABLE_ROLES,
	{ name: 'volunteer', description: 'Invite Allowance on /invites' },
];

/**
 * Whether the panel is on: a local checkout (docs/adr/0018) outside a
 * production build. The library refuses a production build on its own; the
 * check is repeated so a local `pnpm start` doesn't offer the sign-in hint.
 */
export function devtoolsEnabled(): boolean {
	return process.env.NODE_ENV !== 'production' && deployContext() === 'local';
}

export const devtoolsConfig = defineDevtoolsConfig({
	enabled: devtoolsEnabled,
	templates: Object.fromEntries(
		TEMPLATE_ROLES.map((role) => [
			role.name,
			{ label: role.description, meta: { role: role.name } },
		]),
	),
	/**
	 * Written with Drizzle rather than through Better Auth: the
	 * `user.create.before` hook in `src/lib/access/auth.ts` sets every new user's
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
