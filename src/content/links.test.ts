import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import sitemap from '@/app/sitemap';

/**
 * `typedRoutes` checks a link written in TSX, not one in Markdown, so every
 * root-relative link in `src/content` is checked here instead: it has to be a
 * page the site serves. A `netlify.toml` redirect source is a failure on
 * purpose, as the redirect is a second hop that can be removed without
 * anyone noticing the content still points at it.
 */

const ORIGIN = 'https://virtualcoffee.io';

/** Real routes the sitemap leaves out (see the list in `sitemap.ts`). */
const unlisted = [
	'/join-slack',
	'/join/thank-you',
	'/lunch-and-learn-idea/thanks',
	'/report-coc-violation/thanks',
	'/start-coffee-table-group/thanks',
	'/volunteer-at-virtual-coffee/thanks',
];

beforeEach(() => {
	vi.stubEnv('CONTEXT', undefined);
	vi.stubEnv('DEPLOY_PRIME_URL', undefined);
	vi.stubEnv('URL', ORIGIN);
});
afterEach(() => vi.unstubAllEnvs());

const contentDirectory = join(process.cwd(), 'src', 'content');

/**
 * `[text](/path)`, `href="/path"` and the fixed start of
 * ``href={`/path?…${…}`}``, outside fenced code.
 */
const LINK = /\]\((\/[^)\s]*)[^)]*\)|\bhref="(\/[^"]*)"|\bhref=\{`(\/[^`$]*)/g;

/** A file such as a PDF, served from `public/`; a directory is not served. */
function isPublicFile(path: string) {
	return (
		statSync(join(process.cwd(), 'public', decodeURIComponent(path)), {
			throwIfNoEntry: false,
		})?.isFile() ?? false
	);
}

function internalLinks(file: string) {
	const text = readFileSync(join(contentDirectory, file), 'utf8').replace(
		/^(```|~~~)[\s\S]*?^\1/gm,
		'',
	);
	return [...text.matchAll(LINK)].map(([, markdown, jsx, template]) => {
		const href = (markdown ?? jsx ?? template)!;
		// A query or a hash does not change which page it is; a trailing slash
		// is redirected to the page without one.
		const path = href.split(/[?#]/)[0]!.replace(/(.)\/$/, '$1');
		return { file, href, path };
	});
}

const links = readdirSync(contentDirectory, {
	recursive: true,
	encoding: 'utf8',
})
	.filter((file) => file.endsWith('.mdx'))
	.flatMap(internalLinks);

test('finds the internal links in the content', () => {
	expect(links.length).toBeGreaterThan(100);
	expect(links).toContainEqual(
		expect.objectContaining({ path: '/code-of-conduct' }),
	);
	expect(links).toContainEqual(
		expect.objectContaining({
			path: '/resources/virtual-coffee-handbook/guides-to-virtual-coffee/coffee-table-groups',
		}),
	);
	expect(links).toContainEqual(
		expect.objectContaining({
			file: expect.stringMatching(/paths-to-leadership\.mdx$/),
			path: '/volunteer-at-virtual-coffee',
		}),
	);
});

test('a file under public/ is served, a directory is not', () => {
	expect(isPublicFile('/assets/pdfs/lightning-talk-guide.pdf')).toBe(true);
	expect(isPublicFile('/assets/pdfs')).toBe(false);
	expect(isPublicFile('/assets/pdfs/missing.pdf')).toBe(false);
});

test('every internal link in the content is a page the site serves', async () => {
	const pages = new Set(
		(await sitemap()).map(({ url }) =>
			decodeURIComponent(url.slice(ORIGIN.length)),
		),
	);
	for (const path of unlisted) pages.add(path);

	const broken = links
		.filter(({ path }) => !pages.has(path) && !isPublicFile(path))
		.map(({ file, href }) => `${file}: ${href}`);

	expect(broken).toEqual([]);
});
