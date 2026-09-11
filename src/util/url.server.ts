export const buildUrls: BuildUrls = {
	NETLIFY: process.env.NETLIFY,
	URL: process.env.URL as string,
	DEPLOY_PRIME_URL: process.env.DEPLOY_PRIME_URL,
	CONTEXT: process.env.CONTEXT,
};

type BuildUrls = {
	URL: string;
	NETLIFY?: string;
	CONTEXT?: string;
	DEPLOY_PRIME_URL?: string;
};

/**
 * The site's own origin for links in emails, with no trailing slash.
 *
 * `URL` is what Netlify sets to the primary site URL on every deploy, and it
 * is also what `.env.example` sets locally, so a Coffee invite sent from
 * `netlify dev` links back to localhost rather than to production.
 */
export function siteUrl(): string {
	return process.env.URL?.replace(/\/$/, '') ?? 'https://virtualcoffee.io';
}
