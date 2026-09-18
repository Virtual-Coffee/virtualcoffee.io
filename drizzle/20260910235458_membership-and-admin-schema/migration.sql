CREATE TYPE "application_event_type" AS ENUM('submitted', 'waitlisted', 'coffee_invited', 'attendance_recorded', 'approved', 'declined', 'withdrawn', 'lapsed', 'note', 'email_sent', 'email_failed', 'notification_sent', 'notification_failed', 'imported');--> statement-breakpoint
CREATE TYPE "application_source" AS ENUM('waitlist_signup', 'volunteer_invite');--> statement-breakpoint
CREATE TYPE "application_status" AS ENUM('waitlisted', 'coffee_invited', 'member', 'declined', 'withdrawn', 'lapsed');--> statement-breakpoint
CREATE TYPE "invite_status" AS ENUM('pending', 'accepted', 'completed', 'expired', 'cancelled');--> statement-breakpoint
CREATE TYPE "invite_token_purpose" AS ENUM('slack');--> statement-breakpoint
CREATE TYPE "submission_event_type" AS ENUM('submitted', 'status_changed', 'note', 'notification_sent', 'notification_failed', 'imported');--> statement-breakpoint
CREATE TYPE "submission_status" AS ENUM('new', 'in_progress', 'resolved', 'dismissed');--> statement-breakpoint
CREATE TYPE "volunteer_ledger_reason" AS ENUM('monthly_accrual', 'imported', 'admin_grant', 'admin_revoke', 'spend', 'refund_cancelled', 'refund_expired');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"password" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "application_event" (
	"id" uuid PRIMARY KEY,
	"application_id" uuid NOT NULL,
	"actor_user_id" text,
	"type" "application_event_type" NOT NULL,
	"from_status" "application_status",
	"to_status" "application_status",
	"body" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "coc_report" (
	"id" uuid PRIMARY KEY,
	"reference" integer GENERATED ALWAYS AS IDENTITY (sequence name "coc_report_reference_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"status" "submission_status" DEFAULT 'new'::"submission_status" NOT NULL,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"closed_at" timestamp with time zone,
	"airtable_record_id" text CONSTRAINT "coc_report_airtable_record_id_unique" UNIQUE,
	"name" text,
	"email" text,
	"reportee_name" text NOT NULL,
	"time_location" text NOT NULL,
	"description" text NOT NULL,
	"anyone_else_involved" text,
	"attachment_blob_key" text,
	"attachment_filename" text,
	"attachment_content_type" text,
	"attachment_size" integer
);
--> statement-breakpoint
CREATE TABLE "coffee_table_group_request" (
	"id" uuid PRIMARY KEY,
	"reference" integer GENERATED ALWAYS AS IDENTITY (sequence name "coffee_table_group_request_reference_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"status" "submission_status" DEFAULT 'new'::"submission_status" NOT NULL,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"closed_at" timestamp with time zone,
	"airtable_record_id" text CONSTRAINT "coffee_table_group_request_airtable_record_id_unique" UNIQUE,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"group_name" text,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "devtools_user" (
	"id" text PRIMARY KEY,
	"user_id" text NOT NULL UNIQUE,
	"template_key" text NOT NULL,
	"label" text NOT NULL,
	"email" text NOT NULL UNIQUE,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invite" (
	"id" uuid PRIMARY KEY,
	"inviter_user_id" text,
	"inviter_name" text,
	"inviter_slack_user_id" text,
	"invitee_name" text,
	"invitee_email" text,
	"status" "invite_status" DEFAULT 'pending'::"invite_status" NOT NULL,
	"token_hash" text UNIQUE,
	"token_expires_at" timestamp with time zone,
	"claimed_at" timestamp with time zone,
	"airtable_record_id" text UNIQUE,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invite_token" (
	"id" uuid PRIMARY KEY,
	"application_id" uuid NOT NULL,
	"purpose" "invite_token_purpose" NOT NULL,
	"token_hash" text NOT NULL UNIQUE,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lunch_and_learn_idea" (
	"id" uuid PRIMARY KEY,
	"reference" integer GENERATED ALWAYS AS IDENTITY (sequence name "lunch_and_learn_idea_reference_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"status" "submission_status" DEFAULT 'new'::"submission_status" NOT NULL,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"closed_at" timestamp with time zone,
	"airtable_record_id" text CONSTRAINT "lunch_and_learn_idea_airtable_record_id_unique" UNIQUE,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"topic" text NOT NULL,
	"description" text,
	"format" text,
	"timing" text,
	"github_issue_url" text
);
--> statement-breakpoint
CREATE TABLE "membership_application" (
	"id" uuid PRIMARY KEY,
	"reference" integer GENERATED ALWAYS AS IDENTITY (sequence name "membership_application_reference_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"status" "application_status" DEFAULT 'waitlisted'::"application_status" NOT NULL,
	"source" "application_source" NOT NULL,
	"is_priority" boolean DEFAULT false NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"pronouns" text,
	"github_username" text,
	"twitter_username" text,
	"how_did_you_hear" text,
	"journey" text,
	"code_interests" text,
	"virtual_coffee" text,
	"agreed_to_coc_at" timestamp with time zone,
	"referrer" text,
	"invite_id" uuid,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"waitlisted_at" timestamp with time zone,
	"coffee_invited_at" timestamp with time zone,
	"coffee_attended_at" timestamp with time zone,
	"approved_at" timestamp with time zone,
	"closed_at" timestamp with time zone,
	"airtable_record_id" text UNIQUE
);
--> statement-breakpoint
CREATE TABLE "pending_grant" (
	"id" uuid PRIMARY KEY,
	"slack_user_id" text NOT NULL,
	"slack_display_name" text NOT NULL,
	"slack_handle" text,
	"role" text NOT NULL,
	"granted_by" text NOT NULL,
	"granted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"claimed_at" timestamp with time zone,
	"claimed_user_id" text
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY,
	"expires_at" timestamp with time zone NOT NULL,
	"token" text NOT NULL UNIQUE,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"impersonated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "submission_event" (
	"id" uuid PRIMARY KEY,
	"coc_report_id" uuid,
	"volunteer_signup_id" uuid,
	"lunch_and_learn_idea_id" uuid,
	"coffee_table_group_request_id" uuid,
	"actor_user_id" text,
	"type" "submission_event_type" NOT NULL,
	"from_status" "submission_status",
	"to_status" "submission_status",
	"body" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "submission_event_exactly_one_subject" CHECK ((
				("coc_report_id" IS NOT NULL)::int
				+ ("volunteer_signup_id" IS NOT NULL)::int
				+ ("lunch_and_learn_idea_id" IS NOT NULL)::int
				+ ("coffee_table_group_request_id" IS NOT NULL)::int
			) = 1)
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"email" text NOT NULL UNIQUE,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"role" text,
	"banned" boolean DEFAULT false,
	"ban_reason" text,
	"ban_expires" timestamp with time zone,
	"role_granted_by" text,
	"role_granted_at" timestamp with time zone,
	"slack_user_id" text UNIQUE,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "volunteer" (
	"id" uuid PRIMARY KEY,
	"slack_user_id" text NOT NULL UNIQUE,
	"slack_display_name" text NOT NULL,
	"slack_handle" text,
	"user_id" text,
	"email" text,
	"role_labels" text,
	"deactivated_at" timestamp with time zone,
	"airtable_record_id" text UNIQUE,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "volunteer_invite_ledger" (
	"id" uuid PRIMARY KEY,
	"slack_user_id" text NOT NULL,
	"delta" integer NOT NULL,
	"reason" "volunteer_ledger_reason" NOT NULL,
	"period_key" text,
	"invite_id" uuid,
	"actor_user_id" text,
	"body" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "volunteer_signup" (
	"id" uuid PRIMARY KEY,
	"reference" integer GENERATED ALWAYS AS IDENTITY (sequence name "volunteer_signup_reference_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"status" "submission_status" DEFAULT 'new'::"submission_status" NOT NULL,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"closed_at" timestamp with time zone,
	"airtable_record_id" text CONSTRAINT "volunteer_signup_airtable_record_id_unique" UNIQUE,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"github_username" text,
	"position" text,
	"description" text
);
--> statement-breakpoint
CREATE INDEX "account_user_id_idx" ON "account" ("user_id");--> statement-breakpoint
CREATE INDEX "application_event_application_id_idx" ON "application_event" ("application_id");--> statement-breakpoint
CREATE INDEX "coc_report_status_idx" ON "coc_report" ("status");--> statement-breakpoint
CREATE INDEX "coc_report_submitted_at_idx" ON "coc_report" ("submitted_at");--> statement-breakpoint
CREATE INDEX "coffee_table_group_request_status_idx" ON "coffee_table_group_request" ("status");--> statement-breakpoint
CREATE INDEX "coffee_table_group_request_submitted_at_idx" ON "coffee_table_group_request" ("submitted_at");--> statement-breakpoint
CREATE INDEX "invite_token_application_id_idx" ON "invite_token" ("application_id");--> statement-breakpoint
CREATE INDEX "lunch_and_learn_idea_status_idx" ON "lunch_and_learn_idea" ("status");--> statement-breakpoint
CREATE INDEX "lunch_and_learn_idea_submitted_at_idx" ON "lunch_and_learn_idea" ("submitted_at");--> statement-breakpoint
CREATE INDEX "membership_application_status_idx" ON "membership_application" ("status");--> statement-breakpoint
CREATE INDEX "membership_application_email_idx" ON "membership_application" ("email");--> statement-breakpoint
CREATE INDEX "membership_application_submitted_at_idx" ON "membership_application" ("submitted_at");--> statement-breakpoint
CREATE UNIQUE INDEX "pending_grant_unclaimed_slack_user_id_idx" ON "pending_grant" ("slack_user_id") WHERE claimed_at is null;--> statement-breakpoint
CREATE INDEX "pending_grant_claimed_user_id_idx" ON "pending_grant" ("claimed_user_id");--> statement-breakpoint
CREATE INDEX "session_user_id_idx" ON "session" ("user_id");--> statement-breakpoint
CREATE INDEX "submission_event_coc_report_id_idx" ON "submission_event" ("coc_report_id");--> statement-breakpoint
CREATE INDEX "submission_event_volunteer_signup_id_idx" ON "submission_event" ("volunteer_signup_id");--> statement-breakpoint
CREATE INDEX "submission_event_lunch_and_learn_idea_id_idx" ON "submission_event" ("lunch_and_learn_idea_id");--> statement-breakpoint
CREATE INDEX "submission_event_coffee_table_group_request_id_idx" ON "submission_event" ("coffee_table_group_request_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" ("identifier");--> statement-breakpoint
CREATE UNIQUE INDEX "volunteer_invite_ledger_accrual_period_idx" ON "volunteer_invite_ledger" ("slack_user_id","period_key") WHERE reason = 'monthly_accrual';--> statement-breakpoint
CREATE UNIQUE INDEX "volunteer_invite_ledger_spend_idx" ON "volunteer_invite_ledger" ("invite_id") WHERE reason = 'spend';--> statement-breakpoint
CREATE UNIQUE INDEX "volunteer_invite_ledger_refund_idx" ON "volunteer_invite_ledger" ("invite_id") WHERE reason in ('refund_cancelled', 'refund_expired');--> statement-breakpoint
CREATE INDEX "volunteer_invite_ledger_slack_user_id_idx" ON "volunteer_invite_ledger" ("slack_user_id");--> statement-breakpoint
CREATE INDEX "volunteer_signup_status_idx" ON "volunteer_signup" ("status");--> statement-breakpoint
CREATE INDEX "volunteer_signup_submitted_at_idx" ON "volunteer_signup" ("submitted_at");--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "application_event" ADD CONSTRAINT "application_event_application_id_membership_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "membership_application"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "application_event" ADD CONSTRAINT "application_event_actor_user_id_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "user"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "devtools_user" ADD CONSTRAINT "devtools_user_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "invite" ADD CONSTRAINT "invite_inviter_user_id_user_id_fkey" FOREIGN KEY ("inviter_user_id") REFERENCES "user"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "invite_token" ADD CONSTRAINT "invite_token_application_id_membership_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "membership_application"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "membership_application" ADD CONSTRAINT "membership_application_invite_id_invite_id_fkey" FOREIGN KEY ("invite_id") REFERENCES "invite"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "pending_grant" ADD CONSTRAINT "pending_grant_claimed_user_id_user_id_fkey" FOREIGN KEY ("claimed_user_id") REFERENCES "user"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "submission_event" ADD CONSTRAINT "submission_event_coc_report_id_coc_report_id_fkey" FOREIGN KEY ("coc_report_id") REFERENCES "coc_report"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "submission_event" ADD CONSTRAINT "submission_event_volunteer_signup_id_volunteer_signup_id_fkey" FOREIGN KEY ("volunteer_signup_id") REFERENCES "volunteer_signup"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "submission_event" ADD CONSTRAINT "submission_event_y0LR9AjhAt4D_fkey" FOREIGN KEY ("lunch_and_learn_idea_id") REFERENCES "lunch_and_learn_idea"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "submission_event" ADD CONSTRAINT "submission_event_4vQ9fBdieLHB_fkey" FOREIGN KEY ("coffee_table_group_request_id") REFERENCES "coffee_table_group_request"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "submission_event" ADD CONSTRAINT "submission_event_actor_user_id_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "user"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "volunteer" ADD CONSTRAINT "volunteer_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "volunteer_invite_ledger" ADD CONSTRAINT "volunteer_invite_ledger_invite_id_invite_id_fkey" FOREIGN KEY ("invite_id") REFERENCES "invite"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "volunteer_invite_ledger" ADD CONSTRAINT "volunteer_invite_ledger_actor_user_id_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "user"("id") ON DELETE SET NULL;