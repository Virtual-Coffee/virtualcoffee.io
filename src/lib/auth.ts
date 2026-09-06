import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { admin } from 'better-auth/plugins';
import { nextCookies } from 'better-auth/next-js';

import { db, type Database } from '@/db';
import * as schema from '@/db/schema';

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
 * Defer opening a connection until Better Auth actually handles a request.
 *
 * `drizzleAdapter()` wants a database instance at config time, but this module
 * is imported while Next collects routes during a build, where there may be no
 * database to connect to. Resolving on first property access keeps `next build`
 * working without one.
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
 * Whether Slack sign-in can work at all. False on a fresh clone and on deploy
 * previews, where the OAuth redirect URI isn't registered — the sign-in page
 * reads this to explain itself rather than offering a button that 500s.
 */
export const slackAuthConfigured = Boolean(slackClientId && slackClientSecret);

export const auth = betterAuth({
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
					 * check happens here. Without it, any Slack account anywhere
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
		admin({ defaultRole: 'user', adminRoles: ['admin'] }),
		// Must stay last: it wraps the others to set cookies from server actions.
		nextCookies(),
	],
});

export type Session = typeof auth.$Infer.Session;
