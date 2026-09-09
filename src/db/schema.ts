import { sql } from 'drizzle-orm';
import {
	boolean,
	check,
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

/* -------------------------------------------------------------------------- */
/* Submissions                                                                */
/* -------------------------------------------------------------------------- */

/**
 * A Submission is something a non-member sends through a public form on the
 * site that a maintainer has to act on. Four kinds, one table each — a CoC
 * Report and a Volunteer Signup share almost no fields, and CoC needs its own
 * table so its access can be narrowed independently.
 *
 * These previously lived in the Airtable "Form Submissions" base, where they
 * were flat lists with no status of any kind. The status and the event log are
 * new.
 */
export const submissionStatus = pgEnum('submission_status', [
	'new',
	'in_progress',
	'resolved',
	'dismissed',
]);

export const submissionEventType = pgEnum('submission_event_type', [
	'submitted',
	'status_changed',
	'note',
	'notification_sent',
	'notification_failed',
	'imported',
]);

/**
 * Columns every submission kind carries, spread into each table below.
 *
 * A function rather than a shared object: `.unique()` derives its constraint
 * name once, when the column builder is created, so spreading one object into
 * four tables gives all four the *first* table's constraint name and the
 * migration fails on the second `CREATE TABLE`. Naming it explicitly per table
 * is what keeps them distinct.
 */
function submissionColumns(table: string) {
	return {
		id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
		status: submissionStatus('status').notNull().default('new'),
		submittedAt: timestamp('submitted_at', { withTimezone: true })
			.notNull()
			.defaultNow(),
		closedAt: timestamp('closed_at', { withTimezone: true }),
		/** Set by the one-off import; lets it be re-run idempotently. */
		airtableRecordId: text('airtable_record_id').unique(
			`${table}_airtable_record_id_unique`,
		),
	};
}

/**
 * Name and email are nullable: the form tells reporters to skip both if they
 * wish to remain anonymous, and some historical reports did.
 *
 * Only one attachment is supported because only one was ever collected. The
 * blob key points into the Netlify Blobs store; the file is served through an
 * authorized route, never a public URL.
 */
export const cocReport = pgTable(
	'coc_report',
	{
		...submissionColumns('coc_report'),
		name: text('name'),
		email: text('email'),
		reporteeName: text('reportee_name').notNull(),
		timeLocation: text('time_location').notNull(),
		description: text('description').notNull(),
		anyoneElseInvolved: text('anyone_else_involved'),
		attachmentBlobKey: text('attachment_blob_key'),
		attachmentFilename: text('attachment_filename'),
		attachmentContentType: text('attachment_content_type'),
		attachmentSize: integer('attachment_size'),
	},
	(table) => [
		index('coc_report_status_idx').on(table.status),
		index('coc_report_submitted_at_idx').on(table.submittedAt),
	],
);

export const volunteerSignup = pgTable(
	'volunteer_signup',
	{
		...submissionColumns('volunteer_signup'),
		name: text('name').notNull(),
		email: text('email').notNull(),
		githubUsername: text('github_username'),
		position: text('position'),
		description: text('description'),
	},
	(table) => [
		index('volunteer_signup_status_idx').on(table.status),
		index('volunteer_signup_submitted_at_idx').on(table.submittedAt),
	],
);

export const lunchAndLearnIdea = pgTable(
	'lunch_and_learn_idea',
	{
		...submissionColumns('lunch_and_learn_idea'),
		name: text('name').notNull(),
		email: text('email').notNull(),
		topic: text('topic').notNull(),
		description: text('description'),
		format: text('format'),
		timing: text('timing'),
		/** The issue opened in Virtual-Coffee/VC-Community-Docs on submit. */
		githubIssueUrl: text('github_issue_url'),
	},
	(table) => [
		index('lunch_and_learn_idea_status_idx').on(table.status),
		index('lunch_and_learn_idea_submitted_at_idx').on(table.submittedAt),
	],
);

export const coffeeTableGroupRequest = pgTable(
	'coffee_table_group_request',
	{
		...submissionColumns('coffee_table_group_request'),
		name: text('name').notNull(),
		email: text('email').notNull(),
		groupName: text('group_name'),
		description: text('description'),
	},
	(table) => [
		index('coffee_table_group_request_status_idx').on(table.status),
		index('coffee_table_group_request_submitted_at_idx').on(table.submittedAt),
	],
);

/**
 * Append-only, and the equivalent of `applicationEvent` for Submissions.
 *
 * One table with four nullable foreign keys rather than four event tables, or
 * one table keyed by (kind, id). Four near-identical tables is a lot of schema
 * for data this small, and a bare (kind, id) pair has no referential integrity
 * — nothing would stop an orphaned row and deletes would need cleaning up by
 * hand. The CHECK below is what keeps the exclusive-arc honest: exactly one
 * reference is set, and each one cascades on delete.
 */
export const submissionEvent = pgTable(
	'submission_event',
	{
		id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
		cocReportId: integer('coc_report_id').references(() => cocReport.id, {
			onDelete: 'cascade',
		}),
		volunteerSignupId: integer('volunteer_signup_id').references(
			() => volunteerSignup.id,
			{ onDelete: 'cascade' },
		),
		lunchAndLearnIdeaId: integer('lunch_and_learn_idea_id').references(
			() => lunchAndLearnIdea.id,
			{ onDelete: 'cascade' },
		),
		coffeeTableGroupRequestId: integer(
			'coffee_table_group_request_id',
		).references(() => coffeeTableGroupRequest.id, { onDelete: 'cascade' }),
		/** Null for system events (import, form submission). */
		actorUserId: text('actor_user_id').references(() => user.id, {
			onDelete: 'set null',
		}),
		type: submissionEventType('type').notNull(),
		fromStatus: submissionStatus('from_status'),
		toStatus: submissionStatus('to_status'),
		/** Note text, or a summary of what was notified and where. */
		body: text('body'),
		createdAt: timestamp('created_at', { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(table) => [
		index('submission_event_coc_report_id_idx').on(table.cocReportId),
		index('submission_event_volunteer_signup_id_idx').on(
			table.volunteerSignupId,
		),
		index('submission_event_lunch_and_learn_idea_id_idx').on(
			table.lunchAndLearnIdeaId,
		),
		index('submission_event_coffee_table_group_request_id_idx').on(
			table.coffeeTableGroupRequestId,
		),
		check(
			'submission_event_exactly_one_subject',
			sql`(
				(${table.cocReportId} IS NOT NULL)::int
				+ (${table.volunteerSignupId} IS NOT NULL)::int
				+ (${table.lunchAndLearnIdeaId} IS NOT NULL)::int
				+ (${table.coffeeTableGroupRequestId} IS NOT NULL)::int
			) = 1`,
		),
	],
);

export type CocReport = typeof cocReport.$inferSelect;
export type VolunteerSignup = typeof volunteerSignup.$inferSelect;
export type LunchAndLearnIdea = typeof lunchAndLearnIdea.$inferSelect;
export type CoffeeTableGroupRequest =
	typeof coffeeTableGroupRequest.$inferSelect;
export type SubmissionEvent = typeof submissionEvent.$inferSelect;
export type SubmissionStatus = (typeof submissionStatus.enumValues)[number];
export type SubmissionEventType =
	(typeof submissionEventType.enumValues)[number];
