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

async function fetchRecords(viewName: string) {
	if (process.env.PUBLIC_AIRTABLE_API_KEY) {
		const base = new Airtable({
			apiKey: process.env.PUBLIC_AIRTABLE_API_KEY,
		}).base('app10kd5ewHiLTjxn');

		const result = await base<NovRow>('NaNoWriMo')
			.select({
				view: viewName,
			})
			.all();

		return result.map((r) => r.fields);
	}

	return [
		{
			id: 'sdfsdfsd',
			fields: {
				Name: 'Dan Ott',
				GitHubUsername: 'danieltott',
				EntryTitle: `How I'm awesome`,
				EntryUrl: `https://danott.dev`,
				EntryDate: `10/31/2023`,
				WordCount: 9000,
				Topics: 'awesomeness,me',
				ShortDescription:
					'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Proin augue nisi, fermentum vitae, imperdiet a, auctor eu, mi. Nulla imperdiet molestie purus. Duis arcu dui, pretium in, molestie id, convallis eget, orci. Praesent eget purus. Nullam sed nunc. Etiam quis orci ac metus consectetuer consequat. Sed pulvinar aliquam sem. Vestibulum convallis. Pellentesque vestibulum dapibus est. Morbi iaculis. Morbi molestie molestie libero. Ut metus. Phasellus pulvinar. Aenean rutrum tristique neque. Morbi vulputate. Curabitur pretium, arcu a accumsan pretium, augue mi ullamcorper ligula, at tristique ligula purus quis mi. Etiam blandit arcu et lorem. Nam ligula. Aliquam nisi sem, euismod id, pharetra vitae, ullamcorper et, pede.',
				created_at: `10/31/2023 11:14am`,
			},
			createdTime: '2021-11-01T16:19:16.000Z',
		},
		{
			id: 'sdfsdfsd',
			fields: {
				Name: 'Dan Ott',
				GitHubUsername: 'danieltott',
				EntryTitle: `I'm still awesome`,
				EntryUrl: `https://danott.dev`,
				EntryDate: `10/30/2023`,
				WordCount: 10834,
				Topics: 'dan,ott',
				ShortDescription:
					'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Proin augue nisi, fermentum vitae, imperdiet a, auctor eu, mi. Nulla imperdiet molestie purus. Duis arcu dui, pretium in, molestie id, convallis eget, orci. Praesent eget purus. Nullam sed nunc. Etiam quis orci ac metus consectetuer consequat. Sed pulvinar aliquam sem. Vestibulum convallis. Pellentesque vestibulum dapibus est. Morbi iaculis. Morbi molestie molestie libero. Ut metus. Phasellus pulvinar. Aenean rutrum tristique neque. Morbi vulputate. Curabitur pretium, arcu a accumsan pretium, augue mi ullamcorper ligula, at tristique ligula purus quis mi. Etiam blandit arcu et lorem. Nam ligula. Aliquam nisi sem, euismod id, pharetra vitae, ullamcorper et, pede.',
				created_at: `10/31/2023 11:25am`,
			},
			createdTime: '2021-11-01T16:19:16.000Z',
		},
		{
			id: 'sdfsdfsd',
			fields: {
				Name: 'Someone else',
				GitHubUsername: 'someone',
				EntryTitle: `Another blog`,
				EntryUrl: `https://virtualcoffee.io`,
				EntryDate: `10/20/2023`,
				WordCount: 234,
				Topics: `something`,
				ShortDescription: `Blah blah blah dsfksjd kjsd s sdfsdf.`,
				created_at: `10/31/2023 11:26am`,
			},
			createdTime: '2021-11-01T16:19:16.000Z',
		},
	].map((r) => r.fields);
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

export async function getWritingChallengeData(viewName: string) {
	const tableRows = await fetchRecords(viewName);

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
