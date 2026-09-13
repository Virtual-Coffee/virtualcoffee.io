declare namespace NodeJS {
	interface ProcessEnv {
		// Google Calendar (events)
		GOOGLE_SERVICE_ACCOUNT_KEY?: string;
		GOOGLE_CALENDAR_ID?: string;

		// Slack
		SLACK_JOIN_LINK?: string;
		SLACK_CLIENT_ID?: string;
		SLACK_CLIENT_SECRET?: string;
		SLACK_TEAM_ID?: string;

		// Zoom
		ZOOM_TUESDAYS?: string;
		ZOOM_THURSDAYS?: string;

		// Membership database and /admin
		// NETLIFY_DB_URL is set by the Netlify runtime; DATABASE_URL is the
		// override one-off scripts use (see scripts/with-local-netlify.ts).
		NETLIFY_DB_URL?: string;
		DATABASE_URL?: string;
		ADMIN_DEV_BYPASS?: string;
		ADMIN_DEV_BYPASS_ROLES?: string;
		// The Slack member id the dev bypass acts as. Everything about an Invite
		// Allowance keys on it, so /invites needs one to find a volunteer row.
		ADMIN_DEV_BYPASS_SLACK_ID?: string;
		ADMIN_BOOTSTRAP_SLACK_IDS?: string;
		BETTER_AUTH_SECRET?: string;
		// Shared by every deploy context: a preview signs in through
		// production's OAuth callback, and this encrypts what crosses over.
		OAUTH_PROXY_SECRET?: string;

		// Transactional email via Google Workspace SMTP, XOAUTH2 as a service
		// account (the JSON key file, whole) impersonating the user.
		GOOGLE_SMTP_USER?: string;
		GMAIL_SERVICE_ACCOUNT_KEY?: string;
		// Delivery Mode outside production (docs/adr/0013): Slack/GitHub are
		// captured unless this is the literal `true`.
		NOTIFY_LIVE_OUTSIDE_PRODUCTION?: string;
		// Email is captured unless sent to a local-only SMTP sink such as
		// Mailpit — no Google credentials read, addressed exactly as production
		// would. Takes SMTP_PORT (default 1025).
		SMTP_HOST?: string;
		SMTP_PORT?: string;
		// Set by `pnpm email:dev` only: where the templates' images load from
		// while the preview server, not production, is serving them.
		EMAIL_ASSET_ORIGIN?: string;

		// Slack notifications for inbound Submissions. One incoming webhook per
		// destination, so a missing one only silences its own form.
		SLACK_WEBHOOK_COC?: string;
		SLACK_WEBHOOK_VOLUNTEERS?: string;
		SLACK_WEBHOOK_LUNCH_AND_LEARN?: string;
		SLACK_WEBHOOK_COFFEE_TABLES?: string;
		// Not a Submission kind: the membership pipeline, which had no Slack
		// notification at all until an invited application needed to announce
		// itself at the front of the queue.
		SLACK_WEBHOOK_MEMBERSHIP?: string;

		// Bot token with `users:read`, for the Slack member directory the
		// "Grant access" picker reads. A separate credential from SLACK_CLIENT_*:
		// those scopes are OIDC-only and cannot call users.list.
		SLACK_BOT_TOKEN?: string;

		// The GitHub App CI already uses, for the Lunch & Learn issue — the same
		// App the workflows read as the CI_APP_* Actions secrets. Not the same
		// credential as GITHUB_TOKEN, which stays a permission-less PAT.
		GITHUB_APP_CLIENT_ID?: string;
		GITHUB_APP_PRIVATE_KEY?: string;

		// Netlify Blobs credentials, needed only by the one-off submissions
		// import — the runtime finds its own.
		NETLIFY_SITE_ID?: string;
		NETLIFY_AUTH_TOKEN?: string;

		// Airtable — one-off scripts only; nothing reads these at runtime.
		MEMBERSHIP_AIRTABLE_API_KEY?: string;
		FORMS_AIRTABLE_API_KEY?: string;
		PUBLIC_AIRTABLE_API_KEY?: string;
	}
}
