import entries2023 from './data/nanowrimo-2023.json';
import entries2024 from './data/nanowrimo-2024.json';

/**
 * The November writing challenges, frozen as snapshots.
 *
 * These used to be one Airtable table read through a per-year view, which is
 * why the cohorts arrive here as separate files: the year is not recorded on
 * the rows themselves, only in which view returned them.
 *
 * Snapshot: `scripts/airtable/snapshotChallenges.ts`.
 */

export type WritingChallengeEntry = {
	Name: string;
	GitHubUsername: string;
	EntryTitle: string;
	EntryUrl: string;
	EntryDate?: string;
	WordCount: number;
	Topics?: string;
	ShortDescription?: string;
};

export type WritingChallengeYear = 2023 | 2024;

const ENTRIES: Record<WritingChallengeYear, WritingChallengeEntry[]> = {
	2023: entries2023 as WritingChallengeEntry[],
	2024: entries2024 as WritingChallengeEntry[],
};

type PostMap = Record<
	string,
	{
		name: string;
		slug: string;
		posts: {
			title: string;
			url: string;
			count: number;
		}[];
	}
>;

export async function getWritingChallengeData(year: WritingChallengeYear) {
	const tableRows = ENTRIES[year];

	const totalCount = tableRows.reduce((total, row) => {
		return total + row.WordCount;
	}, 0);

	const totalPosts = tableRows.length;

	const sortedList = Object.values(
		tableRows.reduce<PostMap>((obj, row) => {
			const post = {
				title: row.EntryTitle,
				url: row.EntryUrl,
				count: row.WordCount,
			};

			const ukey = row.GitHubUsername.toLowerCase();

			if (!obj[ukey]) {
				return {
					...obj,
					[ukey]: {
						name: row.Name,
						slug: row.GitHubUsername,
						posts: [post],
					},
				};
			} else {
				return {
					...obj,
					[ukey]: {
						...obj[ukey],
						posts: [...obj[ukey].posts, post],
					},
				};
			}
		}, {}),
	).sort((a, b) => a.name.localeCompare(b.name));

	const goals = [
		{
			title: '50k',
			value: 50000,
		},
		{
			title: '100k',
			value: 100000,
		},
		{
			title: '150k',
			value: 150000,
		},
		{
			title: '200k',
			value: 200000,
		},
		{
			title: '250k',
			value: 250000,
		},
		{
			title: '300k',
			value: 300000,
		},
		{
			title: '350k',
			value: 350000,
		},
		{
			title: '400k',
			value: 400000,
		},
	];

	const completedGoals = goals.filter((g) => g.value <= totalCount);
	const currentGoal = goals.find((g) => g.value > totalCount);

	return {
		completedGoals,
		currentGoal,
		sortedList,
		list: tableRows,
		totals: {
			list: sortedList
				.map((person) => ({
					name: person.name,
					posts: person.posts.length,
					total: person.posts.reduce((total, post) => total + post.count, 0),
				}))
				.sort((a, b) => b.total - a.total),
			totalCount,
			totalPosts,
		},
	};
}
