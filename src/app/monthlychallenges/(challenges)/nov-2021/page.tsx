import { getChallengeData } from '@/data/monthlyChallenges/nov-2021';
import { Fragment } from 'react';

export const handle = {
	listTitle: 'November, 2021: 50k words!',
	meta: {
		title: 'Monthly Theme & Challenge for November, 2021: 50k words!',
		description:
			'November challenge -> Blogging: we all work together to hit 50,000 words.',
	},
	date: '2021-11-01',
	hero: {
		heroHeader: '',
	},
};

export const metadata = handle.meta;

export default async function Challenge() {
	const { completedGoals, currentGoal, sortedList, list, totals } =
		await getChallengeData();

	return (
		<>
			<div className="alert alert-success">
				This monthly challenge is complete. Congratulations! Please join us for
				the <a href="/monthlychallenges/">next challenge</a>!
			</div>

			<h1>
				<small>Monthly Challenge for November 2021:</small> Let's write 50k
				words together!
			</h1>

			<p className="lead">
				This month we're working together to blog 50,000 words! Based off the{' '}
				<a href="https://nanowrimo.org/">
					NaNoWriMo (National Novel Writing Month) Challenge
				</a>
				, we'll be doing the tech take on writing and working together towards
				the goal while posting on our own blogs.
			</p>

			<p className="lead">Get those blog posts up!</p>

			{completedGoals.length ? (
				<>
					<h2>
						<small>Current status:</small>
					</h2>

					<ul>
						{completedGoals.map((goal, i) => (
							<li key={i} className="lead">
								{goal.toLocaleString()} goal completed!!!
							</li>
						))}
					</ul>

					<div className="h3">
						Stretch Goal {completedGoals.length}:{' '}
						{totals.totalCount.toLocaleString()} out of{' '}
						{currentGoal.toLocaleString()} words
					</div>
				</>
			) : (
				<h2>
					Current status: {totals.totalCount.toLocaleString()} out of{' '}
					{currentGoal.toLocaleString()} words
				</h2>
			)}

			<div className="progress my-4" style={{ height: '3em' }}>
				<div
					className="progress-bar progress-bar progress-bar-striped"
					role="progressbar"
					style={{ width: `${(totals.totalCount / currentGoal) * 100}%` }}
					aria-valuenow={totals.totalCount}
					aria-valuemin={0}
					aria-valuemax={currentGoal}
				>
					{totals.totalCount.toLocaleString()} Words
				</div>
			</div>

			<h2 className="mt-5">Our Posts:</h2>

			{sortedList.map((person, i) => (
				<Fragment key={i}>
					<div className="header-anchor-wrapper header-anchor-wrapper-h3">
						<h3 id={person.slug} tabIndex={-1}>
							{person.name}
						</h3>
						<a className="header-anchor" href={`#${person.slug}`}>
							<span className="sr-only">
								Permalink to {person.name}'s posts
							</span>
							<span aria-hidden="true">#</span>
						</a>
					</div>

					<ul>
						{person.posts.map((post, j) => (
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
					{totals.list.map((person, i) => (
						<tr key={i}>
							<td>{person.name}</td>
							<td className="text-right">{person.posts.toLocaleString()}</td>
							<td className="text-right">{person.total.toLocaleString()}</td>
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

			<h2>How to Participate</h2>

			<p>
				Once you've written and published your content, sign in to the{' '}
				<a href="https://members.virtualcoffee.io/"> VC Members section</a> and
				follow links to the November Monthly Challenge!
			</p>

			<h4>What kind of content counts towards the challenge?</h4>

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

			<h4>What if I don't know what to write about?</h4>
			<p>
				We've got you covered. We hope to continually update{' '}
				<a href="https://github.com/Virtual-Coffee/virtualcoffee.io/discussions/458">
					this discussion
				</a>{' '}
				throughout the month, but here are some suggestions to get you started:
			</p>
			<ul>
				<li>
					Hot takes! What gets you passionate? Start there and see what happens.
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
				How to deal with imposter syndrome as a developer?
				<li>
					How deal with burnout when applying for your first developer job?
				</li>
				<li>
					What did you learn through your first developer interview? What did
					you wish you knew before starting your first developer job?
				</li>
				<li>
					What was your experience like during the first few months of your
					junior developer job?
				</li>
				<li>
					How did you overcome the fear of building in public? What tips do you
					have for developers who want to start building in public?
				</li>
				<li>
					How to push through with learning how to code when learning was
					difficult at times?
				</li>
				<li>How to start a freelancing career?</li>
				<li>
					Write about a function or a method: What it does, when you should use
					it, and why
				</li>
				<li>
					A time you successfully troubleshot an error: This can be super
					helpful for those who copy/paste an error message
				</li>
				<li>A simple script in your terminal</li>
				<li>
					A customization that saves you time/frustration in your daily workflow
				</li>
				<li>
					Keep a journal of your coding journey and then pull topics from it.
				</li>
				<li>
					Keep a brag board of your successes, or a Time I learned log. Then
					write about one of your favorites.
				</li>
				<li>
					A meta post like how did you chose where you blog, other options your
					were considering before where you're currently set up. Why are you
					blogging? How was the set up process? Features/topics/platforms you're
					thinking to incorporate in the future.
				</li>
			</ul>

			<p>
				A very special thanks goes out to
				<a href="https://github.com/danieljanderson">Daniel Anderson</a>,{' '}
				<a href="https://github.com/meg-gutshall">Meg Gutshall</a>,{' '}
				<a href="https://github.com/jdwilkin4">Jessica Wilkins</a>,{' '}
				<a href="https://github.com/ClJarvis">Chris Jarvis</a>, and{' '}
				<a href="https://github.com/sadiejay">Sadie Jay</a> for helping to
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
		</>
	);
}
