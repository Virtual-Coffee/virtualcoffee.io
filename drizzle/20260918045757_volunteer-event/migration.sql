CREATE TYPE "volunteer_event_type" AS ENUM('email_sent', 'email_failed', 'notification_sent', 'notification_failed');--> statement-breakpoint
CREATE TABLE "volunteer_event" (
	"id" uuid PRIMARY KEY,
	"volunteer_id" uuid NOT NULL,
	"actor_user_id" text,
	"type" "volunteer_event_type" NOT NULL,
	"body" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "volunteer_event_volunteer_id_idx" ON "volunteer_event" ("volunteer_id");--> statement-breakpoint
ALTER TABLE "volunteer_event" ADD CONSTRAINT "volunteer_event_volunteer_id_volunteer_id_fkey" FOREIGN KEY ("volunteer_id") REFERENCES "volunteer"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "volunteer_event" ADD CONSTRAINT "volunteer_event_actor_user_id_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "user"("id") ON DELETE SET NULL;