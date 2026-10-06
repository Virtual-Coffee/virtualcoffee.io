import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, test, vi } from 'vitest';

/**
 * Loads the module against a content directory built from `files`, keyed by
 * path under `src/content/monthly-challenges/`. The module resolves its
 * directory from `process.cwd()` at import, hence the fresh import.
 */
async function loadWith(files: Record<string, string>) {
	const root = mkdtempSync(join(tmpdir(), 'monthly-challenges-'));
	const content = join(root, 'src', 'content', 'monthly-challenges');
	mkdirSync(join(content, 'series'), { recursive: true });
	for (const [path, body] of Object.entries(files)) {
		writeFileSync(join(content, path), body);
	}
	vi.spyOn(process, 'cwd').mockReturnValue(root);
	vi.resetModules();
	return await import('.');
}

const series = (fields: string) =>
	`---\ntitle: T\nsubtitle: S\n${fields}\n---\n\nBody.\n`;
const challenge = (date: string, seriesIds: string[], extra = '') =>
	`---\nmeta:\n  title: T\n  description: D\ndate: ${date}\nseries: [${seriesIds.join(', ')}]\n${extra}---\n`;

afterEach(() => vi.restoreAllMocks());

describe('getChallenges', () => {
	test('sorts newest first and derives href and label', async () => {
		const { getChallenges } = await loadWith({
			'series/a.mdx': series('order: 1'),
			'jan-2021.mdx': challenge('2021-01-01', ['a']),
			'fall-2025.mdx': challenge('2025-09-01', ['a'], 'listTitle: Fall 2025\n'),
			'may-2022.mdx': challenge('2022-05-02', []),
		});

		expect(
			getChallenges().map(({ slug, href, label }) => ({ slug, href, label })),
		).toEqual([
			{
				slug: 'fall-2025',
				href: '/monthlychallenges/fall-2025',
				label: 'Fall 2025',
			},
			{
				slug: 'may-2022',
				href: '/monthlychallenges/may-2022',
				label: 'May 2022',
			},
			{
				slug: 'jan-2021',
				href: '/monthlychallenges/jan-2021',
				label: 'January 2021',
			},
		]);
	});

	test('rejects a challenge naming a series with no file', async () => {
		const { getChallenges } = await loadWith({
			'series/a.mdx': series('order: 1'),
			'jan-2021.mdx': challenge('2021-01-01', ['missing']),
		});

		expect(() => getChallenges()).toThrow(/unknown series "missing"/);
	});

	test('rejects invalid frontmatter', async () => {
		const { getChallenges } = await loadWith({
			'jan-2021.mdx': '---\nmeta:\n  title: T\n---\n',
		});

		expect(() => getChallenges()).toThrow(
			/Invalid frontmatter in .*jan-2021\.mdx/,
		);
	});
});

describe('getSeriesList', () => {
	test('puts the current series first, then by order', async () => {
		const { getSeriesList } = await loadWith({
			'series/first.mdx': series('order: 1'),
			'series/second.mdx': series('order: 2'),
			'series/now.mdx': series('order: 3\ncurrent: true'),
		});

		expect(getSeriesList().map(({ slug }) => slug)).toEqual([
			'now',
			'first',
			'second',
		]);
	});

	test('splits each series into its newest challenge and the rest', async () => {
		const { getSeriesList } = await loadWith({
			'series/hacktoberfest.mdx': series('order: 1'),
			'series/preptember.mdx': series('order: 2'),
			'series/empty.mdx': series('order: 3'),
			'oct-2021.mdx': challenge('2021-10-01', ['hacktoberfest']),
			'sept-2024.mdx': challenge('2024-09-01', ['preptember']),
			'oct-2024.mdx': challenge('2024-10-01', ['hacktoberfest']),
			'fall-2025.mdx': challenge('2025-09-01', ['hacktoberfest', 'preptember']),
		});

		expect(
			getSeriesList().map(({ slug, latest, past }) => ({
				slug,
				latest: latest?.slug,
				past: past.map((c) => c.slug),
			})),
		).toEqual([
			{
				slug: 'hacktoberfest',
				latest: 'fall-2025',
				past: ['oct-2024', 'oct-2021'],
			},
			{ slug: 'preptember', latest: 'fall-2025', past: ['sept-2024'] },
			{ slug: 'empty', latest: undefined, past: [] },
		]);
	});
});
