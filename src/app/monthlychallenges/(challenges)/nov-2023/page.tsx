/* eslint-disable react/no-unescaped-entities */
import { Fragment } from 'react';
import { createMetaData } from '@/util/createMetaData.server';
import { getChallengeData } from '@/data/monthlyChallenges/nov-2023';
import LeadText from '@/components/content/LeadText';
import Link from 'next/link';
import DefaultLayout from '@/components/layouts/DefaultLayout';

export { metaFromData as meta } from '@/util/remixHelpers';

const handle = {
	listTitle: 'November, 2023: 100k words!',
	meta: {
		title: 'Monthly Theme & Challenge for November, 2023: 100k words!',
		description:
			'November challenge -> Blogging: we all work together to hit 100,000 words.',
	},
	date: '2023-11-01',
	hero: {
		heroHeader: '',
	},
};

async function getData() {
	const { title } = handle.meta;

	const data = await getChallengeData();

	const description = `Current status: ${data.totals.totalCount.toLocaleString()} out of ${
		data.currentGoal?.title
	} words`;

	return {
		...data,
		meta: createMetaData({ title, description }),
	};
}

export default async function Challenge() {
	const { sortedList, totals, completedGoals, currentGoal, meta } =
		await getData();

	return (
		<DefaultLayout
			heroHeader={meta.title as string}
			heroSubheader={meta.description as string}
		>
			<div className="alert alert-success">
				This monthly challenge is complete. Congratulations! Please join us for
				the <Link href="/monthlychallenges/dec-2023">next challenge</Link>!
			</div>

			<h1>
				<small>Monthly Challenge for November 2023:</small> Let's write 100k
				words together!
			</h1>

			<LeadText>
				<p>
					This month we're working together to blog 100,000 words! Based off the{' '}
					<a href="https://nanowrimo.org/">
						NaNoWriMo (National Novel Writing Month) Challenge
					</a>
					, we'll be doing the tech take on writing and working together towards
					the goal while posting on our own blogs. We hit{' '}
					<Link href="/monthlychallenges/nov-2022">
						over 100k words last year
					</Link>
					, and we're going to start this year's challenge with a goal of 100k
					words.
				</p>
				<p>Get those blog posts up!</p>
			</LeadText>

			{totals.totalPosts > 0 && (
				<>
					{completedGoals.length ? (
						<>
							<h2>
								<small>Current status:</small>
							</h2>

							<ul>
								{completedGoals.map((goal, i) => (
									<li key={i} className="lead">
										{goal.title} goal completed!!!
									</li>
								))}
							</ul>

							<div className="h3">
								Stretch Goal {completedGoals.length}:{' '}
								{totals.totalCount.toLocaleString()} out of{' '}
								{currentGoal?.value.toLocaleString()} words
							</div>
						</>
					) : (
						<h2>
							Current status: {totals.totalCount.toLocaleString()} out of{' '}
							{currentGoal?.title} words
						</h2>
					)}

					<div className="progress my-4" style={{ height: '3em' }}>
						<div
							className="progress-bar progress-bar progress-bar-striped"
							role="progressbar"
							style={{
								width: `${
									(totals.totalCount / (currentGoal?.value || 1)) * 100
								}%`,
							}}
							aria-valuenow={totals.totalCount}
							aria-valuemin={0}
							aria-valuemax={currentGoal?.value}
						>
							{totals.totalCount.toLocaleString()} Words
						</div>
					</div>

					<h2 className="mt-5">Our Posts:</h2>

					{sortedList.map((author, i) => (
						<Fragment key={i}>
							<div className="header-anchor-wrapper header-anchor-wrapper-h3">
								<h3 id={`${author.slug}`} tabIndex={-1}>
									{author.name}
								</h3>
								<a className="header-anchor" href={`#${author.slug}`}>
									<span className="sr-only">
										Permalink to {author.name}'s posts
									</span>
									<span aria-hidden="true">#</span>
								</a>
							</div>

							<ul>
								{author.posts.map((post, j) => (
									<li key={j}>
										<a href={post.url}>{post.title}</a>
										<code>({post.count.toLocaleString()} words)</code>
									</li>
								))}
							</ul>
						</Fragment>
					))}

					<h2 className="mt-5">Totals:</h2>

					<table className="table mt-5" style={{ maxWidth: '600px' }}>
						<thead className="thead-dark">
							<tr>
								<th scope="col">Member Totals</th>
								<th scope="col" className="text-right">
									Posts
								</th>
								<th scope="col" className="text-right">
									Total Words
								</th>
							</tr>
						</thead>
						<tbody>
							{totals.list.map((author, i) => (
								<tr key={i}>
									<td>{author.name}</td>
									<td className="text-right">
										{author.posts.toLocaleString()}
									</td>
									<td className="text-right">
										{author.total.toLocaleString()}
									</td>
								</tr>
							))}
						</tbody>
						<tfoot>
							<tr>
								<th scope="col">Total</th>
								<th scope="col" className="text-right">
									{totals.totalPosts.toLocaleString()}
								</th>
								<th scope="col" className="text-right">
									{totals.totalCount.toLocaleString()} words
								</th>
							</tr>
						</tfoot>
					</table>
				</>
			)}

			<h2>How to Participate</h2>

			<p>
				Once you've written and published your content,{' '}
				<a
					href="https://airtable.com/app10kd5ewHiLTjxn/shrgRjUFpNjLN1V12"
					target="_blank"
					rel="noreferrer"
				>
					add your entry to our VC NaNoWriMo entry form
				</a>
				!
			</p>

			<p>
				<a
					href="https://airtable.com/app10kd5ewHiLTjxn/shrgRjUFpNjLN1V12"
					target="_blank"
					rel="noreferrer"
					className="btn btn-primary btn-lg"
				>
					Add Your Entry!
				</a>
			</p>

			<h3>What kind of content counts towards the challenge?</h3>

			<p>
				Any tech-related blog posts or articles published in the month of
				November! Feel free to include code samples in your word count totals
				(if it's a word and you wrote it, we'll count it 😊).
			</p>

			<p>
				While we love good documentation here at Virtual Coffee, README docs or
				anything else you would normally consider documentation don't count for
				this challenge.
			</p>

			<p>
				Since last year, we're embracing an <strong>official topic</strong> as
				well as general topics. We hope to add a resource section to our site
				for Building Your Personal Brand. We'd love to feature our members' blog
				posts on the topic.
			</p>

			<h3>What if I'm not confident about my writing?</h3>

			<p>
				We all start somewhere. The more you practice, the better you'll get. We
				have volunteers who are willing to proofread and give you feedback on
				your writing. Just put a link to your blog post draft in the{' '}
				<code>#monthly-challenge</code> channel and ask for the help you need.
			</p>

			<h3>What if I don't know what to write about?</h3>

			<p>
				We've got you covered with extensive lists in{' '}
				<a href="https://github.com/Virtual-Coffee/virtualcoffee.io/discussions/711">
					this discussion
				</a>{' '}
				and{' '}
				<a href="https://github.com/Virtual-Coffee/virtualcoffee.io/discussions/458">
					this discussion
				</a>
				.
			</p>
			<h4>Developer Health Topic Suggestions</h4>
			<ul>
				<li>
					Imposter Syndrome: What is it? What advice do you have for overcoming
					it?
				</li>
				<li>
					Burnout: We hear a lot about burnout in tech. Do you think this is
					industry-specific? What contributes to burnout? How do we navigate
					burnout? How can we reduce burnout in the industry?
				</li>
				<li>
					Physical Health: What equipment or practice has helped you to maintain
					physical health when you're at your computer all day?
				</li>
				<li>
					Psychological Safety: What does that mean? How do company culture,
					team dynamics, and good management impact it?
				</li>
			</ul>
			<h4>General Topic Suggestions</h4>
			<ul>
				<li>
					What did your Virtual Coffee breakout room talk about recently? Can
					you compile a list of tips or takeaways from the conversation?
				</li>
				<li>
					What did you learn this week? One of the best ways to teach is by
					writing about something you just learned!
				</li>
				<li>
					Best Practices. What are some guidelines you've learned that can help
					developers create best practices?
				</li>
				<li>
					Compare and Contast. Have you learned a new language or new approach?
					How does that differ from what you've done in the past?
				</li>
				<li>What are 10 HTML tags you've never heard of or used?</li>
				<li>
					What did you learn from building a project using X JavaScript
					library/framework?
				</li>
				<li>
					What did you learn from doing an accessibility audit of your website?
				</li>
				<li>Hacktoberfest 2023: takeaways, review, tips.</li>
				<li>How to write good headlines for technical blogs?</li>
				<li>Beginner guide to getting started with Git.</li>
				<li>
					What did you learn from teaching yourself how to code and landing a
					dev job
				</li>
				<li>What Is Apache Kafka?</li>
				<li>How To Start Connecting With a New Community </li>
				<li>What Learning a Second Programming Language Taught Me About JS</li>
			</ul>

			<p>
				A very special thanks goes out to{' '}
				<a href="https://github.com/jdwilkin4">Jessica Wilkins</a> and{' '}
				<a href="https://github.com/Cerchie">Lucia Cerchie</a> for helping to
				compose this list!
			</p>

			<p>And remember, we're always here to help ❤️</p>

			<h2>Resources</h2>
			<ul>
				<li>
					<a href="https://www.youtube.com/watch?v=hD6uRvCtA_0">
						How to Grow Your Tech Career Through Writing
					</a>
				</li>
				<li>
					<a href="https://twitter.com/amandanat/status/1448662631938596879?s=20">
						Amanda Natividad's Twitter thread: 11 prompts so you'll never run
						out of content ideas
					</a>
				</li>
				<li>
					<a href="https://dev.to/andrewbaisden/100-blog-topic-ideas-for-your-next-article-no-more-writers-block-2e0j">
						100 Blog Topic Ideas for your Next Article
					</a>
				</li>
			</ul>
		</DefaultLayout>
	);
}
