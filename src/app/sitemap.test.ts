import { readdirSync } from 'node:fs';
import { join, sep } from 'node:path';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { getNewsletters } from '@/data/newsletters';
import episodes from '@/data/podcast/episodes.json';
import robots from './robots';
import sitemap from './sitemap';

// `unstable_cache` throws outside a Next request; the data is what's tested.
vi.mock('next/cache', () => ({ unstable_cache: <T>(fn: T) => fn }));

const ORIGIN = 'https://virtualcoffee.io';

/** Routes that are deliberately not in the sitemap. */
const unlisted = [/^\/admin(\/|$)/, /^\/invites(\/|$)/, /^\/join-slack$/];
const thanksPage = /\/(thanks|thank-you)$/;

beforeEach(() => {
	vi.stubEnv('CONTEXT', undefined);
	vi.stubEnv('DEPLOY_PRIME_URL', undefined);
	vi.stubEnv('URL', ORIGIN);
});
afterEach(() => vi.unstubAllEnvs());

async function sitemapPaths() {
	return (await sitemap()).map(({ url }) => {
		expect(url.startsWith(`${ORIGIN}/`)).toBe(true);
		return url.slice(ORIGIN.length);
	});
}

/** Every `page.tsx` under `src/app` with no dynamic segment, as a route. */
function staticAppRoutes() {
	const appDirectory = join(process.cwd(), 'src', 'app');
	return readdirSync(appDirectory, { recursive: true, encoding: 'utf8' })
		.filter((file) => file === 'page.tsx' || file.endsWith(`${sep}page.tsx`))
		.map((file) => file.split(sep).slice(0, -1))
		.filter((segments) => !segments.some((s) => s.startsWith('[')))
		.map(
			(segments) => '/' + segments.filter((s) => !/^\(.*\)$/.test(s)).join('/'),
		);
}

describe('sitemap', () => {
	test('lists every public static page under src/app', async () => {
		const paths = await sitemapPaths();
		const expected = staticAppRoutes().filter(
			(route) =>
				!unlisted.some((pattern) => pattern.test(route)) &&
				!thanksPage.test(route),
		);

		expect(expected).toEqual(expect.arrayContaining(['/', '/events', '/join']));
		expect(expected.filter((route) => !paths.includes(route))).toEqual([]);
	});

	test('leaves out signed-in, noindex, thank-you and disallowed routes', async () => {
		for (const path of await sitemapPaths()) {
			for (const pattern of unlisted) {
				expect(path).not.toMatch(pattern);
			}
			expect(path).not.toMatch(thanksPage);
			expect(path).not.toMatch(/^\/(_cache|api)(\/|$)/);
		}
	});

	test('lists exactly the MDX pages their routes generate', async () => {
		// Both routes set `dynamicParams = false`: a path they don't generate 404s.
		const routes = [
			['/', await import('./(simple-mdx)/[...slug]/page')],
			['/resources/', await import('./resources/[[...slug]]/page')],
		] as const;
		const generated = (
			await Promise.all(
				routes.map(async ([base, page]) =>
					(await page.generateStaticParams()).map(({ slug }) =>
						`${base}${slug.join('/')}`.replace(/\/$/, ''),
					),
				),
			)
		).flat();
		const simplePages = readdirSync(
			join(process.cwd(), 'src', 'content', 'simple-mdx-pages'),
		).map((name) => name.replace(/\.mdx$/, ''));
		const listed = (await sitemapPaths()).filter(
			(path) =>
				path.startsWith('/resources') ||
				simplePages.includes(path.split('/')[1]),
		);

		expect(generated).toContain('/about');
		expect(generated).toContain(
			'/resources/virtual-coffee-handbook/join-virtual-coffee',
		);
		expect(listed.toSorted()).toEqual(generated.toSorted());
	});

	test('lists exactly the monthly challenges their route generates', async () => {
		const { generateStaticParams } =
			await import('./monthlychallenges/[slug]/page');
		const generated = generateStaticParams().map(
			({ slug }) => `/monthlychallenges/${slug}`,
		);
		const listed = (await sitemapPaths()).filter((path) =>
			path.startsWith('/monthlychallenges/'),
		);

		expect(generated).toContain('/monthlychallenges/may-2025');
		expect(listed.toSorted()).toEqual(generated.toSorted());
	});

	test('lists every podcast episode and newsletter issue', async () => {
		const paths = await sitemapPaths();
		const newsletters = await getNewsletters();

		expect(paths.filter((p) => p.startsWith('/podcast/'))).toHaveLength(
			episodes.length,
		);
		expect(newsletters.length).toBeGreaterThan(0);
		for (const { href } of newsletters) {
			expect(paths).toContain(href);
		}
	});

	test('percent-encodes non-ASCII slugs', async () => {
		const urls = (await sitemap()).map(({ url }) => url);

		expect(urls.some((url) => url.includes('%C3%B6'))).toBe(true);
		for (const url of urls) {
			expect(url).toBe(new URL(url).href);
		}
	});

	test('has no duplicates', async () => {
		const paths = await sitemapPaths();

		expect(new Set(paths).size).toBe(paths.length);
	});

	test("uses a deploy preview's own address", async () => {
		const preview = 'https://deploy-preview-1--virtual-coffee-io.netlify.app';
		vi.stubEnv('CONTEXT', 'deploy-preview');
		vi.stubEnv('DEPLOY_PRIME_URL', preview);

		const [first] = await sitemap();
		expect(first.url).toBe(`${preview}/`);
	});
});

test('robots.txt points at the sitemap', () => {
	expect(robots().sitemap).toBe(`${ORIGIN}/sitemap.xml`);
});
