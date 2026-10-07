import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import fm from 'front-matter';
import { z } from 'zod';

/**
 * Monthly challenges are MDX files in `src/content/monthly-challenges/`, one
 * per challenge, and the series that group them are MDX files in its
 * `series/` folder. Frontmatter is the only index: the challenge route, the
 * `/monthlychallenges` list and the sitemap all read it from here, so a
 * frontmatter mistake fails the build rather than a page.
 */

const contentDirectory = join(
	process.cwd(),
	'src',
	'content',
	'monthly-challenges',
);
const seriesDirectory = join(contentDirectory, 'series');

const challengeFrontmatter = z.object({
	meta: z.object({ title: z.string(), description: z.string() }),
	date: z.date(),
	series: z.array(z.string()).default([]),
	/** Overrides the derived "Month Year" label, e.g. for seasonal challenges. */
	listTitle: z.string().optional(),
});

const seriesFrontmatter = z.object({
	title: z.string(),
	subtitle: z.string(),
	order: z.number(),
	current: z.boolean().default(false),
});

export type Challenge = z.infer<typeof challengeFrontmatter> & {
	slug: string;
	href: `/monthlychallenges/${string}`;
	label: string;
};

export type ChallengeSeries = z.infer<typeof seriesFrontmatter> & {
	slug: string;
	/** The series' most recent challenge. */
	latest?: Challenge;
	/** Every earlier challenge in the series, newest first. */
	past: Challenge[];
};

function readMdxDirectory<Output extends object>(
	directory: string,
	schema: z.ZodType<Output>,
) {
	return readdirSync(directory, { withFileTypes: true })
		.filter((entry) => entry.isFile() && entry.name.endsWith('.mdx'))
		.map((entry) => {
			const slug = entry.name.replace(/\.mdx$/, '');
			const { attributes } = fm(
				readFileSync(join(directory, entry.name), 'utf8'),
			);
			const parsed = schema.safeParse(attributes);
			if (!parsed.success) {
				throw new Error(
					`Invalid frontmatter in ${join(directory, entry.name)}: ${z.prettifyError(parsed.error)}`,
				);
			}
			return { slug, ...parsed.data };
		});
}

const labelFormat = new Intl.DateTimeFormat('en-US', {
	month: 'long',
	year: 'numeric',
	timeZone: 'UTC',
});

/** Every challenge, newest first. */
export function getChallenges(): Challenge[] {
	const seriesSlugs = new Set(
		readMdxDirectory(seriesDirectory, seriesFrontmatter).map((s) => s.slug),
	);

	return readMdxDirectory(contentDirectory, challengeFrontmatter)
		.map((challenge): Challenge => {
			for (const series of challenge.series) {
				if (!seriesSlugs.has(series)) {
					throw new Error(
						`monthly-challenges/${challenge.slug}.mdx names unknown series "${series}"`,
					);
				}
			}
			return {
				...challenge,
				href: `/monthlychallenges/${challenge.slug}`,
				label: challenge.listTitle ?? labelFormat.format(challenge.date),
			};
		})
		.sort((a, b) => b.date.getTime() - a.date.getTime());
}

export function getChallenge(slug: string): Challenge | undefined {
	return getChallenges().find((challenge) => challenge.slug === slug);
}

/** Every series in `order`, the current one first. */
export function getSeriesList(): ChallengeSeries[] {
	const challenges = getChallenges();

	return readMdxDirectory(seriesDirectory, seriesFrontmatter)
		.map((series) => {
			const [latest, ...past] = challenges.filter((challenge) =>
				challenge.series.includes(series.slug),
			);
			return { ...series, latest, past };
		})
		.sort((a, b) => Number(b.current) - Number(a.current) || a.order - b.order);
}
