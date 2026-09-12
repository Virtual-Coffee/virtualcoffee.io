import { eq } from 'drizzle-orm';
import { integer, pgSchema, text } from 'drizzle-orm/pg-core';

import type { Database } from '../../src/db';

/**
 * Every column `sanitizePreviewDb.ts` has made a decision about, table by
 * table — scrubbed, cleared, deleted with its table, or looked at and kept.
 *
 * The sanitizer is an allowlist of things it knows to scrub, and a table
 * added later was published in full until somebody remembered it (ADR 0007
 * records that happening twice). So the schema is checked against this list
 * at the end of every run, and a table or column it doesn't name fails the
 * build. Adding a column to the schema means adding it here — and deciding,
 * in the sanitizer, what happens to it.
 *
 * Kept apart from the script for the reason `previewFakes.ts` is: the script
 * runs `main()` on import, and this is the part worth testing.
 */
export const SANITIZED_COLUMNS: Readonly<Record<string, readonly string[]>> = {
	// prettier-ignore
	membership_application: [
		'id', 'reference', 'status', 'source', 'is_priority', 'invite_id',
		'agreed_to_coc_at', 'submitted_at', 'waitlisted_at', 'coffee_invited_at',
		'coffee_attended_at', 'approved_at', 'closed_at', 'airtable_record_id',
		// rewritten
		'name', 'email', 'pronouns', 'github_username', 'twitter_username',
		'how_did_you_hear', 'journey', 'code_interests', 'virtual_coffee',
		'referrer',
	],
	// prettier-ignore
	application_event: [
		'id', 'application_id', 'actor_user_id', 'type', 'from_status',
		'to_status', 'created_at',
		// regenerated from the type
		'body',
	],
	// prettier-ignore
	invite: [
		'id', 'inviter_user_id', 'status', 'claimed_at', 'airtable_record_id',
		'created_at',
		// rewritten or cleared
		'inviter_name', 'inviter_slack_user_id', 'invitee_name', 'invitee_email',
		'token_hash', 'token_expires_at',
	],
	// deleted outright
	invite_token: [
		'id',
		'application_id',
		'purpose',
		'token_hash',
		'expires_at',
		'used_at',
		'created_at',
	],
	// prettier-ignore
	coc_report: [
		'id', 'reference', 'status', 'submitted_at', 'closed_at',
		'airtable_record_id',
		// rewritten; the attachment is replaced with a placeholder blob
		'name', 'email', 'reportee_name', 'time_location', 'description',
		'anyone_else_involved', 'attachment_blob_key', 'attachment_filename',
		'attachment_content_type', 'attachment_size',
	],
	// prettier-ignore
	volunteer_signup: [
		'id', 'reference', 'status', 'submitted_at', 'closed_at',
		'airtable_record_id',
		// rewritten
		'name', 'email', 'github_username', 'position', 'description',
	],
	// prettier-ignore
	lunch_and_learn_idea: [
		'id', 'reference', 'status', 'submitted_at', 'closed_at',
		'airtable_record_id',
		// a link into the public repo, nothing personal
		'github_issue_url',
		// rewritten
		'name', 'email', 'topic', 'description', 'format', 'timing',
	],
	// prettier-ignore
	coffee_table_group_request: [
		'id', 'reference', 'status', 'submitted_at', 'closed_at',
		'airtable_record_id',
		// rewritten
		'name', 'email', 'group_name', 'description',
	],
	// prettier-ignore
	submission_event: [
		'id', 'coc_report_id', 'volunteer_signup_id', 'lunch_and_learn_idea_id',
		'coffee_table_group_request_id', 'actor_user_id', 'type', 'from_status',
		'to_status', 'created_at',
		// regenerated from the type
		'body',
	],
	// prettier-ignore
	volunteer: [
		'id', 'user_id', 'role_labels', 'deactivated_at', 'airtable_record_id',
		'created_at',
		// rewritten
		'slack_user_id', 'slack_display_name', 'slack_handle', 'email',
	],
	// prettier-ignore
	volunteer_invite_ledger: [
		'id', 'delta', 'reason', 'period_key', 'invite_id', 'actor_user_id',
		'created_at',
		// rewritten
		'slack_user_id', 'body',
	],
	// prettier-ignore
	pending_grant: [
		'id', 'role', 'granted_at', 'claimed_at', 'claimed_user_id',
		// rewritten or cleared
		'slack_user_id', 'slack_display_name', 'slack_handle', 'granted_by',
	],
	// prettier-ignore
	user: [
		'id', 'email_verified', 'role', 'banned', 'ban_expires',
		'role_granted_at', 'created_at', 'updated_at',
		// rewritten or cleared
		'name', 'email', 'image', 'ban_reason', 'role_granted_by',
		'slack_user_id',
	],
	// prettier-ignore
	account: [
		'id', 'provider_id', 'user_id', 'access_token_expires_at',
		'refresh_token_expires_at', 'created_at', 'updated_at',
		// rewritten or cleared
		'account_id', 'access_token', 'refresh_token', 'id_token', 'scope',
		'password',
	],
	// deleted outright
	session: [
		'id',
		'expires_at',
		'token',
		'ip_address',
		'user_agent',
		'user_id',
		'impersonated_by',
		'created_at',
		'updated_at',
	],
	verification: [
		'id',
		'identifier',
		'value',
		'expires_at',
		'created_at',
		'updated_at',
	],
	// deleted outright; empty in production anyway, the plugin is dev-only
	devtools_user: [
		'id',
		'user_id',
		'template_key',
		'label',
		'email',
		'created_at',
		'updated_at',
	],
};

/**
 * `information_schema.columns`, modelled just far enough to select from. The
 * `Database` type promises only `rowCount` from a raw `execute()`, so a raw
 * query could not return rows through it.
 */
const informationSchema = pgSchema('information_schema');
const columns = informationSchema.table('columns', {
	tableSchema: text('table_schema').notNull(),
	tableName: text('table_name').notNull(),
	columnName: text('column_name').notNull(),
	ordinalPosition: integer('ordinal_position').notNull(),
});

const HERE = 'scripts/lib/schemaCoverage.ts';

/**
 * Where the live schema and `SANITIZED_COLUMNS` disagree, one line each for
 * the verification report. Empty means they match.
 *
 * Both directions fail: a live table or column the list lacks is a leak
 * until someone decides otherwise, and a listed column the schema no longer
 * has is a stale decision — harmless, but the list is only trustworthy if
 * it is kept exact.
 *
 * Only `public`, and not migration bookkeeping: the local runner keeps its
 * ledger in a `netlify` schema, and whatever the deploy-time runner does,
 * this check is about our tables — a platform table appearing here must
 * not fail every preview build.
 */
export async function coverageFailures(database: Database): Promise<string[]> {
	const rows = await database
		.select({ table: columns.tableName, column: columns.columnName })
		.from(columns)
		.where(eq(columns.tableSchema, 'public'))
		.orderBy(columns.tableName, columns.ordinalPosition);

	const live = new Map<string, Set<string>>();
	for (const row of rows) {
		if (row.table.includes('migration')) continue;
		live.set(row.table, (live.get(row.table) ?? new Set()).add(row.column));
	}

	const failures: string[] = [];

	for (const [table, liveColumns] of live) {
		const listed = SANITIZED_COLUMNS[table];
		if (!listed) {
			failures.push(`table "${table}" is not known to the sanitizer (${HERE})`);
			continue;
		}
		for (const column of liveColumns) {
			if (!listed.includes(column)) {
				failures.push(
					`column "${table}.${column}" is not known to the sanitizer (${HERE})`,
				);
			}
		}
	}

	for (const [table, listed] of Object.entries(SANITIZED_COLUMNS)) {
		const liveColumns = live.get(table);
		if (!liveColumns) {
			failures.push(`table "${table}" is listed in ${HERE} but does not exist`);
			continue;
		}
		for (const column of listed) {
			if (!liveColumns.has(column)) {
				failures.push(
					`column "${table}.${column}" is listed in ${HERE} but does not exist`,
				);
			}
		}
	}

	return failures;
}
