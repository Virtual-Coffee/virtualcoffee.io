import { defineDevtoolsConfig } from 'better-auth-devtools';
import { eq } from 'drizzle-orm';

import { db, user } from '@/db';
import { newId } from '@/db/ids';
import { GRANTABLE_ROLES, type RoleName } from '@/lib/access/permissions';

/**
 * The devtools panel on /admin (`src/app/admin/(protected)/layout.tsx`):
 * one managed test user per Role, so "switch user" lands on a session that
 * holds something. Only ever active where `NODE_ENV` is not production — the
 * library refuses everywhere else.
 *
 * The first `volunteer` acts as the Slack member id the dev bypass defaults
 * to, which is the Volunteer `pnpm db:seed` creates, so /invites works after
 * a switch. `slack_user_id` is unique, so any further one gets its own.
 */
const TEMPLATE_ROLES: ReadonlyArray<{ name: RoleName; description: string }> = [
	...GRANTABLE_ROLES,
	{ name: 'volunteer', description: 'Invite Allowance on /invites' },
];

const SEEDED_VOLUNTEER = 'U_DEV_BYPASS';

async function slackUserIdFor(role: string, suffix: string): Promise<string> {
	if (role === 'volunteer') {
		const [taken] = await db()
			.select({ id: user.id })
			.from(user)
			.where(eq(user.slackUserId, SEEDED_VOLUNTEER))
			.limit(1);
		if (!taken) return SEEDED_VOLUNTEER;
	}
	return `U_DEVTOOLS_${suffix}`;
}

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
				slackUserId: await slackUserIdFor(role, suffix),
			})
			.returning({ id: user.id });
		return { userId: row.id, email, label: template.label };
	},
});
