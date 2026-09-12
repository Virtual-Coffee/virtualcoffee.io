import slugify from '@sindresorhus/slugify';

import rows from './data/member-articles.json';

/**
 * The November 2021 writing challenge, frozen as a snapshot of the Airtable
 * "Member Articles" table.
 *
 * Snapshot: `scripts/airtable/snapshotChallenges.ts`.
 */

export type MemberArticle = {
	'Member Name': string;
	GitHubUsername: string;
	TwitterUsername?: string;
	Title: string;
	Url: string;
	'Word Count': number;
	'Date Published': string;
};

export async function getChallengeData() {
	const tableRows = rows as MemberArticle[];

	const totalCount = tableRows.reduce((total, row) => {
		return total + row['Word Count'];
	}, 0);

	const totalPosts = tableRows.length;

	const sortedList = Object.values(
		tableRows.reduce(
			(obj, row) => {
				const post = {
					title: row['Title'],
					url: row['Url'],
					count: row['Word Count'],
				};

				if (!obj[row['Member Name']]) {
					return {
						...obj,
						[row['Member Name']]: {
							name: row['Member Name'],
							slug: slugify(row['Member Name']),
							posts: [post],
						},
					};
				} else {
					return {
						...obj,
						[row['Member Name']]: {
							...obj[row['Member Name']],
							posts: [...obj[row['Member Name']].posts, post],
						},
					};
				}
			},
			{} as Record<
				string,
				{
					name: string;
					slug: string;
					posts: { title: string; url: string; count: number }[];
				}
			>,
		),
	).sort((a, b) => a.name.localeCompare(b.name));

	const goals = [50000, 100000, 125000, 150000, 175000, 200000];
	const completedGoals = goals.filter((g) => g <= totalCount);
	const currentGoal = goals.find((g) => g > totalCount) as number;

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
