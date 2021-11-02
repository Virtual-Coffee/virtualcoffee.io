const Airtable = require('airtable');
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
	'appJStQemmYeoRcox',
);

module.exports = async function () {
	// const { challengedata } = require('./nov-2021.json');

	const result = await base('Member Articles').select().all();

	const tableRows = result.map((r) => r.fields);

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

	return {
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
