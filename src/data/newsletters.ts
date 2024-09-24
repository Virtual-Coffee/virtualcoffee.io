'use server';

import { handle as handle202407 } from '@/content/newsletters/2024-07';
import { handle as handle202406 } from '@/content/newsletters/2024-06';
import { handle as handle202405 } from '@/content/newsletters/2024-05';
import { handle as handle202404 } from '@/content/newsletters/2024-04';
import { handle as handle202403 } from '@/content/newsletters/2024-03';
import { handle as handle202402 } from '@/content/newsletters/2024-02';
import { handle as handle202401 } from '@/content/newsletters/2024-01';
import { handle as handle202312 } from '@/content/newsletters/2023-12';
import { handle as handle202311 } from '@/content/newsletters/2023-11';
import { handle as handle202310 } from '@/content/newsletters/2023-10';
import { handle as handle202309 } from '@/content/newsletters/2023-09';
import { handle as handle202308 } from '@/content/newsletters/2023-08';
import { handle as handle202307 } from '@/content/newsletters/2023-07';
import { handle as handle202306 } from '@/content/newsletters/2023-06';
import { handle as handle202305 } from '@/content/newsletters/2023-05';
import { handle as handle202304 } from '@/content/newsletters/2023-04';
import { handle as handle202303 } from '@/content/newsletters/2023-03';
import { handle as handle202302 } from '@/content/newsletters/2023-02';
import { handle as handle202301 } from '@/content/newsletters/2023-01';
import { handle as handle202212 } from '@/content/newsletters/2022-12';
import { handle as handle202211 } from '@/content/newsletters/2022-11';
import { handle as handle202210 } from '@/content/newsletters/2022-10';
import { handle as handle202209 } from '@/content/newsletters/2022-09';
import { handle as handle202208 } from '@/content/newsletters/2022-08';
import { handle as handle202207 } from '@/content/newsletters/2022-07';
import { handle as handle202206 } from '@/content/newsletters/2022-06';
import { handle as handle202205 } from '@/content/newsletters/2022-05';
import { handle as handle202204 } from '@/content/newsletters/2022-04';
import { handle as handle202203 } from '@/content/newsletters/2022-03';
import { handle as handle202202 } from '@/content/newsletters/2022-02';
import { handle as handle202201 } from '@/content/newsletters/2022-01';
import { handle as handle202112 } from '@/content/newsletters/2021-12';
import { handle as handle202111 } from '@/content/newsletters/2021-11';
import { handle as handle202110 } from '@/content/newsletters/2021-10';
import { handle as handle202109 } from '@/content/newsletters/2021-09';
import { handle as handle202108 } from '@/content/newsletters/2021-08';
import { handle as handle202107 } from '@/content/newsletters/2021-07';
import { handle as handle202106 } from '@/content/newsletters/2021-06';
import { handle as handle202105 } from '@/content/newsletters/2021-05';
import { handle as handle202104 } from '@/content/newsletters/2021-04';
import { handle as handle202103 } from '@/content/newsletters/2021-03';
import { handle as handle202102 } from '@/content/newsletters/2021-02';
import { handle as handle202101 } from '@/content/newsletters/2021-01';
import { Component } from 'react';

const newsletters = [
	{ handleData: handle202407, slug: '2024-07' },
	{ handleData: handle202406, slug: '2024-06' },
	{ handleData: handle202405, slug: '2024-05' },
	{ handleData: handle202404, slug: '2024-04' },
	{ handleData: handle202403, slug: '2024-03' },
	{ handleData: handle202402, slug: '2024-02' },
	{ handleData: handle202401, slug: '2024-01' },

	{ handleData: handle202312, slug: '2023-12' },
	{ handleData: handle202311, slug: '2023-11' },
	{ handleData: handle202310, slug: '2023-10' },
	{ handleData: handle202309, slug: '2023-09' },
	{ handleData: handle202308, slug: '2023-08' },
	{ handleData: handle202307, slug: '2023-07' },
	{ handleData: handle202306, slug: '2023-06' },
	{ handleData: handle202305, slug: '2023-05' },
	{ handleData: handle202304, slug: '2023-04' },
	{ handleData: handle202303, slug: '2023-03' },
	{ handleData: handle202302, slug: '2023-02' },
	{ handleData: handle202301, slug: '2023-01' },

	{ handleData: handle202212, slug: '2022-12' },
	{ handleData: handle202211, slug: '2022-11' },
	{ handleData: handle202210, slug: '2022-10' },
	{ handleData: handle202209, slug: '2022-09' },
	{ handleData: handle202208, slug: '2022-08' },
	{ handleData: handle202207, slug: '2022-07' },
	{ handleData: handle202206, slug: '2022-06' },
	{ handleData: handle202205, slug: '2022-05' },
	{ handleData: handle202204, slug: '2022-04' },
	{ handleData: handle202203, slug: '2022-03' },
	{ handleData: handle202202, slug: '2022-02' },
	{ handleData: handle202201, slug: '2022-01' },

	{ handleData: handle202112, slug: '2021-12' },
	{ handleData: handle202111, slug: '2021-11' },
	{ handleData: handle202110, slug: '2021-10' },
	{ handleData: handle202109, slug: '2021-09' },
	{ handleData: handle202108, slug: '2021-08' },
	{ handleData: handle202107, slug: '2021-07' },
	{ handleData: handle202106, slug: '2021-06' },
	{ handleData: handle202105, slug: '2021-05' },
	{ handleData: handle202104, slug: '2021-04' },
	{ handleData: handle202103, slug: '2021-03' },
	{ handleData: handle202102, slug: '2021-02' },
	{ handleData: handle202101, slug: '2021-01' },
];

export type NewsletterIssue = {
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
		href: `/newsletter/issues/${issue.slug}`,
	};
}

type NewsletterListOptions = { limit?: number };

export async function getNewsletters(
	newsletterOptions: NewsletterListOptions = {},
) {
	const { limit } = newsletterOptions;

	return newsletters.slice(0, limit).map((issue) => getIssueData(issue));
}

export async function getNewsletter(slug: string) {
	try {
		const { handle, default: Page } = require(
			'@/content/newsletters/' + slug,
		) as {
			handle: NewsletterIssue['handleData'];
			default: () => React.ReactNode;
		};

		return { handle, Page };
	} catch (error) {
		return null;
	}
}
