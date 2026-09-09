import {
	boolean,
	index,
	integer,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uuid,
} from 'drizzle-orm/pg-core';

/**
 * Better Auth owns the `user`, `session`, `account` and `verification` tables.
 * Their field names are dictated by `buildAuthTables()` in
 * `@better-auth/core`; the drizzle adapter maps them to snake_case columns by
 * default (`camelCase: false`), which is why every column here is snake_case.
 * Do not rename these without changing the adapter config.
 */

export const user = pgTable('user', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	emailVerified: boolean('email_verified').notNull().default(false),
	image: text('image'),
	// `admin` plugin fields. `role` is declared `input: false` upstream, so it
	// can only be written through admin routes or the internal adapter.
	role: text('role'),
	banned: boolean('banned').default(false),
	banReason: text('ban_reason'),
	banExpires: timestamp('ban_expires', { withTimezone: true }),
	// Ours: the Admins screen shows who granted access and when.
	roleGrantedBy: text('role_granted_by'),
	roleGrantedAt: timestamp('role_granted_at', { withTimezone: true }),
	createdAt: timestamp('created_at', { withTimezone: true })
		.notNull()
		.defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true })
		.notNull()
		.defaultNow(),
});

export const session = pgTable(
	'session',
	{
		id: text('id').primaryKey(),
		expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
		token: text('token').notNull().unique(),
		ipAddress: text('ip_address'),
		userAgent: text('user_agent'),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		impersonatedBy: text('impersonated_by'),
		createdAt: timestamp('created_at', { withTimezone: true })
			.notNull()
			.defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(table) => [index('session_user_id_idx').on(table.userId)],
);

export const account = pgTable(
	'account',
	{
		id: text('id').primaryKey(),
		accountId: text('account_id').notNull(),
		providerId: text('provider_id').notNull(),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		accessToken: text('access_token'),
		refreshToken: text('refresh_token'),
		idToken: text('id_token'),
		accessTokenExpiresAt: timestamp('access_token_expires_at', {
			withTimezone: true,
		}),
		refreshTokenExpiresAt: timestamp('refresh_token_expires_at', {
			withTimezone: true,
		}),
		scope: text('scope'),
		password: text('password'),
		createdAt: timestamp('created_at', { withTimezone: true })
			.notNull()
			.defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(table) => [index('account_user_id_idx').on(table.userId)],
);

export const verification = pgTable(
	'verification',
	{
		id: text('id').primaryKey(),
		identifier: text('identifier').notNull(),
		value: text('value').notNull(),
		expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
		createdAt: timestamp('created_at', { withTimezone: true })
			.notNull()
			.defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(table) => [index('verification_identifier_idx').on(table.identifier)],
);

/**
 * Owned by the `better-auth-devtools` plugin (`devtools()` in
 * `src/lib/auth.ts`) — tracks users the DevTools panel created so it can
 * offer to delete only the ones it made. The plugin's server-side guard
 * disables every endpoint that touches this table outside development, so
 * it stays empty in production.
 */
export const devtoolsUser = pgTable('devtools_user', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.unique()
		.references(() => user.id, { onDelete: 'cascade' }),
	templateKey: text('template_key').notNull(),
	label: text('label').notNull(),
	email: text('email').notNull().unique(),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull(),
});

/* -------------------------------------------------------------------------- */
/* Membership pipeline                                                        */
/* -------------------------------------------------------------------------- */

/**
 * `lapsed` means nobody ever decided — it is deliberately distinct from
 * `declined`, which records a decision a maintainer actually made. The Airtable
 * import puts ~1,378 rows into `lapsed`; calling those `declined` would assert
 * something untrue about real people.
 */
export const applicationStatus = pgEnum('application_status', [
	'waitlisted',
	'coffee_invited',
	'member',
	'declined',
	'withdrawn',
	'lapsed',
]);

export const applicationSource = pgEnum('application_source', [
	'waitlist_signup',
	'volunteer_invite',
]);

export const inviteStatus = pgEnum('invite_status', [
	'pending',
	'accepted',
	'completed',
]);

export const applicationEventType = pgEnum('application_event_type', [
	'submitted',
	'waitlisted',
	'coffee_invited',
	'attendance_recorded',
	'approved',
	'declined',
	'withdrawn',
	'lapsed',
	'note',
	'email_sent',
	'email_failed',
	'imported',
]);

export const inviteTokenPurpose = pgEnum('invite_token_purpose', ['slack']);

export const invite = pgTable('invite', {
	id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
	// Nullable: imported rows predate any user account, and only carry a name.
	inviterUserId: text('inviter_user_id').references(() => user.id, {
		onDelete: 'set null',
	}),
	inviterName: text('inviter_name'),
	inviteeName: text('invitee_name'),
	inviteeEmail: text('invitee_email'),
	status: inviteStatus('status').notNull().default('pending'),
	airtableRecordId: text('airtable_record_id').unique(),
	createdAt: timestamp('created_at', { withTimezone: true })
		.notNull()
		.defaultNow(),
});

export const membershipApplication = pgTable(
	'membership_application',
	{
		// Identity rather than a uuid: the detail screen shows the number
		// ("Application 1842") and maintainers refer to it out loud.
		id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
		status: applicationStatus('status').notNull().default('waitlisted'),
		source: applicationSource('source').notNull(),
		/** Volunteer-invite applications sort to the front of the queue. */
		isPriority: boolean('is_priority').notNull().default(false),

		name: text('name').notNull(),
		email: text('email').notNull(),
		pronouns: text('pronouns'),
		githubUsername: text('github_username'),
		/** Retained for imported rows; not collected by the current form. */
		twitterUsername: text('twitter_username'),

		howDidYouHear: text('how_did_you_hear'),
		journey: text('journey'),
		codeInterests: text('code_interests'),
		virtualCoffee: text('virtual_coffee'),

		/**
		 * The old form required the Code of Conduct checkbox in the browser but
		 * never recorded it anywhere. Nullable because imported rows have no
		 * trustworthy consent timestamp.
		 */
		agreedToCocAt: timestamp('agreed_to_coc_at', { withTimezone: true }),

		referrer: text('referrer'),
		inviteId: integer('invite_id').references(() => invite.id, {
			onDelete: 'set null',
		}),

		submittedAt: timestamp('submitted_at', { withTimezone: true })
			.notNull()
			.defaultNow(),
		waitlistedAt: timestamp('waitlisted_at', { withTimezone: true }),
		coffeeInvitedAt: timestamp('coffee_invited_at', { withTimezone: true }),
		coffeeAttendedAt: timestamp('coffee_attended_at', { withTimezone: true }),
		approvedAt: timestamp('approved_at', { withTimezone: true }),
		closedAt: timestamp('closed_at', { withTimezone: true }),

		/** Set by the one-off import; lets the migration be re-run idempotently. */
		airtableRecordId: text('airtable_record_id').unique(),
	},
	(table) => [
		index('membership_application_status_idx').on(table.status),
		index('membership_application_email_idx').on(table.email),
		index('membership_application_submitted_at_idx').on(table.submittedAt),
	],
);

/** Append-only. Renders as the History panel on the application detail screen. */
export const applicationEvent = pgTable(
	'application_event',
	{
		id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
		applicationId: integer('application_id')
			.notNull()
			.references(() => membershipApplication.id, { onDelete: 'cascade' }),
		/** Null for system events (import, form submission). */
		actorUserId: text('actor_user_id').references(() => user.id, {
			onDelete: 'set null',
		}),
		type: applicationEventType('type').notNull(),
		fromStatus: applicationStatus('from_status'),
		toStatus: applicationStatus('to_status'),
		/** Note text, or a summary of what was emailed and to whom. */
		body: text('body'),
		createdAt: timestamp('created_at', { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(table) => [
		index('application_event_application_id_idx').on(table.applicationId),
	],
);

/**
 * Replaces the old `/join-slack?code=` behaviour, which accepted any non-empty
 * value, forever. Only the hash is stored, so a database leak does not hand out
 * working invites.
 */
export const inviteToken = pgTable(
	'invite_token',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		applicationId: integer('application_id')
			.notNull()
			.references(() => membershipApplication.id, { onDelete: 'cascade' }),
		purpose: inviteTokenPurpose('purpose').notNull(),
		tokenHash: text('token_hash').notNull().unique(),
		expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
		usedAt: timestamp('used_at', { withTimezone: true }),
		createdAt: timestamp('created_at', { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(table) => [index('invite_token_application_id_idx').on(table.applicationId)],
);

export type MembershipApplication = typeof membershipApplication.$inferSelect;
export type NewMembershipApplication =
	typeof membershipApplication.$inferInsert;
export type ApplicationEvent = typeof applicationEvent.$inferSelect;
export type ApplicationStatus = (typeof applicationStatus.enumValues)[number];
export type ApplicationSource = (typeof applicationSource.enumValues)[number];
