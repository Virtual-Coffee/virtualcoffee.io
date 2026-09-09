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
ALTER TABLE "devtools_user" ADD CONSTRAINT "devtools_user_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;