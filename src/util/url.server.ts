import { deployContext } from '@/lib/deployContext';

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
	const preview = deployContext() === 'preview';
	// `||`, not `??`: a declared-but-empty variable must fall through too, or
	// every emailed link would come out relative.
	const origin =
		(preview ? process.env.DEPLOY_PRIME_URL : undefined) || process.env.URL;
	return origin?.replace(/\/$/, '') || 'https://virtualcoffee.io';
}
