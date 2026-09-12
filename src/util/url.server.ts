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
 * `URL` is the site's main address on every Netlify deploy — the production
 * domain, even on a deploy preview — so a preview prefers `DEPLOY_PRIME_URL`,
 * which is the preview's own address; otherwise a Claim Link minted on a
 * preview would land on production. Locally `.env.example` sets `URL`, so a
 * Coffee invite sent from `netlify dev` links back to localhost.
 */
export function siteUrl(): string {
	const context = process.env.CONTEXT;
	const preview = context === 'deploy-preview' || context === 'branch-deploy';
	const origin =
		(preview ? process.env.DEPLOY_PRIME_URL : undefined) ?? process.env.URL;
	return origin?.replace(/\/$/, '') ?? 'https://virtualcoffee.io';
}
