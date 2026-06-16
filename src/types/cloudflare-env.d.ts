declare module 'cloudflare:workers' {
	export interface Env {
		SITE_URL: string;
		ENVIRONMENT: 'production' | 'preview' | 'development' | string;
		CMS_URL?: string;
		CMS_TOKEN?: string;
		GITHUB_TOKEN?: string;
		FORMS_AIRTABLE_API_KEY?: string;
		PUBLIC_AIRTABLE_API_KEY?: string;
		REVALIDATE_SECRET?: string;
		SLACK_JOIN_LINK?: string;
		ZOOM_TUESDAYS?: string;
		ZOOM_THURSDAYS?: string;
	}

	export const env: Env;
}
