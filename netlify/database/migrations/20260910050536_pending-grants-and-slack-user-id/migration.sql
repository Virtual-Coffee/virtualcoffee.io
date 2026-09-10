CREATE TABLE "pending_grant" (
	"id" uuid PRIMARY KEY NOT NULL,
	"slack_user_id" text NOT NULL,
	"slack_display_name" text NOT NULL,
	"slack_handle" text,
	"role" text NOT NULL,
	"granted_by" text NOT NULL,
	"granted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"claimed_at" timestamp with time zone,
	"claimed_user_id" text
);
ALTER TABLE "user" ADD COLUMN "slack_user_id" text;UPDATE "user" SET "slack_user_id" = a."account_id" FROM "account" a WHERE a."user_id" = "user"."id" AND a."provider_id" = 'slack';ALTER TABLE "pending_grant" ADD CONSTRAINT "pending_grant_claimed_user_id_user_id_fk" FOREIGN KEY ("claimed_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;CREATE UNIQUE INDEX "pending_grant_unclaimed_slack_user_id_idx" ON "pending_grant" USING btree ("slack_user_id") WHERE claimed_at is null;CREATE INDEX "pending_grant_claimed_user_id_idx" ON "pending_grant" USING btree ("claimed_user_id");ALTER TABLE "user" ADD CONSTRAINT "user_slack_user_id_unique" UNIQUE("slack_user_id");