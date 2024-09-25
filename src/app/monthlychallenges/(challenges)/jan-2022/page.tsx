import { createMetaData } from '@/util/createMetaData.server';

export const handle = {
	listTitle: 'January, 2022: Month of Learning!',
	meta: {
		title: 'Monthly Theme & Challenge for January, 2022: Month of Learning!',
		description:
			'January challenge -> New year, time to learn new things. Four weeks, four check-ins.',
	},
	date: '2022-01-01',
	hero: {
		heroHeader: '',
	},
};

export const metadata = handle.meta;

export default function Challenge() {
	return (
		<>
			<h1>
				<small>Monthly Challenge for January, 2022:</small> <br />
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
				</a>
				to share with the community.
			</p>

			<h2>How It Works</h2>
			<ul>
				<li>
					This challenge can be done individually, in self-organized teams, a
					mixture of both, or some hybrid.
				</li>
				<li>
					We encourage members to choose something to learn the first week of
					the month, and share it with the community in the #monthly-challenge
					channel in Slack.
				</li>
				<li>
					Share also if you are willing to learn individually, or if you wish to
					have buddies: Slack is the best way to create self-organized cohorts.
				</li>
				<li>
					Each week, members choose something they want to learn, the resources
					they'll use to learn about it, and then dive into learning.
				</li>
				<li>
					We suggest this type of sharing for the first week:
					<ul>
						<li>Define -&gt; What's the topic?</li>
						<li>Reference -&gt; Resource you used.</li>
						<li>
							Cohort type -&gt; How do you want to learn (alone, with people)?
							and/or the name of your learning buddies. If you want to learn
							together, check out our #learning-together channel in slack and{' '}
							<a href="https://github.com/Virtual-Coffee/virtualcoffee.io/discussions/493">
								these tips
							</a>
							for starting your own cohort.
						</li>
						<li>
							Set goals -&gt; 1h / week, 10h / week? Write an article, a
							lightning talk, a conference talk? Sky is the limit!
						</li>
					</ul>
				</li>
				<li>
					At the end of the month, we'll collect recommendations of the best
					tools, guides, and resources we found as we explored our topics for
					this month's challenge and share it with the whole community.
				</li>
			</ul>

			<h2>Links From This Page</h2>

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
