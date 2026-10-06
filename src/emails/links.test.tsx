import { existsSync, globSync } from 'node:fs';
import { createElement, type ComponentType } from 'react';
import { render } from 'react-email';
import { parseAllRedirects } from '@netlify/redirect-parser';
import { afterAll, expect, test, vi } from 'vitest';
import { z } from 'zod';

import { siteUrl } from '@/util/url.server';
import coffeeInvite from './coffeeInvite';
import slackInvite from './slackInvite';
import volunteerAccrual from './volunteerAccrual';
import volunteerGrant from './volunteerGrant';
import volunteerInvite from './volunteerInvite';
import welcome from './welcome';

/**
 * Every link an email carries back to the site must land on something: an
 * app route, a netlify.toml redirect or rewrite (whose query conditions the
 * link satisfies), or a file in `public/`. A rewrite that wanted a parameter
 * the email never sent is how `/join-coffee` 404'd.
 */

vi.stubEnv('URL', undefined);
vi.stubEnv('CONTEXT', undefined);
vi.stubEnv('DEPLOY_PRIME_URL', undefined);
const origin = siteUrl();
afterAll(() => vi.unstubAllEnvs());

const emails = {
	coffeeInvite,
	slackInvite,
	volunteerAccrual,
	volunteerGrant,
	volunteerInvite,
	welcome,
};

const Redirect = z.object({
	from: z.string(),
	to: z.string(),
	status: z.number().optional(),
	query: z.record(z.string(), z.string()),
});
const { redirects: parsed, errors } = await parseAllRedirects({
	redirectsFiles: [],
	netlifyConfigPath: 'netlify.toml',
	configRedirects: [],
	minimal: true,
});
const redirects = z.array(Redirect).parse(parsed);

/** Catch-alls that only serve the MDX files under a content directory. */
const mdxCatchAlls: Record<string, string> = {
	'src/app/resources/[...slug]': 'src/content/resources',
};

const appRoutes = globSync('src/app/**/{page.tsx,route.ts}').map((file) => {
	const dir = file.slice(0, file.lastIndexOf('/'));
	const segments = dir
		.split('/')
		.slice(2)
		.filter((s) => !(s.startsWith('(') && s.endsWith(')')))
		.map(decodeURIComponent);
	return { dir, segments };
});

function matchesSegments(pattern: string[], parts: string[]): string[] | null {
	const [head, ...rest] = pattern;
	if (head === undefined) return parts.length === 0 ? [] : null;
	if (head.startsWith('[[...')) return rest.length === 0 ? parts : null;
	if (head.startsWith('[...'))
		return rest.length === 0 && parts.length > 0 ? parts : null;
	if (parts.length === 0) return null;
	if (!head.startsWith('[') && head !== parts[0]) return null;
	return matchesSegments(rest, parts.slice(1));
}

function isAppRoute(pathname: string): boolean {
	const parts = pathname.split('/').filter(Boolean);
	return appRoutes.some(({ dir, segments }) => {
		const rest = matchesSegments(segments, parts);
		if (rest === null) return false;
		const content = mdxCatchAlls[dir];
		if (!content) return true;
		const slug = rest.join('/');
		return slug === ''
			? existsSync(`${content}/index.mdx`)
			: existsSync(`${content}/${slug}.mdx`) ||
					existsSync(`${content}/${slug}/index.mdx`);
	});
}

function matchesRedirect(from: string, pathname: string): boolean {
	const pattern = from.split('/').filter(Boolean);
	const parts = pathname.split('/').filter(Boolean);
	if (pattern.at(-1) === '*') {
		return pattern
			.slice(0, -1)
			.every((s, i) => s.startsWith(':') || s === parts[i]);
	}
	return (
		pattern.length === parts.length &&
		pattern.every((s, i) => s.startsWith(':') || s === parts[i])
	);
}

function resolves(url: URL, depth = 0): boolean {
	if (depth > 5) return false;
	const redirect = redirects.find(
		(r) =>
			matchesRedirect(r.from, url.pathname) &&
			Object.keys(r.query).every((key) => url.searchParams.has(key)),
	);
	if (redirect) {
		const to = redirect.to;
		if (to.startsWith('http') || to.includes(':') || to.includes('*'))
			return true;
		const fn = to.match(/^\/\.netlify\/functions\/([^/]+)/)?.[1];
		if (fn) return globSync(`netlify/functions/${fn}.{ts,mts,js}`).length > 0;
		return resolves(new URL(to, url), depth + 1);
	}
	return (
		isAppRoute(url.pathname) ||
		existsSync(`public${decodeURIComponent(url.pathname)}`)
	);
}

const decode = (s: string) => s.replaceAll('&amp;', '&');

const links = (
	await Promise.all(
		Object.entries(emails).map(async ([name, Email]) => {
			const html = await render(
				createElement(Email as ComponentType<object>, Email.PreviewProps),
			);
			return [...html.matchAll(/\s(?:href|src)="([^"]+)"/g)]
				.map((m) => decode(m[1]!))
				.filter((href) => href.startsWith(`${origin}/`))
				.map((href) => [name, href] as const);
		}),
	)
).flat();

test('netlify.toml parses and the emails link back to the site', () => {
	expect(errors).toEqual([]);
	expect(links).toEqual(
		expect.arrayContaining([
			['coffeeInvite', `${origin}/join-coffee?day=tuesday`],
			['coffeeInvite', `${origin}/join-coffee?day=thursday`],
		]),
	);
});

test.each(links)('%s: %s resolves', (_name, href) => {
	expect(resolves(new URL(href))).toBe(true);
});

/** The rewrite accepts any `:day`; the function is what rejects a bad one. */
test.each(
	links.filter(([, href]) => new URL(href).pathname === '/join-coffee'),
)('%s: %s is accepted by the join-coffee function', async (_name, href) => {
	vi.stubEnv('ZOOM_TUESDAYS', 'https://zoom.example/tuesday');
	vi.stubEnv('ZOOM_THURSDAYS', 'https://zoom.example/thursday');
	const { default: handler } =
		await import('../../netlify/functions/join-coffee');
	const response = await handler(new Request(href));
	expect(response.status).toBe(302);
});

test('the join-coffee function rejects a day it does not serve', async () => {
	const { default: handler } =
		await import('../../netlify/functions/join-coffee');
	const response = await handler(
		new Request(`${origin}/join-coffee?day=friday`),
	);
	expect(response.status).toBe(401);
});

test('a link the rewrite does not accept is caught', () => {
	expect(resolves(new URL(`${origin}/join-coffee`))).toBe(false);
	expect(resolves(new URL(`${origin}/no-such-page`))).toBe(false);
});
