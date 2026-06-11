declare namespace NodeJS {
	interface ProcessEnv {
		// CMS
		CMS_URL?: string;
		CMS_TOKEN?: string;

		// Slack
		SLACK_JOIN_LINK?: string;

		// Zoom
		ZOOM_TUESDAYS?: string;
		ZOOM_THURSDAYS?: string;
	}
}
