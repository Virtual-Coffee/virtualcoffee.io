import { json } from '@remix-run/node';
import { createMetaData } from '~/util/createMetaData.server';

export const handle = {
	listTitle: 'August, 2022: Healthy Habits for Healthy Devs',
	meta: {
		title:
			'Monthly Theme & Challenge for August, 2022: Healthy Habits for Healthy Devs',
		description:
			'August challenge -> This month challenge is all about nourish our body, mind and spirit and give a step forward to become a healthier dev',
	},
	date: '2022-08-01',
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
			{/* <div className="alert alert-success">
				This monthly challenge is complete. Congratulations! Please join us for
				the <a href="/monthlychallenges/">next challenge</a>!
			</div> */}

			<h1>
				<small>Monthly Challenge for August, 2022:</small> Healthy Habits for
				Healthy Devs.
			</h1>

			<p className="lead">
				We're approaching summer and the exciting Hacktoberfest, let's take this
				month to recharge and recover. This month's challenge is all about
				nourishing our bodies, minds, and spirits so that we can become
				healthier developers.
			</p>

			<hr />

			<h2>Theme</h2>
			<p>Healthy Habits for Healthy Devs</p>

			<h2>Goals</h2>
			<p>To end the month with:</p>
			<ol>
				<li>
					Build a new habit that will make you a healthier dev, this can be mind
					and body centered (drink, move, read, meditate, rearrange your work
					station) or code centered (review your ReadMe, clean your code,
					refresh your GitHub repo) or both.
				</li>
				<li>
					Set the goal for yourself this month and define what successfully
					completing the challenge looks like. For example, could be something
					like: review the README in 5 of your projects (one every week) or run
					2k twice a week.
				</li>
			</ol>

			<h3>Daily check-ins- Are you hitting your goals?</h3>
			<p>
				Every day let's hold ourselves accountable by sharing our progress with
				the community. We will be using the slack channel for this purpose.
			</p>

			<h3>Who can participate?</h3>
			<p>
				Virtual Coffee's goal is to support all developers, no matter where they
				are in their coding journey. We encourage all members to participate.
				This challenge can be done alone or in a group.
			</p>

			<h3>How it works</h3>
			<ul>
				<li>
					Set your intentions - define and set a new habit you want to build
				</li>
				<li>
					Start your habit and track your progress. There are several tools that
					will help you track your habits: spreadsheets, habit tracker apps or a
					habit journal. Pick the one that will work best for you.
				</li>
				<li>
					Share your progress and celebrate every step. The goal here is to take
					baby steps. And remember that building a healthy habits is a process
					and that missing a day is part of the process.
				</li>
			</ul>

			<h3>How to share my progress?</h3>
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
				Tweet can be enough. For example:{' '}
				<i>"Today I did 10m of meditation in the morning"</i>.
			</p>

			<h3>Tips for forming healthy habits</h3>
			<ul>
				<li>
					<strong> Start small</strong> - and make it easy so it's hard to say
					no. For example, you want to increase your water intake, start with a
					glass of water every morning.
				</li>
				<li>
					<strong>Make it a schedule</strong> - block a time in your calendar to
					practice your habit
				</li>
				<li>
					<strong>Track your habits</strong> - visualize your progress is great
					way to motivate yourself
				</li>
				<li>
					<strong>Show compassion to yourself</strong> - remember this is a
					process and there will some steps back
				</li>
				<li>
					<strong>Celebrate and reward your wins!</strong>
				</li>
			</ul>

			<h2>Resources</h2>
			<ul>
				<li>
					<a href="https://jamesclear.com/atomic-habits">Atomic Habits</a>
				</li>
				<li>
					<a href="https://www.notion.so/58490c6abed4434289a86c6b3f802a68?v=006fa35bf496459395c0340db453fa07">
						Notion habit tracker
					</a>
				</li>
			</ul>
		</>
	);
}
