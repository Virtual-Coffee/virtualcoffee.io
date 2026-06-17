import Airtable from 'airtable';

const currentYear = new Date().getFullYear().toString();

type ChallengeRow = {
	'Pairing Participants': string;
	Topic: string;
	'Pairing Sessions': number;
	Created: string;
	Year: string | number;
};

export async function getPairingChallengeData(year: string = currentYear) {
	Airtable.configure({
		endpointUrl: 'https://api.airtable.com',
		apiKey: process.env.PUBLIC_AIRTABLE_API_KEY,
	});
	const base = Airtable.base('app10kd5ewHiLTjxn');

	const result = await base<ChallengeRow>('Pairing Challenge')
		.select({
			view: `${year} Pairing Challenge Results`,
		})
		.all();

	return result.map((r) => r.fields);
}

export async function getTotalPairingSessions(year: string = currentYear) {
	const allRows = await getPairingChallengeData(year);

	return allRows.reduce((acc, curr) => acc + curr['Pairing Sessions'], 0);
}
