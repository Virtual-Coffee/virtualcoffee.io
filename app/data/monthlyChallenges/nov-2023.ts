import Airtable from 'airtable';

type NovRow = {
	Name: string;
	GitHubUsername: string;
	EntryTitle: string;
	EntryUrl: string;
	EntryDate: string;
	WordCount: number;
	Topics: string;
	ShortDescription: string;
	created_at: string;
};

async function fetchRecords() {
	if (process.env.PUBLIC_AIRTABLE_API_KEY) {
		const base = new Airtable({
			apiKey: process.env.PUBLIC_AIRTABLE_API_KEY,
		}).base('app10kd5ewHiLTjxn');

		const result = await base<NovRow>('NaNoWriMo')
			.select({
				view: 'NaNoWriMo 2023',
			})
			.all();

		return result.map((r) => r.fields);
	}

	return [].map((r) => r.fields);
}

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

export async function getChallengeData() {
	const tableRows = await fetchRecords();

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

			if (!obj[row.GitHubUsername]) {
				return {
					...obj,
					[row.GitHubUsername]: {
						name: row.Name,
						slug: row.GitHubUsername,
						posts: [post],
					},
				};
			} else {
				return {
					...obj,
					[row.GitHubUsername]: {
						...obj[row.GitHubUsername],
						posts: [...obj[row.GitHubUsername].posts, post],
					},
				};
			}
		}, {}),
	).sort((a, b) => a.name.localeCompare(b.name));

	const goals = [
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
