declare namespace NodeJS {
	interface ProcessEnv {
		// Google Calendar (events)
		GOOGLE_SERVICE_ACCOUNT_KEY?: string;
		GOOGLE_CALENDAR_ID?: string;

		// Slack
		SLACK_JOIN_LINK?: string;

		// Zoom
		ZOOM_TUESDAYS?: string;
		ZOOM_THURSDAYS?: string;
	}
}
