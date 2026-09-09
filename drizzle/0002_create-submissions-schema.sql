CREATE TYPE "public"."submission_event_type" AS ENUM('submitted', 'status_changed', 'note', 'notification_sent', 'notification_failed', 'imported');--> statement-breakpoint
CREATE TYPE "public"."submission_status" AS ENUM('new', 'in_progress', 'resolved', 'dismissed');--> statement-breakpoint
CREATE TABLE "coc_report" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "coc_report_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
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
--> statement-breakpoint
CREATE TABLE "coffee_table_group_request" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "coffee_table_group_request_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
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
--> statement-breakpoint
CREATE TABLE "lunch_and_learn_idea" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "lunch_and_learn_idea_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
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
--> statement-breakpoint
CREATE TABLE "submission_event" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "submission_event_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"coc_report_id" integer,
	"volunteer_signup_id" integer,
	"lunch_and_learn_idea_id" integer,
	"coffee_table_group_request_id" integer,
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
--> statement-breakpoint
CREATE TABLE "volunteer_signup" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "volunteer_signup_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
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
--> statement-breakpoint
ALTER TABLE "submission_event" ADD CONSTRAINT "submission_event_coc_report_id_coc_report_id_fk" FOREIGN KEY ("coc_report_id") REFERENCES "public"."coc_report"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submission_event" ADD CONSTRAINT "submission_event_volunteer_signup_id_volunteer_signup_id_fk" FOREIGN KEY ("volunteer_signup_id") REFERENCES "public"."volunteer_signup"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submission_event" ADD CONSTRAINT "submission_event_lunch_and_learn_idea_id_lunch_and_learn_idea_id_fk" FOREIGN KEY ("lunch_and_learn_idea_id") REFERENCES "public"."lunch_and_learn_idea"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submission_event" ADD CONSTRAINT "submission_event_coffee_table_group_request_id_coffee_table_group_request_id_fk" FOREIGN KEY ("coffee_table_group_request_id") REFERENCES "public"."coffee_table_group_request"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submission_event" ADD CONSTRAINT "submission_event_actor_user_id_user_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "coc_report_status_idx" ON "coc_report" USING btree ("status");--> statement-breakpoint
CREATE INDEX "coc_report_submitted_at_idx" ON "coc_report" USING btree ("submitted_at");--> statement-breakpoint
CREATE INDEX "coffee_table_group_request_status_idx" ON "coffee_table_group_request" USING btree ("status");--> statement-breakpoint
CREATE INDEX "coffee_table_group_request_submitted_at_idx" ON "coffee_table_group_request" USING btree ("submitted_at");--> statement-breakpoint
CREATE INDEX "lunch_and_learn_idea_status_idx" ON "lunch_and_learn_idea" USING btree ("status");--> statement-breakpoint
CREATE INDEX "lunch_and_learn_idea_submitted_at_idx" ON "lunch_and_learn_idea" USING btree ("submitted_at");--> statement-breakpoint
CREATE INDEX "submission_event_coc_report_id_idx" ON "submission_event" USING btree ("coc_report_id");--> statement-breakpoint
CREATE INDEX "submission_event_volunteer_signup_id_idx" ON "submission_event" USING btree ("volunteer_signup_id");--> statement-breakpoint
CREATE INDEX "submission_event_lunch_and_learn_idea_id_idx" ON "submission_event" USING btree ("lunch_and_learn_idea_id");--> statement-breakpoint
CREATE INDEX "submission_event_coffee_table_group_request_id_idx" ON "submission_event" USING btree ("coffee_table_group_request_id");--> statement-breakpoint
CREATE INDEX "volunteer_signup_status_idx" ON "volunteer_signup" USING btree ("status");--> statement-breakpoint
CREATE INDEX "volunteer_signup_submitted_at_idx" ON "volunteer_signup" USING btree ("submitted_at");