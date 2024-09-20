const mockData = [
	{
		id: 'recGDimb5snYUS0fc',
		fields: {
			RepoName: 'Virtual Coffee',
			RepoUrl: 'https://github.com/Virtual-Coffee/virtualcoffee.io',
			Description: 'Our very own site!',
			Maintainer: 'Virtual Coffee Maintainers',
		},
		createdTime: '2021-11-01T16:19:16.000Z',
	},
];

async function fetchRecords() {
	try {
		if (process.env.PUBLIC_AIRTABLE_API_KEY) {
			const Airtable = require('airtable');
			const base = new Airtable({
				apiKey: process.env.PUBLIC_AIRTABLE_API_KEY,
			}).base('appJStQemmYeoRcox');

			const result = await base('Hacktoberfest2022 Repos')
				.select({ view: 'Default' })
				.all();

			return result.map((r) => r.fields);
		}
		return mockData.map((r) => r.fields);
	} catch (error) {
		console.log(error);
		return mockData.map((r) => r.fields);
	}
}

export async function getChallengeData() {
	const tableRows = await fetchRecords();

	return tableRows;
}
