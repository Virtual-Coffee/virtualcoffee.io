CREATE TYPE "public"."application_event_type" AS ENUM('submitted', 'waitlisted', 'coffee_invited', 'attendance_recorded', 'approved', 'declined', 'withdrawn', 'lapsed', 'note', 'email_sent', 'email_failed', 'imported');CREATE TYPE "public"."application_source" AS ENUM('waitlist_signup', 'volunteer_invite');CREATE TYPE "public"."application_status" AS ENUM('waitlisted', 'coffee_invited', 'member', 'declined', 'withdrawn', 'lapsed');CREATE TYPE "public"."invite_status" AS ENUM('pending', 'accepted', 'completed');CREATE TYPE "public"."invite_token_purpose" AS ENUM('slack');CREATE TYPE "public"."submission_event_type" AS ENUM('submitted', 'status_changed', 'note', 'notification_sent', 'notification_failed', 'imported');CREATE TYPE "public"."submission_status" AS ENUM('new', 'in_progress', 'resolved', 'dismissed');CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
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
CREATE TABLE "application_event" (
	"id" uuid PRIMARY KEY NOT NULL,
	"application_id" uuid NOT NULL,
	"actor_user_id" text,
	"type" "application_event_type" NOT NULL,
	"from_status" "application_status",
	"to_status" "application_status",
	"body" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE TABLE "coc_report" (
	"id" uuid PRIMARY KEY NOT NULL,
	"reference" integer GENERATED ALWAYS AS IDENTITY (sequence name "coc_report_reference_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"status" "submission_status" DEFAULT 'new' NOT NULL,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"closed_at" timestamp with time zone,
	"airtable_record_id" text,
	"name" text,
	"email" text,
	"reportee_name" text NOT NULL,
	"time_location" text NOT NULL,
	"description" text NOT NULL,
	"anyone_else_involved" text,
	"attachment_blob_key" text,
	"attachment_filename" text,
	"attachment_content_type" text,
	"attachment_size" integer,
	CONSTRAINT "coc_report_airtable_record_id_unique" UNIQUE("airtable_record_id")
);
CREATE TABLE "coffee_table_group_request" (
	"id" uuid PRIMARY KEY NOT NULL,
	"reference" integer GENERATED ALWAYS AS IDENTITY (sequence name "coffee_table_group_request_reference_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"status" "submission_status" DEFAULT 'new' NOT NULL,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"closed_at" timestamp with time zone,
	"airtable_record_id" text,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"group_name" text,
	"description" text,
	CONSTRAINT "coffee_table_group_request_airtable_record_id_unique" UNIQUE("airtable_record_id")
);
CREATE TABLE "devtools_user" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"template_key" text NOT NULL,
	"label" text NOT NULL,
	"email" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "devtools_user_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "devtools_user_email_unique" UNIQUE("email")
);
CREATE TABLE "invite" (
	"id" uuid PRIMARY KEY NOT NULL,
	"inviter_user_id" text,
	"inviter_name" text,
	"invitee_name" text,
	"invitee_email" text,
	"status" "invite_status" DEFAULT 'pending' NOT NULL,
	"airtable_record_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "invite_airtable_record_id_unique" UNIQUE("airtable_record_id")
);
CREATE TABLE "invite_token" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"application_id" uuid NOT NULL,
	"purpose" "invite_token_purpose" NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "invite_token_token_hash_unique" UNIQUE("token_hash")
);
CREATE TABLE "lunch_and_learn_idea" (
	"id" uuid PRIMARY KEY NOT NULL,
	"reference" integer GENERATED ALWAYS AS IDENTITY (sequence name "lunch_and_learn_idea_reference_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"status" "submission_status" DEFAULT 'new' NOT NULL,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"closed_at" timestamp with time zone,
	"airtable_record_id" text,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"topic" text NOT NULL,
	"description" text,
	"format" text,
	"timing" text,
	"github_issue_url" text,
	CONSTRAINT "lunch_and_learn_idea_airtable_record_id_unique" UNIQUE("airtable_record_id")
);
CREATE TABLE "membership_application" (
	"id" uuid PRIMARY KEY NOT NULL,
	"reference" integer GENERATED ALWAYS AS IDENTITY (sequence name "membership_application_reference_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"status" "application_status" DEFAULT 'waitlisted' NOT NULL,
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
	"airtable_record_id" text,
	CONSTRAINT "membership_application_airtable_record_id_unique" UNIQUE("airtable_record_id")
);
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"token" text NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"impersonated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
CREATE TABLE "submission_event" (
	"id" uuid PRIMARY KEY NOT NULL,
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
				("submission_event"."coc_report_id" IS NOT NULL)::int
				+ ("submission_event"."volunteer_signup_id" IS NOT NULL)::int
				+ ("submission_event"."lunch_and_learn_idea_id" IS NOT NULL)::int
				+ ("submission_event"."coffee_table_group_request_id" IS NOT NULL)::int
			) = 1)
);
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"role" text,
	"banned" boolean DEFAULT false,
	"ban_reason" text,
	"ban_expires" timestamp with time zone,
	"role_granted_by" text,
	"role_granted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE TABLE "volunteer_signup" (
	"id" uuid PRIMARY KEY NOT NULL,
	"reference" integer GENERATED ALWAYS AS IDENTITY (sequence name "volunteer_signup_reference_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"status" "submission_status" DEFAULT 'new' NOT NULL,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"closed_at" timestamp with time zone,
	"airtable_record_id" text,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"github_username" text,
	"position" text,
	"description" text,
	CONSTRAINT "volunteer_signup_airtable_record_id_unique" UNIQUE("airtable_record_id")
);
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;ALTER TABLE "application_event" ADD CONSTRAINT "application_event_application_id_membership_application_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."membership_application"("id") ON DELETE cascade ON UPDATE no action;ALTER TABLE "application_event" ADD CONSTRAINT "application_event_actor_user_id_user_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;ALTER TABLE "devtools_user" ADD CONSTRAINT "devtools_user_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;ALTER TABLE "invite" ADD CONSTRAINT "invite_inviter_user_id_user_id_fk" FOREIGN KEY ("inviter_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;ALTER TABLE "invite_token" ADD CONSTRAINT "invite_token_application_id_membership_application_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."membership_application"("id") ON DELETE cascade ON UPDATE no action;ALTER TABLE "membership_application" ADD CONSTRAINT "membership_application_invite_id_invite_id_fk" FOREIGN KEY ("invite_id") REFERENCES "public"."invite"("id") ON DELETE set null ON UPDATE no action;ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;ALTER TABLE "submission_event" ADD CONSTRAINT "submission_event_coc_report_id_coc_report_id_fk" FOREIGN KEY ("coc_report_id") REFERENCES "public"."coc_report"("id") ON DELETE cascade ON UPDATE no action;ALTER TABLE "submission_event" ADD CONSTRAINT "submission_event_volunteer_signup_id_volunteer_signup_id_fk" FOREIGN KEY ("volunteer_signup_id") REFERENCES "public"."volunteer_signup"("id") ON DELETE cascade ON UPDATE no action;ALTER TABLE "submission_event" ADD CONSTRAINT "submission_event_lunch_and_learn_idea_id_lunch_and_learn_idea_id_fk" FOREIGN KEY ("lunch_and_learn_idea_id") REFERENCES "public"."lunch_and_learn_idea"("id") ON DELETE cascade ON UPDATE no action;ALTER TABLE "submission_event" ADD CONSTRAINT "submission_event_coffee_table_group_request_id_coffee_table_group_request_id_fk" FOREIGN KEY ("coffee_table_group_request_id") REFERENCES "public"."coffee_table_group_request"("id") ON DELETE cascade ON UPDATE no action;ALTER TABLE "submission_event" ADD CONSTRAINT "submission_event_actor_user_id_user_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;CREATE INDEX "account_user_id_idx" ON "account" USING btree ("user_id");CREATE INDEX "application_event_application_id_idx" ON "application_event" USING btree ("application_id");CREATE INDEX "coc_report_status_idx" ON "coc_report" USING btree ("status");CREATE INDEX "coc_report_submitted_at_idx" ON "coc_report" USING btree ("submitted_at");CREATE INDEX "coffee_table_group_request_status_idx" ON "coffee_table_group_request" USING btree ("status");CREATE INDEX "coffee_table_group_request_submitted_at_idx" ON "coffee_table_group_request" USING btree ("submitted_at");CREATE INDEX "invite_token_application_id_idx" ON "invite_token" USING btree ("application_id");CREATE INDEX "lunch_and_learn_idea_status_idx" ON "lunch_and_learn_idea" USING btree ("status");CREATE INDEX "lunch_and_learn_idea_submitted_at_idx" ON "lunch_and_learn_idea" USING btree ("submitted_at");CREATE INDEX "membership_application_status_idx" ON "membership_application" USING btree ("status");CREATE INDEX "membership_application_email_idx" ON "membership_application" USING btree ("email");CREATE INDEX "membership_application_submitted_at_idx" ON "membership_application" USING btree ("submitted_at");CREATE INDEX "session_user_id_idx" ON "session" USING btree ("user_id");CREATE INDEX "submission_event_coc_report_id_idx" ON "submission_event" USING btree ("coc_report_id");CREATE INDEX "submission_event_volunteer_signup_id_idx" ON "submission_event" USING btree ("volunteer_signup_id");CREATE INDEX "submission_event_lunch_and_learn_idea_id_idx" ON "submission_event" USING btree ("lunch_and_learn_idea_id");CREATE INDEX "submission_event_coffee_table_group_request_id_idx" ON "submission_event" USING btree ("coffee_table_group_request_id");CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");CREATE INDEX "volunteer_signup_status_idx" ON "volunteer_signup" USING btree ("status");CREATE INDEX "volunteer_signup_submitted_at_idx" ON "volunteer_signup" USING btree ("submitted_at");