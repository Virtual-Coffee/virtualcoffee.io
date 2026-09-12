declare namespace NodeJS {
	interface ProcessEnv {
		// CMS
		CMS_URL?: string;
		CMS_TOKEN?: string;

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
		// The deploy-preview equivalents, read by the same module.
		PREVIEW_ADMIN_BYPASS?: string;
		PREVIEW_ADMIN_BYPASS_ROLES?: string;
		PREVIEW_ADMIN_BYPASS_SLACK_ID?: string;
		ADMIN_BOOTSTRAP_SLACK_IDS?: string;
		BETTER_AUTH_SECRET?: string;
		BETTER_AUTH_URL?: string;

		// Transactional email via Google Workspace SMTP
		GOOGLE_SMTP_USER?: string;
		GOOGLE_SMTP_APP_PASSWORD?: string;

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
