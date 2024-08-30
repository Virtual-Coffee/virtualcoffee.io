import { json } from '@remix-run/node';
import { createMetaData } from '~/util/createMetaData.server';
import { Link } from '@remix-run/react';

export const handle = {
	listTitle: 'June 2024: Mid-Year Check-In!',
	meta: {
		title: 'Monthly Challenge for June 2024: Mid-Year Check-In!',
		description:
			"June challenge -> Let's pause, assess, and adjust as we reach the halfway point of the year!",
	},
	date: '2024-06-01',
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
				the <Link to="/monthlychallenges/july-2024">next challenge</Link>!
			</div>
			<h1>
				<small>Monthly Challenge for June, 2024:</small> Mid-Year Check-In!
			</h1>

			<p className="lead mt-3">
				In January, we initiated the "
				<Link to="/monthlychallenges/jan-2024">New Year, New Goals</Link>"
				challenge, encouraging you to set your goals for the year and break them
				down into achievable monthly plans.
			</p>
			<p className="lead">
				This month, we're doing a "Mid-Year Check-In" to provide you with the
				opportunity to reflect on your progress, reevaluate your goals, and gain
				clarity on the path you set out on at the beginning of the year. Let's
				take a moment to pause, assess, and adjust as we reach the halfway point
				of the year. As always, we're here to support you!
			</p>

			<hr />

			<h2>Theme</h2>
			<p>Mid-Year Check-In!</p>

			<h2>Goals</h2>
			<p>
				Our goal is for you to reflect on your progress, reevaluate your goals,
				and gain clarity on the path you set out on at the beginning of the
				year.
			</p>

			<h2>Who can participate?</h2>
			<p>
				Virtual Coffee's goal is to support all developers, no matter where they
				are in their coding journey. We encourage all members to participate.
			</p>

			<h2>How it works</h2>
			<h3>Reflect, Reevaluate, and Move Forward</h3>
			<ul>
				<li>
					<strong>Reflect on achievements</strong>: Think about your goals set
					at the beginning (or any point) this year. What have you accomplished
					so far? Did you master a new skill, hit a personal target, or complete
					a project?
				</li>
				<li>
					<strong>Learn from challenges</strong>: Did you encounter any setbacks
					or roadblocks? It's okay! Analyze what went wrong. Was it a lack of
					resources, an unexpected hurdle, or an underestimation of the effort
					needed?
				</li>
				<li>
					<strong>Set your sights forward</strong>: What are your remaining
					goals for the year? Are there any adjustments you want to make based
					on your progress?
				</li>
				<li>
					<strong>Embrace shifting goals</strong>: It's okay if your goals have
					changed! Your priorities and circumstances can shift throughout the
					year. Embrace the change, revisit your initial goals, and adjust your
					goals accordingly.
				</li>
			</ul>
			<h3 className="mb-3">
				What if I need help and want to hold myself accountable?
			</h3>
			<p>
				<strong>Coffee Table Groups</strong>
			</p>
			<p>
				If you need help reflecting on and reevaluating your goal(s) or want to
				hold yourself accountable by working on them with the community, we're
				here for you!
			</p>
			<p>
				We have various{' '}
				<Link to="/resources/virtual-coffee-handbook/guides-to-virtual-coffee/coffee-table-groups">
					Coffee Table Groups
				</Link>{' '}
				you can join to hold yourself accountable and support you!
			</p>
			<p>
				Check the <code>#announcement</code> channel on Slack for the schedule
				of each Coffee Table Group and <code>#vc-events</code> channel to join
				the event.
			</p>
			<p>
				<strong>Slack</strong>
			</p>
			<ul>
				<li>
					We encourage you to post your ideas, questions, and progress in the{' '}
					<code>#monthly-challenge</code> channel in Slack.
				</li>
				<li>
					We'll do a Slack check-in each week to track your progress and support
					you.
				</li>
			</ul>
			<p>Remember, we're always here to help. ❤️</p>

			<h2>Tools and Resources</h2>
			<ul>
				<li>
					<a href="https://www.notion.so/">Notion</a>
				</li>
				<li>
					<a href="https://docs.google.com/">Google Docs</a>
				</li>
				<li>
					<a href="https://www.mindtools.com/a4wo118/smart-goals">
						SMART Goals - How to Make Your Goals Achievable
					</a>
				</li>
				<li>
					<a href="https://www.betterup.com/blog/personal-goals">
						Personal goals that work: 20 examples to get started
					</a>
				</li>
			</ul>
		</>
	);
}
