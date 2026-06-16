declare module 'cloudflare:workers' {
	export interface Env {
		SITE_URL: string;
		ENVIRONMENT: 'production' | 'preview' | 'development' | string;
		CMS_URL?: string;
		CMS_TOKEN?: string;
		GITHUB_TOKEN?: string;
		FORMS_AIRTABLE_API_KEY?: string;
		PUBLIC_AIRTABLE_API_KEY?: string;
	}

	export const env: Env;
}
