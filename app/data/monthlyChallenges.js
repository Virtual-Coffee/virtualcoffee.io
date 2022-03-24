import { handle as feb2022 } from '../routes/monthlychallenges/feb-2022';

const challenges = [{ slug: 'feb-2022', handleData: feb2022 }];

function getChallengeData(challange) {
	return {
		title: challange.handleData.listTitle || challange.handleData.meta.title,
		description: challange.handleData.meta.description,
		to: `/monthlychallenges/${challange.slug}`,
	};
}

export default async function getChallenges({ limit } = {}) {
	return challenges.slice(0, limit).map((issue) => getChallengeData(issue));
}
