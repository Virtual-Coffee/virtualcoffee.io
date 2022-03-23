import { handle as issue202203 } from '../routes/newsletter/issues/2022-03';

const newsletters = [{ slug: '2022-03', handleData: issue202203 }];

function getIssueData(issue) {
	return {
		title: issue.handleData.listTitle || issue.handleData.meta.title,
		description: issue.handleData.meta.description,
		url: `/newsletter/issues/${issue.slug}`,
	};
}

export default async function getNewsletters({ limit } = {}) {
	return newsletters.slice(0, limit).map((issue) => getIssueData(issue));
}
