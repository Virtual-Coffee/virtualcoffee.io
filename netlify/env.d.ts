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
		// override one-off scripts use (see scripts/with-local-db.sh).
		NETLIFY_DB_URL?: string;
		DATABASE_URL?: string;
		ADMIN_DEV_BYPASS?: string;
		ADMIN_BOOTSTRAP_EMAILS?: string;
		BETTER_AUTH_SECRET?: string;
		BETTER_AUTH_URL?: string;

		// Transactional email via Google Workspace SMTP
		GOOGLE_SMTP_USER?: string;
		GOOGLE_SMTP_APP_PASSWORD?: string;

		// Airtable
		MEMBERSHIP_AIRTABLE_API_KEY?: string;
		FORMS_AIRTABLE_API_KEY?: string;
		PUBLIC_AIRTABLE_API_KEY?: string;
	}
}
