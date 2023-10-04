import { handle as issue202310 } from '~/routes/__frontend/newsletter/issues/2023-10';
import { handle as issue202309 } from '~/routes/__frontend/newsletter/issues/2023-09';
import { handle as issue202308 } from '~/routes/__frontend/newsletter/issues/2023-08';
import { handle as issue202307 } from '~/routes/__frontend/newsletter/issues/2023-07';
import { handle as issue202306 } from '~/routes/__frontend/newsletter/issues/2023-06';
import { handle as issue202305 } from '~/routes/__frontend/newsletter/issues/2023-05';
import { handle as issue202304 } from '~/routes/__frontend/newsletter/issues/2023-04';
import { handle as issue202303 } from '~/routes/__frontend/newsletter/issues/2023-03';
import { handle as issue202302 } from '~/routes/__frontend/newsletter/issues/2023-02';
import { handle as issue202301 } from '~/routes/__frontend/newsletter/issues/2023-01';
import { handle as issue202212 } from '~/routes/__frontend/newsletter/issues/2022-12';
import { handle as issue202211 } from '~/routes/__frontend/newsletter/issues/2022-11';
import { handle as issue202210 } from '~/routes/__frontend/newsletter/issues/2022-10';
import { handle as issue202209 } from '~/routes/__frontend/newsletter/issues/2022-09';
import { handle as issue202208 } from '~/routes/__frontend/newsletter/issues/2022-08';
import { handle as issue202207 } from '~/routes/__frontend/newsletter/issues/2022-07';
import { handle as issue202206 } from '~/routes/__frontend/newsletter/issues/2022-06';
import { handle as issue202205 } from '~/routes/__frontend/newsletter/issues/2022-05';
import { handle as issue202204 } from '~/routes/__frontend/newsletter/issues/2022-04';
import { handle as issue202203 } from '~/routes/__frontend/newsletter/issues/2022-03';
import { handle as issue202202 } from '~/routes/__frontend/newsletter/issues/2022-02';
import { handle as issue202201 } from '~/routes/__frontend/newsletter/issues/2022-01';
import { handle as issue202112 } from '~/routes/__frontend/newsletter/issues/2021-12';
import { handle as issue202111 } from '~/routes/__frontend/newsletter/issues/2021-11';
import { handle as issue202110 } from '~/routes/__frontend/newsletter/issues/2021-10';
import { handle as issue202109 } from '~/routes/__frontend/newsletter/issues/2021-09';
import { handle as issue202108 } from '~/routes/__frontend/newsletter/issues/2021-08';
import { handle as issue202107 } from '~/routes/__frontend/newsletter/issues/2021-07';
import { handle as issue202106 } from '~/routes/__frontend/newsletter/issues/2021-06';
import { handle as issue202105 } from '~/routes/__frontend/newsletter/issues/2021-05';
import { handle as issue202104 } from '~/routes/__frontend/newsletter/issues/2021-04';
import { handle as issue202103 } from '~/routes/__frontend/newsletter/issues/2021-03';
import { handle as issue202102 } from '~/routes/__frontend/newsletter/issues/2021-02';
import { handle as issue202101 } from '~/routes/__frontend/newsletter/issues/2021-01';

const newsletters = [
	{ handleData: issue202310, slug: '2023-10' },
	{ handleData: issue202309, slug: '2023-09' },
	{ handleData: issue202308, slug: '2023-08' },
	{ handleData: issue202307, slug: '2023-07' },
	{ handleData: issue202306, slug: '2023-06' },
	{ handleData: issue202305, slug: '2023-05' },
	{ handleData: issue202304, slug: '2023-04' },
	{ handleData: issue202303, slug: '2023-03' },
	{ handleData: issue202302, slug: '2023-02' },
	{ handleData: issue202301, slug: '2023-01' },

	{ handleData: issue202212, slug: '2022-12' },
	{ handleData: issue202211, slug: '2022-11' },
	{ handleData: issue202210, slug: '2022-10' },
	{ handleData: issue202209, slug: '2022-09' },
	{ handleData: issue202208, slug: '2022-08' },
	{ handleData: issue202207, slug: '2022-07' },
	{ handleData: issue202206, slug: '2022-06' },
	{ handleData: issue202205, slug: '2022-05' },
	{ handleData: issue202204, slug: '2022-04' },
	{ handleData: issue202203, slug: '2022-03' },
	{ handleData: issue202202, slug: '2022-02' },
	{ handleData: issue202201, slug: '2022-01' },

	{ handleData: issue202112, slug: '2021-12' },
	{ handleData: issue202111, slug: '2021-11' },
	{ handleData: issue202110, slug: '2021-10' },
	{ handleData: issue202109, slug: '2021-09' },
	{ handleData: issue202108, slug: '2021-08' },
	{ handleData: issue202107, slug: '2021-07' },
	{ handleData: issue202106, slug: '2021-06' },
	{ handleData: issue202105, slug: '2021-05' },
	{ handleData: issue202104, slug: '2021-04' },
	{ handleData: issue202103, slug: '2021-03' },
	{ handleData: issue202102, slug: '2021-02' },
	{ handleData: issue202101, slug: '2021-01' },
];

type NewsletterIssue = {
	/**
	 * handleData is based on the data from [newsletter issues](https://github.com/Virtual-Coffee/virtualcoffee.io/tree/main/app/routes/__frontend/newsletter/issues)
	 */
	handleData: {
		meta: {
			/** Title of the newsletter's issue */
			title: string;
			/** Description of the newsletter's issue */
			description?: string;
		};
		/** Date of the newsletter's issue */
		date: string;
		/** Title on the list of newsletters
		 * @see [VC newsletter page](https://virtualcoffee.io/newsletter)
		 */
		listTitle?: string;
	};
	/** Part of URL that indentifies the month of the newsletter */
	slug: string;
};

function getIssueData(issue: NewsletterIssue) {
	return {
		title: issue.handleData.listTitle || issue.handleData.meta.title,
		description: issue.handleData.meta.description,
		to: `/newsletter/issues/${issue.slug}`,
	};
}

type NewsletterListOptions = { limit?: number };

export default async function getNewsletters(
	newsletterOptions: NewsletterListOptions = {},
) {
	const { limit } = newsletterOptions;

	return newsletters.slice(0, limit).map((issue) => getIssueData(issue));
}
