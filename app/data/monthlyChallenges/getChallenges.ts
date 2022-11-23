import { handle as dec2022 } from '~/routes/__frontend/monthlychallenges/dec-2022'
import { handle as nov2022 } from '~/routes/__frontend/monthlychallenges/nov-2022';
import { handle as oct2022 } from '~/routes/__frontend/monthlychallenges/oct-2022';
import { handle as sept2022 } from '~/routes/__frontend/monthlychallenges/sept-2022';
import { handle as aug2022 } from '~/routes/__frontend/monthlychallenges/aug-2022';
import { handle as july2022 } from '~/routes/__frontend/monthlychallenges/july-2022';
import { handle as june2022 } from '~/routes/__frontend/monthlychallenges/june-2022';
import { handle as may2022 } from '~/routes/__frontend/monthlychallenges/may-2022';
import { handle as apr2022 } from '~/routes/__frontend/monthlychallenges/apr-2022';
import { handle as mar2022 } from '~/routes/__frontend/monthlychallenges/mar-2022';
import { handle as feb2022 } from '~/routes/__frontend/monthlychallenges/feb-2022';
import { handle as jan2022 } from '~/routes/__frontend/monthlychallenges/jan-2022';
import { handle as dec2021 } from '~/routes/__frontend/monthlychallenges/dec-2021';
import { handle as nov2021 } from '~/routes/__frontend/monthlychallenges/nov-2021';
import { handle as oct2021 } from '~/routes/__frontend/monthlychallenges/oct-2021';
import { handle as sept2021 } from '~/routes/__frontend/monthlychallenges/sept-2021';
import { handle as aug2021 } from '~/routes/__frontend/monthlychallenges/aug-2021';
import { handle as july2021 } from '~/routes/__frontend/monthlychallenges/july-2021';
import { handle as june2021 } from '~/routes/__frontend/monthlychallenges/june-2021';
import { handle as may2021 } from '~/routes/__frontend/monthlychallenges/may-2021';
import { handle as apr2021 } from '~/routes/__frontend/monthlychallenges/apr-2021';
import { handle as mar2021 } from '~/routes/__frontend/monthlychallenges/mar-2021';
import { handle as feb2021 } from '~/routes/__frontend/monthlychallenges/feb-2021';
import { handle as jan2021 } from '~/routes/__frontend/monthlychallenges/jan-2021';

import { handle as dec2020 } from '~/routes/__frontend/monthlychallenges/dec-2020';
import { handle as nov2020 } from '~/routes/__frontend/monthlychallenges/nov-2020';

const challenges: Challenge[] = [
	{ handleData: dec2022, slug: 'dec-2022' },
	{ handleData: nov2022, slug: 'nov-2022' },
	{ handleData: oct2022, slug: 'oct-2022' },
	{ handleData: sept2022, slug: 'sept-2022' },
	{ handleData: aug2022, slug: 'aug-2022' },
	{ handleData: july2022, slug: 'july-2022' },
	{ handleData: june2022, slug: 'june-2022' },
	{ handleData: may2022, slug: 'may-2022' },
	{ handleData: apr2022, slug: 'apr-2022' },
	{ handleData: mar2022, slug: 'mar-2022' },
	{ handleData: feb2022, slug: 'feb-2022' },
	{ handleData: jan2022, slug: 'jan-2022' },

	{ handleData: dec2021, slug: 'dec-2021' },
	{ handleData: nov2021, slug: 'nov-2021' },
	{ handleData: oct2021, slug: 'oct-2021' },
	{ handleData: sept2021, slug: 'sept-2021' },
	{ handleData: aug2021, slug: 'aug-2021' },
	{ handleData: july2021, slug: 'july-2021' },
	{ handleData: june2021, slug: 'june-2021' },
	{ handleData: may2021, slug: 'may-2021' },
	{ handleData: apr2021, slug: 'apr-2021' },
	{ handleData: mar2021, slug: 'mar-2021' },
	{ handleData: feb2021, slug: 'feb-2021' },
	{ handleData: jan2021, slug: 'jan-2021' },

	{ handleData: dec2020, slug: 'dec-2020' },
	{ handleData: nov2020, slug: 'nov-2020' },
];

function getChallengeData(challenge: Challenge): MonthlyChallengeData {
	return {
		title: challenge.handleData.listTitle || challenge.handleData.meta.title,
		description: challenge.handleData.meta.description,
		to: `/monthlychallenges/${challenge.slug}`,
	};
}

export default async function getChallenges({
	limit,
}: { limit?: number } = {}): Promise<MonthlyChallengeData[]> {
	return challenges.slice(0, limit).map((issue) => getChallengeData(issue));
}

type Challenge = {
	handleData: MonthlyChallengeHandle;
	/** Part of a URL that identifies a particular page of Monthly challenges*/
	slug: string;
};

type MonthlyChallengeHandle = {
	/** The title of Monthly challenge */
	listTitle: string;
	/** Meta is data that describes and gives information about particular Monthly challenge. */
	meta: {
		title: string;
		description: string;
	};
	/** Hero is typically a prominent image, slider, text or similar element that has pride of place at the top of your homepage layout and possibly subsequent pages.*/
	hero: {
		heroHeader: string;
	};
};

type MonthlyChallengeData = {
	/** The title of Monthly challenge */
	title: string;
	/** The description for Monthly challenge*/
	description: string;
	/** URL for Monthly challenge*/
	to: string;
};
