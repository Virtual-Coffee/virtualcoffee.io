import { json } from '@remix-run/node';
import { createMetaData } from '~/util/createMetaData.server';

export const handle = {
	listTitle: 'July, 2021: Demoing in Public',
	meta: {
		title: 'Monthly Theme & Challenge for July, 2021: Demoing in Public',
		description:
			'July challenge -> VC Members learned to discuss and share their work throughout June and are now ready to move to the next level, demoing that work.',
	},
	date: '2021-07-01',
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
				the <a href="/monthlychallenges/">next challenge</a>!
			</div>

			<h1>
				<small>Monthly Challenge for July, 2021:</small>
				Let's demoing in public, let's show our work!
			</h1>

			<p className="lead">
				During this month, the idea is to learn to communicate around a project
				as you demo it, show the finished product or show the finished parts,
				give confidence and learn to be proud of any progress made.
			</p>

			<hr />

			<h2>Theme</h2>
			<p>Let's demo in public!</p>

			<h2>Goals</h2>
			<ol>
				<li>
					Define and set goals: decide what you want to share, define what is
					the scope and the result you want to reach at the end of the month.
				</li>
				<li>
					Start working: once your demo project is defined you can start
					considering your demo plans. Share and celebrate your progress!
				</li>
				<li>
					Reach your goal: can you present to a group in VC? Would you prefer to
					pre-record it? Pick your demo method and make a commitment for the
					final week.
				</li>
				<li>Present: Synchronously or async. See explanation below.</li>
			</ol>

			<h3>Weekly check-ins- Are you hitting your goals?</h3>
			<p>
				Monday of each week, set the goals for that week and by Friday
				review/check-in with those goals. We will be using the slack channel for
				this purpose.
			</p>

			<h3>Demo Days - Final Week</h3>
			<p>There will be two ways for participants to demo their projects:</p>
			<ol>
				<li>
					<strong>Synchronously</strong> - A Zoom meetup will be held for
					members who wish to demo their project to the VC community. You will
					need to register by the end of week 3 with the monthly challenge team.
				</li>
				<li>
					<strong>Asynchronously</strong> - You will be able to share your
					pre-recorded demos on the #monthly-challenge Slack channel, using{' '}
					<a href="https://www.loom.com/">Loom</a> for example (check{' '}
					<a href="https://www.loom.com/share/8e56d17338b04037ac83bea40556b03c">
						this example).
					</a>
				</li>
			</ol>

			<h4>Who can participate?</h4>
			<p>
				Virtual Coffee's goal is to support all developers, no matter where they
				are in their coding journey. We encourage all members to participate.
				This challenge can be done alone or in a group.
			</p>

			<h4>How to share my progress?</h4>
			<p>
				Share your progress in the #monthly-challenge channel in Slack. While no
				other platform is imposed, it can be a good idea to also share on social
				media for more reach but only if you are comfortable to do so (Twitter
				using -or not- the hashtag #VCMonthlyChallenge, a personal blog, a post
				on <a href="https://dev.to/">DEV.to</a>, you get the idea)
			</p>

			<p>
				Sharing every time some work is added is a good idea, small progress is
				still progress. No need to write a detailed blog post: a 140 characters
				Tweet can be enough. For example:
				<i>
					"Today I added some styling. I used Bootstrap and implemented some
					cards to display the users in the home page"
				</i>
				.
			</p>

			<h4>What if I need help?</h4>
			<p>
				You can ask a question in the #help-and-pairing VC channel, get 1:1 help
				during Office Hours (check #office-hours channel), join the VC
				co-working room. Asking for help is part of the process!
			</p>
			<p>And remember, we're always here to help ❤️</p>

			<h3>Tips for Demoing</h3>
			<p>Before you start:</p>
			<ul>
				<li>Test the exact workflow(s) you are planning to demo</li>
				<li>Prepare all the environments you need for the demo</li>
				<li>Close potential distractions such as Slack or email programs</li>
				<li>Test your mic and camera</li>
				<li>Prepare some notes about what you want to say during the demo</li>
				<li>
					If you are demoing synchronously, make sure you have a good internet
					connection
				</li>
				<li>
					If you are on a larger screen, make sure that code is large enough,
					and visuals zoomed enough, to be easy to read on smaller screens
				</li>
			</ul>

			<p>
				Check out{' '}
				<a href="https://www.loom.com/share/e01d8a5d90f043439c21dd8cb7dd7ab8">
					this demo
				</a>
				of one of our members preparing for a demo
			</p>

			<h2>Resources</h2>
			<ul>
				<li>
					<a href="https://www.atlassian.com/agile/scrum/sprint-reviews">
						Agile Sprint Reviews: Three steps for better sprint reviews with
						your agile team.
					</a>
				</li>
				<li>
					<a href="https://www.goodrequest.com/blog/how-to-prepare-for-a-demo-or-presentation-of-a-software-project">
						How to prepare a demo
					</a>
				</li>
				<li>
					<a href="https://dev.acquia.com/blog/how-to-give-a-great-agilescrum-sprint-demo/09/08/2018/19771">
						How to give a great Agile sprint demo
					</a>
				</li>
			</ul>
		</>
	);
}
