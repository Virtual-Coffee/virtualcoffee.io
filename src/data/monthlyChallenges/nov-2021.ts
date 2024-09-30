import slugify from '@sindresorhus/slugify';
import Airtable from 'airtable';

type MemberArticle = {
	GitHubUsername: string;
	Title: string;
	Url: string;
	'Member Name': string;
	'Word Count': number;
	'Date Published': string;
	TwitterUsername: string;
};

async function fetchRecords() {
	if (process.env.PUBLIC_AIRTABLE_API_KEY) {
		const base = new Airtable({
			apiKey: process.env.PUBLIC_AIRTABLE_API_KEY,
		}).base('appJStQemmYeoRcox');

		const result = await base<MemberArticle>('Member Articles').select().all();

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

export async function getChallengeData() {
	const tableRows = await fetchRecords();

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
