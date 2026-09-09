import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { admin } from 'better-auth/plugins';
import { nextCookies } from 'better-auth/next-js';
import { devtools } from 'better-auth-devtools';

import { db, type Database } from '@/db';
import * as schema from '@/db/schema';
import { ac, DEFAULT_ROLE, roles } from '@/lib/permissions';

const SLACK_TEAM_ID_CLAIM = 'https://slack.com/team_id';

/**
 * Emails that get the admin role the first time they sign in. This is a
 * bootstrap only: once someone is an admin, roles are granted and revoked in
 * /admin and live in the database. Removing an address here revokes nothing.
 *
 * Email rather than Slack user ID because a maintainer knows their own email
 * and would have to go digging for the other.
 */
function bootstrapAdminEmails(): Set<string> {
	return new Set(
		(process.env.ADMIN_BOOTSTRAP_EMAILS ?? '')
			.split(',')
			.map((entry) => entry.trim().toLowerCase())
			.filter(Boolean),
	);
}

/**
 * Defer opening a connection until a query actually runs. Not sufficient on
 * its own — see `createAuth` below — but it keeps the database out of module
 * evaluation for every other consumer.
 */
const lazyDatabase = new Proxy({} as Database, {
	get(_target, property, receiver) {
		const database = db() as unknown as Record<PropertyKey, unknown>;
		const value = Reflect.get(database, property, receiver);
		return typeof value === 'function' ? value.bind(database) : value;
	},
});

const slackClientId = process.env.SLACK_CLIENT_ID;
const slackClientSecret = process.env.SLACK_CLIENT_SECRET;
const slackTeamId = process.env.SLACK_TEAM_ID;

/**
 * Whether Slack sign-in can work at all. False on a fresh clone, where the
 * sign-in page reads this to explain itself rather than offering a button
 * that 500s.
 */
export const slackAuthConfigured = Boolean(slackClientId && slackClientSecret);

function createAuth() {
	return betterAuth({
		database: drizzleAdapter(lazyDatabase, {
			provider: 'pg',
			schema,
		}),
		// Slack is the only way in; there is deliberately no email/password path.
		socialProviders: slackAuthConfigured
			? {
					slack: {
						clientId: slackClientId as string,
						clientSecret: slackClientSecret as string,
						/**
						 * Better Auth 1.7.3's Slack provider has no `team` option (the
						 * documented one belongs to a later release), so the workspace
						 * check happens here. Without it any Slack account anywhere
						 * could create a user — they would land on the "not an admin"
						 * screen, but there is no reason to let them in at all.
						 */
						mapProfileToUser: (profile) => {
							const team = profile[SLACK_TEAM_ID_CLAIM];

							if (slackTeamId && team !== slackTeamId) {
								throw new Error(
									'This Slack account is not in the Virtual Coffee workspace.',
								);
							}

							return {
								name: profile.name,
								email: profile.email,
								image: profile.picture,
							};
						},
					},
				}
			: {},
		databaseHooks: {
			user: {
				create: {
					before: async (user) => ({
						data: {
							...user,
							role: bootstrapAdminEmails().has(user.email.toLowerCase())
								? 'admin'
								: 'user',
						},
					}),
				},
			},
		},
		plugins: [
			/**
			 * `adminRoles` deliberately stays `['admin']`. It gates the plugin's own
			 * user-management endpoints — ban, impersonate, set-role — which only
			 * /admin/admins uses. The narrow roles in `roles` grant a section and
			 * nothing else; a volunteer_coordinator must not be able to ban anyone.
			 */
			admin({ ac, roles, defaultRole: DEFAULT_ROLE, adminRoles: ['admin'] }),
			devtools({ enabled: true }),
			// Must stay last: it wraps the others to set cookies from server actions.
			nextCookies(),
		],
	});
}

type Auth = ReturnType<typeof createAuth>;

let cached: Auth | undefined;

/**
 * Built on first use, not at module load.
 *
 * `drizzleAdapter()` inspects the database instance while `betterAuth()` is
 * constructing, so the lazy database proxy alone isn't enough — it fires
 * during module evaluation. Next imports this module while collecting page
 * data at build time, where there is no database, and the build fails with
 * MissingDatabaseConnectionError. Making the whole instance lazy defers all of
 * it to the first request.
 */
export function getAuth(): Auth {
	cached ??= createAuth();
	return cached;
}

/**
 * Convenience wrapper so callers can write `auth.api.getSession(...)`. The
 * property access happens inside request handlers, which is when the instance
 * gets built.
 */
export const auth = new Proxy({} as Auth, {
	get(_target, property, receiver) {
		const instance = getAuth() as unknown as Record<PropertyKey, unknown>;
		const value = Reflect.get(instance, property, receiver);
		return typeof value === 'function' ? value.bind(instance) : value;
	},
});

export type Session = Auth['$Infer']['Session'];
