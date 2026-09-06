CREATE TYPE "public"."application_event_type" AS ENUM('submitted', 'waitlisted', 'coffee_invited', 'attendance_recorded', 'approved', 'declined', 'withdrawn', 'lapsed', 'note', 'email_sent', 'email_failed', 'imported');CREATE TYPE "public"."application_source" AS ENUM('waitlist_signup', 'volunteer_invite');CREATE TYPE "public"."application_status" AS ENUM('waitlisted', 'coffee_invited', 'member', 'declined', 'withdrawn', 'lapsed');CREATE TYPE "public"."invite_status" AS ENUM('pending', 'accepted', 'completed');CREATE TYPE "public"."invite_token_purpose" AS ENUM('slack');CREATE TABLE "account" (
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
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "application_event_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"application_id" integer NOT NULL,
	"actor_user_id" text,
	"type" "application_event_type" NOT NULL,
	"from_status" "application_status",
	"to_status" "application_status",
	"body" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE TABLE "invite" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "invite_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
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
	"application_id" integer NOT NULL,
	"purpose" "invite_token_purpose" NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "invite_token_token_hash_unique" UNIQUE("token_hash")
);
CREATE TABLE "membership_application" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "membership_application_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
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
	"invite_id" integer,
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
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;ALTER TABLE "application_event" ADD CONSTRAINT "application_event_application_id_membership_application_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."membership_application"("id") ON DELETE cascade ON UPDATE no action;ALTER TABLE "application_event" ADD CONSTRAINT "application_event_actor_user_id_user_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;ALTER TABLE "invite" ADD CONSTRAINT "invite_inviter_user_id_user_id_fk" FOREIGN KEY ("inviter_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;ALTER TABLE "invite_token" ADD CONSTRAINT "invite_token_application_id_membership_application_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."membership_application"("id") ON DELETE cascade ON UPDATE no action;ALTER TABLE "membership_application" ADD CONSTRAINT "membership_application_invite_id_invite_id_fk" FOREIGN KEY ("invite_id") REFERENCES "public"."invite"("id") ON DELETE set null ON UPDATE no action;ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;CREATE INDEX "account_user_id_idx" ON "account" USING btree ("user_id");CREATE INDEX "application_event_application_id_idx" ON "application_event" USING btree ("application_id");CREATE INDEX "invite_token_application_id_idx" ON "invite_token" USING btree ("application_id");CREATE INDEX "membership_application_status_idx" ON "membership_application" USING btree ("status");CREATE INDEX "membership_application_email_idx" ON "membership_application" USING btree ("email");CREATE INDEX "membership_application_submitted_at_idx" ON "membership_application" USING btree ("submitted_at");CREATE INDEX "session_user_id_idx" ON "session" USING btree ("user_id");CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");