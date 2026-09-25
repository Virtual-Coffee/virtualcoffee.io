CREATE TYPE "accrual_notice_outcome" AS ENUM('sent', 'failed', 'no_address');--> statement-breakpoint
CREATE TABLE "volunteer_accrual_notice" (
	"id" uuid PRIMARY KEY,
	"ledger_id" uuid NOT NULL UNIQUE,
	"outcome" "accrual_notice_outcome" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "volunteer_accrual_notice" ADD CONSTRAINT "volunteer_accrual_notice_ledger_id_fkey" FOREIGN KEY ("ledger_id") REFERENCES "volunteer_invite_ledger"("id") ON DELETE RESTRICT;