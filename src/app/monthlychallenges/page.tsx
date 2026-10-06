import DefaultLayout from '@/components/layouts/DefaultLayout';
import { type ChallengeSeries, getSeriesList } from '@/data/monthlyChallenges';
import { createMetaData } from '@/util/createMetaData.server';
import Link from 'next/link';

export async function generateMetadata() {
	return await createMetaData({
		title: 'Virtual Coffee Monthly Challenges',
		description:
			'Every month, we create a challenge for our Virtual Coffee members to complete together.',
		Hero: 'UndrawGoodTeam',
	});
}

type SeriesBody = React.ComponentType;

function ChallengeItem({
	series,
	Body,
}: {
	series: ChallengeSeries;
	Body: SeriesBody;
}) {
	return (
		<>
			<dt className={series.current ? 'gridlist-current' : undefined}>
				{series.current && (
					<small className="d-block text-muted">Current Challenge: </small>
				)}{' '}
				{series.title}
			</dt>
			<dd className={series.current ? 'gridlist-current' : undefined}>
				<p className="gridlist-subtitle">{series.subtitle}</p>
				<Body />
				{series.latest && (
					<p>
						To view all of the details of the most recent challenge,{' '}
						<Link href={series.latest.href}>
							check out the {series.latest.label} challenge page
						</Link>
						.
					</p>
				)}
				{series.past.length > 0 && (
					<>
						<h3>Resources and results from past challenges:</h3>
						<ul>
							{series.past.map((challenge) => (
								<li key={challenge.slug}>
									<a href={challenge.href}>{challenge.label}</a>
								</li>
							))}
						</ul>
					</>
				)}
			</dd>
		</>
	);
}

export default async function Index() {
	const seriesList = getSeriesList();
	const bodies = await Promise.all(
		seriesList.map(
			async (series) =>
				(
					(await import(
						`@/content/monthly-challenges/series/${series.slug}.mdx`
					)) as { default: SeriesBody }
				).default,
		),
	);

	const metadata = await createMetaData({
		title: 'Virtual Coffee Monthly Challenges',
		description:
			'Every month, we create a challenge for our Virtual Coffee members to complete together.',
		Hero: 'UndrawGoodTeam',
	});

	return (
		<DefaultLayout
			Hero="UndrawGoodTeam"
			heroHeader={metadata.title as string}
			heroSubheader={metadata.description as string}
		>
			<div>
				<div className="bg-white py-3">
					<div className="container">
						<h2>What are monthly challenges?</h2>

						<p>
							These monthly challenges provide members the opportunity to learn,
							grow, and receive support and mentorship. There will be a theme
							for each month&apos;s challenge and weekly goals for the members
							to work on. Instructions, resources, and additional help for the
							challenges is provided in the <code>#monthly-challenge</code>{' '}
							channel in Slack. Along with our Maintainers, our Challenge Team
							Leads plan, organize, and facilitate these challenges.
						</p>

						<h2>Who can participate?</h2>

						<p>
							These challenges are available to all Virtual Coffee members. The
							goal is to support developers of all stages in their coding
							journey To become a member of Virtual Coffee, all you need to do
							is{' '}
							<Link href="/resources/virtual-coffee-handbook/guides-to-virtual-coffee/what-to-expect-in-virtual-coffee#coffees-virtual-coffee-weekly-zoom-chats">
								attend a Tuesday or Thursday Coffee
							</Link>{' '}
							and submit the form you&apos;ll receive at Coffee. After you
							submit the form, you will receive an invitation to join the Slack
							group, where you can share your progress on the challenges and ask
							questions.
						</p>
					</div>
				</div>

				<div className="bg-light py-5">
					<div className="container">
						<h2 className="display-5">Our challenges:</h2>
						<dl className="gridlist mt-4">
							{seriesList.map((series, index) => (
								<ChallengeItem
									key={series.slug}
									series={series}
									Body={bodies[index]}
								/>
							))}
						</dl>
					</div>
				</div>
			</div>
		</DefaultLayout>
	);
}
