CREATE TYPE "public"."volunteer_ledger_reason" AS ENUM('monthly_accrual', 'imported', 'admin_grant', 'admin_revoke', 'spend', 'refund_cancelled', 'refund_expired');--> statement-breakpoint
ALTER TYPE "public"."invite_status" ADD VALUE 'expired';--> statement-breakpoint
ALTER TYPE "public"."invite_status" ADD VALUE 'cancelled';--> statement-breakpoint
CREATE TABLE "volunteer" (
	"id" uuid PRIMARY KEY NOT NULL,
	"slack_user_id" text NOT NULL,
	"slack_display_name" text NOT NULL,
	"slack_handle" text,
	"user_id" text,
	"role_labels" text,
	"deactivated_at" timestamp with time zone,
	"airtable_record_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "volunteer_slack_user_id_unique" UNIQUE("slack_user_id"),
	CONSTRAINT "volunteer_airtable_record_id_unique" UNIQUE("airtable_record_id")
);
--> statement-breakpoint
CREATE TABLE "volunteer_invite_ledger" (
	"id" uuid PRIMARY KEY NOT NULL,
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
ALTER TABLE "invite" ADD COLUMN "inviter_slack_user_id" text;--> statement-breakpoint
ALTER TABLE "invite" ADD COLUMN "token_hash" text;--> statement-breakpoint
ALTER TABLE "invite" ADD COLUMN "token_expires_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "invite" ADD COLUMN "claimed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "volunteer" ADD CONSTRAINT "volunteer_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "volunteer_invite_ledger" ADD CONSTRAINT "volunteer_invite_ledger_invite_id_invite_id_fk" FOREIGN KEY ("invite_id") REFERENCES "public"."invite"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "volunteer_invite_ledger" ADD CONSTRAINT "volunteer_invite_ledger_actor_user_id_user_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "volunteer_invite_ledger_accrual_period_idx" ON "volunteer_invite_ledger" USING btree ("slack_user_id","period_key") WHERE reason = 'monthly_accrual';--> statement-breakpoint
CREATE UNIQUE INDEX "volunteer_invite_ledger_invite_reason_idx" ON "volunteer_invite_ledger" USING btree ("invite_id","reason") WHERE invite_id is not null;--> statement-breakpoint
CREATE INDEX "volunteer_invite_ledger_slack_user_id_idx" ON "volunteer_invite_ledger" USING btree ("slack_user_id");--> statement-breakpoint
ALTER TABLE "invite" ADD CONSTRAINT "invite_token_hash_unique" UNIQUE("token_hash");