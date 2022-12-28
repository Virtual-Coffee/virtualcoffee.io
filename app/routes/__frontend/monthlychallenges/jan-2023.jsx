import { json } from '@remix-run/node';
import { createMetaData } from '~/util/createMetaData.server';

export const handle = {
	listTitle: 'January, 2023: Month of Learning!',
	meta: {
		title: 'Monthly Theme & Challenge for January, 2023: Month of Learning!',
		description:
			'January challenge -> New year, time to learn new things. Four weeks, four check-ins.',
	},
	date: '2023-01-01',
	hero: {
		heroHeader: '',
	},
};

export async function loader() {
	const { title, description } = handle.meta;
	return json({
		meta: createMetaData({ title, description }),
	});
}

export function meta({ data: { meta } = {} } = {}) {
	return meta;
}

export default function Challenge() {
	return (
		<>
			<h1>
				<small>Monthly Challenge for January, 2023:</small> <br />
				Month of Learning!
			</h1>

			<p className="lead text-center">
				It's a new year and time for learning new things!
			</p>

			<h2 className="mt-5">The Challenge</h2>
			<p>
				During this month, we'll work on learning new dev-related things. You
				might deep-dive into one topic, start a small-group that focuses on
				community learning, focus on a new topic every week, or do a little bit
				of everything.
			</p>
			<p>
				If you're inspired by what you learn and want to share more, we
				encourage you to give a{' '}
				<a href="https://virtualcoffee.io/lunch-and-learn-idea/">
					Lunch & Learn
				</a>{' '}
				in February or get ready for our Lightning Talks in March!
			</p>

			<h2>Goals</h2>
			<p>
				Our goal is to learn something new, share what we've learned, and{' '}
				<a href="https://github.com/Virtual-Coffee/virtualcoffee.io/discussions/496">
					gather recommendations and resources
				</a>{' '}
				to share with the community.
			</p>

			<h2>How It Works</h2>
			<h3>Set your goals</h3>
			<p>In the first week, of January you should draft your learning plan:</p>
			<ul>
				<li>Define -&gt; What's the topic you'll be learning about?</li>
				<li>Reference -&gt; What resources will you use?</li>
				<li>
					Cohort type -&gt; How do you want to learn (alone, with people, async,
					live)? If you want to learn together, check out our #learning-together
					channel in slack,{' '}
					<a href="https://github.com/Virtual-Coffee/virtualcoffee.io/discussions/493">
						these tips
					</a>
					for starting your own cohort, or consider starting a{' '}
					<a href="https://virtualcoffee.io/resources/virtual-coffee/get-involved/coffee-table-groups">
						Coffee Table Group
					</a>
					.
				</li>
				<li>
					Set goals -&gt; 1h / week, 10h / week? Write an article, a lightning
					talk, a conference talk? The sky is the limit!
				</li>
			</ul>
			<h3>Make Progress</h3>
			<p>
				We'll be doing learning check-ins in the #monthly-challenge channel in
				slack. Each Monday, set your goal for the week. On Friday, give your
				progress update.
			</p>

			<p>
				Each week, you'll choose something you want to learn, the resources
				you'll use to learn about it, and then dive into learning. You can
				continue learning about one topic throughout the month, or use the month
				to explore a new topic every week.
			</p>
			<p>
				At the end of the month, we'll collect recommendations of the best
				tools, guides, and resources we found as we explored our topics for this
				month's challenge and share it with the whole community.
			</p>

			<h3>Learning Ideas</h3>
			<p>
				Not sure what you want to learn about? Here are a couple of
				non-traditional ideas to help you get started.
			</p>
			<ul>
				<li>
					Host a watch party and discussion. Is there an online conference,
					YouTube video, or livestream that you can watch with others and then
					discuss?
				</li>
				<li>
					Learn TypeScript with us! Every Tuesday at 2p ET, we livestream{' '}
					<a href="https://www.twitch.tv/virtualcoffeeio">TypeScript Tuesday</a>
					.
				</li>
				<li>
					Check out the #articles-and-resources channel in slack. Read a new one
					everyday.
				</li>
				<li>Listen to a podcast every morning that covers a new tech topic.</li>
			</ul>

			<h2>Quick References</h2>

			<ul>
				<li>
					<a href="https://github.com/Virtual-Coffee/virtualcoffee.io/discussions/496">
						Learning resources
					</a>
				</li>
				<li>
					<a href="https://github.com/Virtual-Coffee/virtualcoffee.io/discussions/493">
						How to create a cohort
					</a>
				</li>
			</ul>

			<hr />

			<p>And as usual we're always here if you need help or clarification ❤️</p>
		</>
	);
}
