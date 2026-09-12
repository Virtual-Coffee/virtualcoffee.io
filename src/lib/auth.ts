import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { admin } from 'better-auth/plugins';
import { nextCookies } from 'better-auth/next-js';
import { devtools } from 'better-auth-devtools';

import { db } from '@/db';
import * as schema from '@/db/schema';
import { ac, DEFAULT_ROLE, roles } from '@/lib/permissions';
import { claimPendingGrant } from '@/lib/pendingGrants';

const SLACK_TEAM_ID_CLAIM = 'https://slack.com/team_id';

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
		database: drizzleAdapter(db(), {
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
		/**
		 * `slackUserId` is server-owned, like `role`. `input: false` keeps every
		 * Better Auth input path away from it — including `mapProfileToUser`,
		 * which is why it is written by the account hook below rather than mapped
		 * off the Slack profile. Our own Drizzle writes are unaffected.
		 */
		user: {
			additionalFields: {
				slackUserId: { type: 'string', required: false, input: false },
			},
		},
		databaseHooks: {
			user: {
				create: {
					// Everyone starts with nothing. Pre-provisioned roles are applied
					// by the account hook below, which is the first point at which the
					// Slack member id exists.
					before: async (user) => ({ data: { ...user, role: DEFAULT_ROLE } }),
				},
			},
			account: {
				create: {
					after: async (account) => {
						await claimPendingGrant(account);
					},
				},
			},
		},
		plugins: [
			/**
			 * Supplies `role` on the session and registers the `ac`/`roles` objects
			 * `sessionCan()` evaluates. None of its endpoints — ban, impersonate,
			 * set-role — are called: every role write is Drizzle, in
			 * src/lib/pendingGrants.ts and user-management/actions.ts. `adminRoles`
			 * stays `['admin']` so that, if one ever is, a section role cannot
			 * reach it.
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
 * constructing, which opens a connection. Next imports this module while
 * collecting page data at build time, where there is no database, and the
 * build fails with MissingDatabaseConnectionError. Building the instance on
 * the first request is what keeps `db()` out of module evaluation.
 */
export function getAuth(): Auth {
	cached ??= createAuth();
	return cached;
}

export type Session = Auth['$Infer']['Session'];
