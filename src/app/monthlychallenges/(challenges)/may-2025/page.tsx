import { createMetaData } from '@/util/createMetaData.server';
import Link from 'next/link';

const handle = {
	listTitle: 'May 2025: Goals Check-In!',
	meta: {
		title: 'Monthly Challenge for May 2025: Goals Check-In!',
		description:
			"May challenge -> Let's pause, assess, and adjust those monthly achievable goals!",
	},
	date: '2025-05-01',
	hero: {
		heroHeader: '',
	},
};

export const metadata = handle.meta;

export default function Challenge() {
	return (
		<>
			<div className="alert alert-success">
				This monthly challenge is complete. Congratulations! Please join us for
				the <Link href="/monthlychallenges/summer-2025">next challenge</Link>!
			</div>

			<h1>
				<small>Monthly Challenge for May, 2025:</small> Goals Check-In!
			</h1>

			<p className="lead mt-3">
				In January, we initiated the "
				<Link href="/monthlychallenges/jan-2025">New Year, New Goal</Link>"
				challenge, encouraging you to set one big goal for the year and break it
				down into achievable monthly goals.
			</p>
			<p className="lead">
				This month, we're doing a "Goals Check-In" to allow you to reflect on
				your progress, reevaluate the monthly goals, and gain clarity on the
				path you set out on at the beginning of the year to achieve that one big
				goal. Let's take a moment to pause, assess, and adjust those monthly
				goals if necessary. As always, we're here to support you!
			</p>

			<hr />

			<h2>Theme</h2>
			<p>Goals Check-In!</p>

			<h2>Goals</h2>
			<p>
				Our goal is for you to reflect on your progress, reevaluate your monthly
				goals, and gain clarity on the path you set out on at the beginning of
				the year to achieve that big goal.
			</p>

			<h2>Who can participate?</h2>
			<p>
				Virtual Coffee's goal is to support all developers, no matter where they
				are in their coding journey. We encourage all members to participate.
			</p>

			<h2>How it works</h2>
			<h3>Reflect, Reevaluate, Adjust, and Move Forward</h3>
			<ul>
				<li>
					<strong>Reflect on achievements</strong>: Think about your big goal
					and monthly goals set at the beginning (or any point) this year. What
					have you accomplished so far?
				</li>
				<li>
					<strong>Learn from challenges</strong>: Did you encounter any setbacks
					or roadblocks? It's okay! Analyze what went wrong. Was it a lack of
					resources, an unexpected hurdle, or an underestimation of the effort
					needed?
				</li>
				<li>
					<strong>Set your sights forward</strong>: What are your remaining
					monthly goals for the year to reach your big goal? Are there any
					adjustments you want to make based on your progress?
				</li>
				<li>
					<strong>Embrace shifting goal</strong>: It's okay if your goal has
					changed! Your priorities and circumstances can shift throughout the
					year. Embrace the change, revisit your initial goal, and adjust your
					monthly goals accordingly.
				</li>
			</ul>
			<h3 className="mb-3">
				What if I need help and want to hold myself accountable?
			</h3>
			<p>
				<strong>Coffee Table Groups</strong>
			</p>
			<p>
				If you need help reflecting on and reevaluating your big goal and
				monthly goals or want to hold yourself accountable by working on them
				with the community, we're here for you!
			</p>
			<p>
				We have various{' '}
				<Link href="/resources/virtual-coffee-handbook/guides-to-virtual-coffee/coffee-table-groups">
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
					We'll do synchronous and asynchronous weekly check-ins to track your
					progress and support you.
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
