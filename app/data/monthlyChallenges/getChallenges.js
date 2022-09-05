import { handle as sept2022 } from '~/routes/monthlychallenges/sept-2022';
import { handle as aug2022 } from '~/routes/monthlychallenges/aug-2022';
import { handle as july2022 } from '~/routes/monthlychallenges/july-2022';
import { handle as june2022 } from '~/routes/monthlychallenges/june-2022';
import { handle as may2022 } from '~/routes/monthlychallenges/may-2022';
import { handle as apr2022 } from '~/routes/monthlychallenges/apr-2022';
import { handle as mar2022 } from '~/routes/monthlychallenges/mar-2022';
import { handle as feb2022 } from '~/routes/monthlychallenges/feb-2022';
import { handle as jan2022 } from '~/routes/monthlychallenges/jan-2022';

import { handle as dec2021 } from '~/routes/monthlychallenges/dec-2021';
import { handle as nov2021 } from '~/routes/monthlychallenges/nov-2021';
import { handle as oct2021 } from '~/routes/monthlychallenges/oct-2021';
import { handle as sept2021 } from '~/routes/monthlychallenges/sept-2021';
import { handle as aug2021 } from '~/routes/monthlychallenges/aug-2021';
import { handle as july2021 } from '~/routes/monthlychallenges/july-2021';
import { handle as june2021 } from '~/routes/monthlychallenges/june-2021';
import { handle as may2021 } from '~/routes/monthlychallenges/may-2021';
import { handle as apr2021 } from '~/routes/monthlychallenges/apr-2021';
import { handle as mar2021 } from '~/routes/monthlychallenges/mar-2021';
import { handle as feb2021 } from '~/routes/monthlychallenges/feb-2021';
import { handle as jan2021 } from '~/routes/monthlychallenges/jan-2021';

import { handle as dec2020 } from '~/routes/monthlychallenges/dec-2020';
import { handle as nov2020 } from '~/routes/monthlychallenges/nov-2020';

const challenges = [
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
