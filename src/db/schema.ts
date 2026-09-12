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
	unique,
	uniqueIndex,
	uuid,
} from 'drizzle-orm/pg-core';

import { newId } from './ids';

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
	// Ours: the User Management screen shows who granted access and when.
	roleGrantedBy: text('role_granted_by'),
	roleGrantedAt: timestamp('role_granted_at', { withTimezone: true }),
	/**
	 * Ours: the Slack member id, copied from `account.account_id` by
	 * `claimPendingGrant()`. Declared to Better Auth as `input: false`, so only
	 * our own Drizzle writes can set it. See docs/adr/0009.
	 */
	slackUserId: text('slack_user_id').unique(),
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
/* Access                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * A Role assigned to a Slack member id before that person has ever signed in.
 *
 * Keyed on the Slack member id rather than an email address: that is the value
 * Better Auth's Slack provider already uses as the account subject
 * (`profile['https://slack.com/user_id']` -> `account.account_id`), so it is
 * the only identifier guaranteed to match at sign-in. See `docs/adr/0009`.
 *
 * Claimed rows are kept rather than deleted — they are the record of who
 * pre-provisioned whom, and `user.role` takes over from that point.
 */
export const pendingGrant = pgTable(
	'pending_grant',
	{
		id: uuid('id').primaryKey().$defaultFn(newId),
		slackUserId: text('slack_user_id').notNull(),
		/**
		 * Snapshotted at grant time, not looked up when the row is rendered. The
		 * User Management table has to be readable when Slack is unreachable, when
		 * the token is revoked, and on a clone that only has mocks — and a grant
		 * for someone who has since left the workspace would otherwise render as
		 * a bare `U0123ABCD`. The trade is that a later rename goes unnoticed.
		 */
		slackDisplayName: text('slack_display_name').notNull(),
		slackHandle: text('slack_handle'),
		/** `serialiseRoles()` output — the same comma-separated encoding as `user.role`. */
		role: text('role').notNull(),
		/** A display string like `user.roleGrantedBy`, so it survives the grantor being deleted. */
		grantedBy: text('granted_by').notNull(),
		grantedAt: timestamp('granted_at', { withTimezone: true })
			.notNull()
			.defaultNow(),
		claimedAt: timestamp('claimed_at', { withTimezone: true }),
		claimedUserId: text('claimed_user_id').references(() => user.id, {
			onDelete: 'set null',
		}),
	},
	(table) => [
		/**
		 * At most one *unclaimed* grant per Slack member, but any number of
		 * claimed ones. A plain unique constraint would mean someone whose user
		 * row was deleted could never be granted access again, because their own
		 * claimed history would collide with the new grant.
		 */
		uniqueIndex('pending_grant_unclaimed_slack_user_id_idx')
			.on(table.slackUserId)
			.where(sql`claimed_at is null`),
		index('pending_grant_claimed_user_id_idx').on(table.claimedUserId),
	],
);

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

/**
 * The life of an Invite. `pending` is sent but unclaimed; `accepted` means the
 * invitee filled in the application; `completed` means they became a Member.
 *
 * `expired` and `cancelled` both mean the Invite will never be claimed, and
 * both refund the Volunteer's allowance — but they are kept apart because only
 * one of them is anybody's fault. `cancelled` is a Volunteer taking back an
 * Invite they sent to the wrong address; `expired` is the ninety-day sweep
 * reclaiming one nobody ever clicked.
 */
export const inviteStatus = pgEnum('invite_status', [
	'pending',
	'accepted',
	'completed',
	'expired',
	'cancelled',
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
	/**
	 * A Slack post about this application, and its failure. Named the way
	 * `submission_event_type` names the same pair rather than reusing
	 * `email_sent`: the History panel renders the type as a sentence, and
	 * "Sent an email" about a Slack message is simply untrue.
	 */
	'notification_sent',
	'notification_failed',
	'imported',
]);

export const inviteTokenPurpose = pgEnum('invite_token_purpose', ['slack']);

export const invite = pgTable('invite', {
	id: uuid('id').primaryKey().$defaultFn(newId),
	// Nullable: imported rows predate any user account, and only carry a name.
	inviterUserId: text('inviter_user_id').references(() => user.id, {
		onDelete: 'set null',
	}),
	inviterName: text('inviter_name'),
	/**
	 * The identifier the allowance is actually keyed on, and the reason this
	 * column exists next to `inviter_user_id` rather than instead of it.
	 *
	 * Spend has to be counted against the same key the ledger credits, or a
	 * Volunteer whose `user` row is replaced — the foreign key above is
	 * `ON DELETE SET NULL` — silently loses their history and is handed their
	 * invites back. Imported rows have neither identifier and keep only
	 * `inviter_name`; the reviewed mapping file fills this in where it can.
	 */
	inviterSlackUserId: text('inviter_slack_user_id'),
	inviteeName: text('invitee_name'),
	inviteeEmail: text('invitee_email'),
	status: inviteStatus('status').notNull().default('pending'),
	/**
	 * The Claim Link, stored the way `invite_token` stores its own: hash only,
	 * so a database leak does not hand out working invites. Deliberately not
	 * reusing `invite_token` — that table's `application_id` is NOT NULL, and a
	 * Claim Link points at an Invite precisely because the application does not
	 * exist yet.
	 */
	tokenHash: text('token_hash').unique(),
	tokenExpiresAt: timestamp('token_expires_at', { withTimezone: true }),
	claimedAt: timestamp('claimed_at', { withTimezone: true }),
	airtableRecordId: text('airtable_record_id').unique(),
	createdAt: timestamp('created_at', { withTimezone: true })
		.notNull()
		.defaultNow(),
});

/* -------------------------------------------------------------------------- */
/* Volunteers and Invite Allowance                                            */
/* -------------------------------------------------------------------------- */

/**
 * Why a movement was recorded. Every row in the ledger is one of these, and the
 * reason is what makes the audit trail answer "where did my invites go?".
 *
 * `monthly_accrual` is the only one written by a machine on a schedule, and the
 * only one that carries a `period_key`. `imported` is the single net row each
 * Volunteer arrives with from Airtable. The two refunds are kept distinct from
 * each other for the same reason the two Invite statuses are.
 */
export const volunteerLedgerReason = pgEnum('volunteer_ledger_reason', [
	'monthly_accrual',
	'imported',
	'admin_grant',
	'admin_revoke',
	'spend',
	'refund_cancelled',
	'refund_expired',
]);

/**
 * Someone trusted to give out Invites. Keyed on the Slack member id because a
 * Volunteer can be designated before they have signed in (docs/adr/0009).
 * Mutable, unlike the ledger: identity and accounting are different concerns.
 * Whether they may *spend* is the `volunteer` role in `user.role`, not here.
 */
export const volunteer = pgTable('volunteer', {
	id: uuid('id').primaryKey().$defaultFn(newId),
	slackUserId: text('slack_user_id').notNull().unique(),
	/** Snapshotted, the same trade as `pending_grant.slack_display_name`. */
	slackDisplayName: text('slack_display_name').notNull(),
	slackHandle: text('slack_handle'),
	/** Backfilled by `claimPendingGrant()` the first time they sign in. */
	userId: text('user_id').references(() => user.id, { onDelete: 'set null' }),
	/**
	 * Not read off `user`: most of the roster has no `user` row yet. Nullable
	 * because Slack's directory omits it without the `users:read.email` scope.
	 */
	email: text('email'),
	/**
	 * The community roles Airtable tracked — "VC Host", "Room Leader", "Lunch &
	 * Learn Team" and a dozen more. Descriptive only: they grant nothing and no
	 * authorization check ever reads them. Kept because they are how a
	 * coordinator knows who to ask for what, and because they would otherwise be
	 * lost when the Airtable base is archived.
	 */
	roleLabels: text('role_labels'),
	/**
	 * Set when the `volunteer` role is revoked, cleared when it is granted again.
	 * The cron accrues only for rows where this is null, so someone who has
	 * stepped back does not quietly bank an invite every month for years and
	 * return holding a supply nobody reviewed.
	 */
	deactivatedAt: timestamp('deactivated_at', { withTimezone: true }),
	/** Set by the one-off import; lets it be re-run idempotently. */
	airtableRecordId: text('airtable_record_id').unique(),
	createdAt: timestamp('created_at', { withTimezone: true })
		.notNull()
		.defaultNow(),
});

/**
 * Every movement of a Volunteer's Invite Allowance. Append-only: nothing here is
 * ever updated or deleted, and the balance is `SUM(delta)`.
 *
 * A stored integer that went up and down would be smaller and faster, and would
 * also be unable to answer the only question anyone actually asks — "why do I
 * have four?". See docs/adr/0011.
 *
 * The two unique indexes are where the correctness lives. Neither double-accrual
 * nor double-refund is prevented by careful code; both are unrepresentable.
 */
export const volunteerInviteLedger = pgTable(
	'volunteer_invite_ledger',
	{
		id: uuid('id').primaryKey().$defaultFn(newId),
		/** Matches `volunteer.slack_user_id`; see the note on `invite.inviter_slack_user_id`. */
		slackUserId: text('slack_user_id').notNull(),
		/** Positive credits, negative spends. Never zero. */
		delta: integer('delta').notNull(),
		reason: volunteerLedgerReason('reason').notNull(),
		/**
		 * `YYYY-MM`, and only ever set on `monthly_accrual`. It exists solely so
		 * the unique index below can exist: the accrual job runs daily and is
		 * retried on failure, so "has this month already been granted?" has to be
		 * a question the database answers, not one the job asks and then races.
		 */
		periodKey: text('period_key'),
		/** Set on `spend` and both refunds — the Invite the movement is about. */
		inviteId: uuid('invite_id').references(() => invite.id, {
			onDelete: 'set null',
		}),
		/** Null for machine-written rows (accrual, expiry, import). */
		actorUserId: text('actor_user_id').references(() => user.id, {
			onDelete: 'set null',
		}),
		body: text('body'),
		createdAt: timestamp('created_at', { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(table) => [
		/** One accrual per Volunteer per month, however many times the job runs. */
		uniqueIndex('volunteer_invite_ledger_accrual_period_idx')
			.on(table.slackUserId, table.periodKey)
			.where(sql`reason = 'monthly_accrual'`),
		/**
		 * An Invite is charged exactly once and refunded at most once. One index
		 * over (invite_id, reason) would allow a `refund_cancelled` *and* a
		 * `refund_expired` for the same Invite; grouping both refund reasons is
		 * what says "at most once". See docs/adr/0011.
		 */
		uniqueIndex('volunteer_invite_ledger_spend_idx')
			.on(table.inviteId)
			.where(sql`reason = 'spend'`),
		uniqueIndex('volunteer_invite_ledger_refund_idx')
			.on(table.inviteId)
			.where(sql`reason in ('refund_cancelled', 'refund_expired')`),
		index('volunteer_invite_ledger_slack_user_id_idx').on(table.slackUserId),
	],
);

export type Volunteer = typeof volunteer.$inferSelect;
export type VolunteerLedgerReason =
	(typeof volunteerLedgerReason.enumValues)[number];
export type Invite = typeof invite.$inferSelect;
export type InviteStatus = (typeof inviteStatus.enumValues)[number];

/* -------------------------------------------------------------------------- */
/* Membership pipeline, continued                                             */
/* -------------------------------------------------------------------------- */

export const membershipApplication = pgTable(
	'membership_application',
	{
		// `id` is opaque because it appears in /admin URLs; `reference` is the
		// number the screen shows. Never put `reference` in a URL. See docs/adr/0008.
		id: uuid('id').primaryKey().$defaultFn(newId),
		reference: integer('reference').notNull().generatedAlwaysAsIdentity(),
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
		inviteId: uuid('invite_id').references(() => invite.id, {
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
		id: uuid('id').primaryKey().$defaultFn(newId),
		applicationId: uuid('application_id')
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
		id: uuid('id').primaryKey().$defaultFn(newId),
		applicationId: uuid('application_id')
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
 * `airtableRecordId` deliberately does *not* carry `.unique()`. That derives
 * its constraint name once, when the column builder is created, so spreading
 * one object into four tables would give all four
 * `coc_report_airtable_record_id_unique` and the migration fails on the second
 * CREATE TABLE. Each table declares the constraint itself, named for the table.
 *
 * A plain object rather than a factory returning one: spreading a function's
 * return type loses the column types, and `table.status` then does not exist
 * on the resulting table.
 */
const submissionColumns = {
	// Same pair as `membership_application`. Unlike `airtableRecordId` below,
	// an identity column is safe to spread: the sequence name is derived per
	// table at generate time, not once on the builder.
	id: uuid('id').primaryKey().$defaultFn(newId),
	reference: integer('reference').notNull().generatedAlwaysAsIdentity(),
	status: submissionStatus('status').notNull().default('new'),
	submittedAt: timestamp('submitted_at', { withTimezone: true })
		.notNull()
		.defaultNow(),
	closedAt: timestamp('closed_at', { withTimezone: true }),
	/** Set by the one-off import; lets it be re-run idempotently. */
	airtableRecordId: text('airtable_record_id'),
};

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
		...submissionColumns,
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
		unique('coc_report_airtable_record_id_unique').on(table.airtableRecordId),
		index('coc_report_status_idx').on(table.status),
		index('coc_report_submitted_at_idx').on(table.submittedAt),
	],
);

export const volunteerSignup = pgTable(
	'volunteer_signup',
	{
		...submissionColumns,
		name: text('name').notNull(),
		email: text('email').notNull(),
		githubUsername: text('github_username'),
		position: text('position'),
		description: text('description'),
	},
	(table) => [
		unique('volunteer_signup_airtable_record_id_unique').on(
			table.airtableRecordId,
		),
		index('volunteer_signup_status_idx').on(table.status),
		index('volunteer_signup_submitted_at_idx').on(table.submittedAt),
	],
);

export const lunchAndLearnIdea = pgTable(
	'lunch_and_learn_idea',
	{
		...submissionColumns,
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
		unique('lunch_and_learn_idea_airtable_record_id_unique').on(
			table.airtableRecordId,
		),
		index('lunch_and_learn_idea_status_idx').on(table.status),
		index('lunch_and_learn_idea_submitted_at_idx').on(table.submittedAt),
	],
);

export const coffeeTableGroupRequest = pgTable(
	'coffee_table_group_request',
	{
		...submissionColumns,
		name: text('name').notNull(),
		email: text('email').notNull(),
		groupName: text('group_name'),
		description: text('description'),
	},
	(table) => [
		unique('coffee_table_group_request_airtable_record_id_unique').on(
			table.airtableRecordId,
		),
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
		id: uuid('id').primaryKey().$defaultFn(newId),
		cocReportId: uuid('coc_report_id').references(() => cocReport.id, {
			onDelete: 'cascade',
		}),
		volunteerSignupId: uuid('volunteer_signup_id').references(
			() => volunteerSignup.id,
			{ onDelete: 'cascade' },
		),
		lunchAndLearnIdeaId: uuid('lunch_and_learn_idea_id').references(
			() => lunchAndLearnIdea.id,
			{ onDelete: 'cascade' },
		),
		coffeeTableGroupRequestId: uuid('coffee_table_group_request_id').references(
			() => coffeeTableGroupRequest.id,
			{ onDelete: 'cascade' },
		),
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
