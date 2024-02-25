import { json } from '@remix-run/node';
import { createMetaData } from '~/util/createMetaData.server';
import { Link } from '@remix-run/react';

export const handle = {
	listTitle: 'February, 2024: Month of Learning!',
	meta: {
		title: 'Monthly Theme & Challenge for February 2024: Month of Learning!',
		description: 'February challenge -> Time to learn new things!',
	},
	date: '2024-02-01',
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
			<div className="alert alert-success">
				This monthly challenge is complete. Congratulations! Please join us for
				the <Link to="/monthlychallenges/mar-2024">next challenge</Link>!
			</div>

			<h1>
				<small>Monthly Challenge for February 2024:</small> <br />
				Month of Learning!
			</h1>

			<p className="lead mt-3">It's time for learning new things!</p>

			<hr />

			<h2>The Challenge</h2>
			<p>
				During this month, we'll work on learning new dev-related things. You
				might deep-dive into one topic, focus on a new topic every week, or do a
				little bit of everything.
			</p>
			<p>
				If you're inspired by what you learn and want to share more, we
				encourage you to give a{' '}
				<Link to="/lunch-and-learn-idea/">Lunch & Learn</Link> or get ready for
				our Lightning Talks in April!
			</p>

			<h2>Goals</h2>
			<p>
				We aim to learn something new, share what we've learned, and{' '}
				<a href="https://github.com/orgs/Virtual-Coffee/discussions/1123">
					gather recommendations and resources
				</a>{' '}
				to share with the community.
			</p>

			<h2>How It Works</h2>

			<h3>Create Your Plan and Set Your Goals</h3>
			<p className="mt-3">
				In the first week of February, you should draft your learning plan.
			</p>
			<ul>
				<li>
					<strong>Define:</strong> What's the topic you'll be learning about?
				</li>
				<li>
					<strong>Reference:</strong> What resources will you use?
				</li>
				<li>
					<strong>Cohort type:</strong> How do you want to learn?
					<ul>
						<li>
							<strong>With people:</strong> If you need accountability and have
							people around to support you, join our{' '}
							<Link to="/resources/virtual-coffee-handbook/guides-to-virtual-coffee/coffee-table-groups#accountabilibuddies">
								Accountabilibuddies
							</Link>{' '}
							sessions. Check out the <code>#announcements</code> and{' '}
							<code>#vc-events</code> channels in Slack for the schedule.
						</li>
						<li>
							<strong>Async cohort:</strong> If you want to learn async with
							other people, head over to our <code>#learning-together</code>{' '}
							channel on Slack and ask if anyone wants to learn about one
							particular topic together with you and create an async cohort. You
							can read{' '}
							<a href="https://github.com/orgs/Virtual-Coffee/discussions/493">
								these tips
							</a>{' '}
							for starting your own cohort.
						</li>
						<li>
							<strong>Independent:</strong> You want to learn alone but needs
							something to hold you accountable? You can use{' '}
							<a href="https://github.com/adiati98/learning-journal-template">
								this learning journal template
							</a>{' '}
							to record your progress.
						</li>
						<li>
							<strong>Live:</strong> Do you want to do a live stream while
							learning? Drop the time of your stream and the link to your Twitch
							(or any other platform you use) in the{' '}
							<code>#external-events</code> channel on Slack so the community
							can attend and learn together!
						</li>
					</ul>
				</li>
				<li>
					<strong>Before you start, set a goal for yourself</strong>. Set weekly
					goals and/or goals for the month. For example, you may want to learn
					accessibility for 1 hour/week, 10 hours/week, or complete one
					lesson/day. Maybe your goal involves creation. You may want to write
					an article, a lightning talk, or a conference talk based on your
					learning. The sky is the limit!
				</li>
			</ul>

			<h3>Make Progress</h3>
			<p>
				We'll be doing learning check-ins in the <code>#monthly-challenge</code>{' '}
				channel in Slack. Each Monday, set your goal for the week. On Friday,
				give your progress update.
			</p>
			<p>
				Each week, you'll choose something you want to learn and the resources
				you'll use to learn about it, then dive into learning. You can continue
				learning about one topic throughout the month or use the month to
				explore a new topic every week.
			</p>
			<p>
				At the end of the month, we'll collect recommendations of the best
				tools, guides, and resources we found as we explored our topics for this
				month's challenge and share them with the whole community.
			</p>

			<h3>Learning Ideas</h3>
			<p>
				Not sure what you want to learn about? Here are a couple of
				non-traditional ideas to help you get started:
			</p>
			<ul>
				<li>
					Host a watch party and discussion. Is there an online conference,
					YouTube video, or live stream that you can watch with others and then
					discuss?
				</li>
				<li>
					Check out the <code>#articles-and-resources</code> channel in Slack.
					Read a new one every day.
				</li>
				<li>Listen to a podcast every morning that covers a new tech topic.</li>
			</ul>

			<h2>Quick References</h2>
			<ul>
				<li>
					<a href="https://github.com/adiati98/learning-journal-template">
						Learning journal template
					</a>
				</li>
				<li>
					<a href="https://github.com/orgs/Virtual-Coffee/discussions/1123">
						Learning resource 2024
					</a>
				</li>
				<li>
					<a href="https://github.com/Virtual-Coffee/virtualcoffee.io/discussions/496">
						Learning resources 2022
					</a>
				</li>
				<li>
					<a href="https://github.com/Virtual-Coffee/virtualcoffee.io/discussions/493">
						How to create a cohort for Month of Learning
					</a>
				</li>
			</ul>

			<p>And as usual we're always here if you need help or clarification ❤️</p>
		</>
	);
}
