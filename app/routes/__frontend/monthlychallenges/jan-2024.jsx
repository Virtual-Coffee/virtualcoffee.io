import { json } from '@remix-run/node';
import { createMetaData } from '~/util/createMetaData.server';
import { Link } from '@remix-run/react';

export const handle = {
	listTitle: 'January 2024: New Year, New Goals!',
	meta: {
		title: 'Monthly Challenge for January 2024: New Year, New Goals!',
		description: "January challenge -> Let's set up our goals for the year!",
	},
	date: '2024-01-01',
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
				<small>Monthly Challenge for January, 2024:</small> New Year, New Goals!
			</h1>

			<p className="lead mt-3">
				The new year is the perfect time to set your new goals. Whether learning
				new dev-related things, preparing yourself to get a new job, making new
				habits to be a better developer or anything you work towards this year.
				And this month, we're here to support you!
			</p>
			<p className="lead">
				During this month, we'll work on setting up your goals for the year and
				break them into achievable goals for each month.
			</p>

			<hr />

			<h2>Theme</h2>
			<p>New year, new goals!</p>

			<h2>Goals</h2>
			<p>
				Our goal is for you to have a map of monthly achievable goals for the
				year by the end of the month.
			</p>

			<h2>Who can participate?</h2>
			<p>
				Virtual Coffee's goal is to support all developers, no matter where they
				are in their coding journey. We encourage all members to participate.
			</p>

			<h2>How it works</h2>
			<h3>Set your goal and create your plans</h3>
			<ul>
				<li>
					<strong>Define</strong>: What is your goal in 2024?
				</li>
				<li>
					<strong>Plan</strong>: What steps do you need to take to achieve the
					goal?
				</li>
				<li>
					<strong>Set achievable goals for each month</strong>: What do you need
					to do each month to reach your big goal?
				</li>
			</ul>
			<h3 className="mb-3">
				What if I need help and want to hold myself accountable?
			</h3>
			<p>
				<strong>Coffee Table Groups</strong>
			</p>
			<p>
				If you need help setting your goal(s) or want to hold yourself
				accountable by working on them with the community over Zoom, we're here
				for you!
			</p>
			<ul>
				<li>
					Join the{' '}
					<Link to="/resources/virtual-coffee-handbook/guides-to-virtual-coffee/coffee-table-groups#accountabilibuddies">
						Accountabilibuddies
					</Link>{' '}
					to set goals with other members or ask for help and ideas.
				</li>
				<li>
					Is your goal to prepare for that technical interview and get that
					dream job? Come to our{' '}
					<Link to="/resources/virtual-coffee-handbook/guides-to-virtual-coffee/coffee-table-groups#tech-interview-study-group">
						Tech Interview Study Group
					</Link>{' '}
					and{' '}
					<Link to="/resources/virtual-coffee-handbook/guides-to-virtual-coffee/coffee-table-groups#the-pack-hunt">
						The Pack Hunt
					</Link>{' '}
					to plan on working on your resume, preparing for a technical
					interview, and going job hunting!
				</li>
			</ul>
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
					<code>#monthly-challenge</code> channel in Slack. We're all learning
					and growing together!
				</li>
				<li>
					If your goal is toward job searching, you can always ask for help in
					the <code>#tech-interview-study-group</code> or <code>#job-hunt</code>{' '}
					channel.
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
