async function fetchRecords() {
	if (process.env.AIRTABLE_API_KEY) {
		const Airtable = require('airtable');
		const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
			'appJStQemmYeoRcox',
		);

		const result = await base('Member Articles').select().all();

		return result.map((r) => r.fields);
	}

	return [
		{
			id: 'recGDimb5snYUS0fc',
			fields: {
				GitHubUsername: 'BekahHW',
				Title: "Hot Take: Saying 'In the Spirit of Hacktoberfest' is Gatekeepy",
				Url: 'https://dev.to/bekahhw/hot-take-saying-in-the-spirit-of-hacktoberfest-is-gatekeepy-57n2',
				'Member Name': 'BekahHW',
				'Word Count': 911,
				'Date Published': '2021-11-01',
				TwitterUsername: 'bekahhw',
			},
			createdTime: '2021-11-01T16:19:16.000Z',
		},
		{
			id: 'rec2h9stGXAce8a6X',
			fields: {
				GitHubUsername: 'tkshill',
				Title: 'A Most Magic TicTacToe solution with React and TS',
				Url: 'https://dev.to/kirkcodes/a-most-magic-tictactoe-solution-with-react-and-ts-4pje',
				'Member Name': 'Kirk Shillingford',
				'Word Count': 2000,
				'Date Published': '2021-11-02',
				TwitterUsername: 'KirkCodes',
			},
			createdTime: '2021-11-02T18:25:38.000Z',
		},
	].map((r) => r.fields);
}

module.exports = async function () {
	const tableRows = await fetchRecords();

	const totalCount = tableRows.reduce((total, row) => {
		return total + row['Word Count'];
	}, 0);

	const totalPosts = tableRows.length;

	const sortedList = Object.values(
		tableRows.reduce((obj, row) => {
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
		}, {}),
	).sort((a, b) => a.name.localeCompare(b.name));

	const goals = [20000, 50000, 100000, 150000, 200000];
	const completedGoals = goals.filter((g) => g <= totalCount);
	const currentGoal = goals.find((g) => g > totalCount);

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
};
