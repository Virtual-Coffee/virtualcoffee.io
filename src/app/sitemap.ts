import type { MetadataRoute } from 'next';

import { getChallenges } from '@/data/monthlyChallenges';
import { getNewsletters } from '@/data/newsletters';
import { getEpisodes } from '@/data/podcast';
import { extractRoutes, loadMdxDirectory } from '@/util/loadMdx.server';
import { siteUrl } from '@/util/url.server';

/**
 * The hand-written top-level pages. Everything below them comes from the
 * same data their pages' `generateStaticParams` read, so a new resource,
 * episode, issue or challenge is listed without touching this file.
 *
 * Left out: `/admin` and `/invites` (signed-in only), `/join-slack`
 * (`noindex`), the forms' thank-you pages, and whatever `robots.ts`
 * disallows.
 */
const topLevelPages = [
	'/',
	'/events',
	'/members',
	'/podcast',
	'/newsletter',
	'/monthlychallenges',
	'/resources',
	'/join',
	'/report-coc-violation',
	'/volunteer-at-virtual-coffee',
	'/lunch-and-learn-idea',
	'/start-coffee-table-group',
	'/about',
	'/code-of-conduct',
	'/uses',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const [resources, episodes, newsletters] = await Promise.all([
		loadMdxDirectory({ baseDirectory: 'content/resources' }),
		getEpisodes({ limit: Infinity }),
		getNewsletters(),
	]);

	const paths = [
		...topLevelPages,
		...extractRoutes(resources, 'content/resources/').map(
			(slug) => `/resources/${slug}`,
		),
		...episodes.map((episode) => `/podcast/${episode.slug}`),
		...newsletters.map((newsletter) => newsletter.href),
		...getChallenges().map((challenge) => challenge.href),
	];

	// A <loc> must be escaped; two episode slugs have a non-ASCII character.
	const origin = siteUrl();
	return paths.map((path) => ({
		url: `${origin}${path.split('/').map(encodeURIComponent).join('/')}`,
	}));
}
