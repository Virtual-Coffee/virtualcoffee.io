export const handle = {
	meta: {
		title: 'Monthly Theme & Challenge for February, 2022: Pairing!',
		description:
			'February challenge -> Pair up and complete five pomodoro sessions with other community members.',
	},
	listTitle: 'February, 2022: Pairing!',
};

export const meta = () => {
	return handle.meta;
};
// layout: layouts/simple.njk
// date: 2022-02-01
// tags: monthlychallenges
// ---

export default function Challenge() {
	return (
		<>
			<h1>
				<small>Monthly Challenge for February, 2022:</small> Pairing!
			</h1>

			<p className="lead">
				Pairing is more than just coding with someone else. Pairing is about
				communication, teaching, learning, positive reinforcements, and growing.
			</p>

			<p className="lead">
				This month, let’s work together to build on these skills. For this
				challenge, let’s try to hit 5 pairing sessions per person, limiting your
				pairing sessions to one Pomodoro session--twenty-five minutes--unless
				you have made arrangements with your partner. When you’ve finished one
				of your sessions, report back to the #monthly-challenge channel in slack
				and let us know how you did and what you worked on! We’ll track how many
				pomodoro sessions we hit. Before you start, take a look at Martin
				Fowler’s article
				<a
					href="https://martinfowler.com/articles/on-pair-programming.html"
					target="_blank"
					rel="noopener noreferrer"
				>
					On Pair Programming
				</a>
				.
			</p>

			<hr />

			<h2>Goal</h2>
			<p>To end the month with: 5, 25-minute pomodoro pairing sessions</p>

			<h3>Who can participate?</h3>
			<p>
				Virtual Coffee's goal is to support all developers, no matter where they
				are in their coding journey. We encourage all members to participate.
				This challenge can be done in pairs or as a group.
			</p>
			<p>
				If you're not sure how to find someone to pair with, check the
				#monthly-challenge channel on Mondays. Our team will help create random
				pairings if your respond to the pairing post.
			</p>

			<h3>Ways to get started</h3>
			<p>
				<em>
					If you want to pair, but you're not sure what to pair on, here are
					some ideas to get you started:
				</em>
			</p>
			<ul>
				<li>A project that you need some help on</li>
				<li>An opensource issue</li>
				<li>
					A <a href="https://leetcode.com/">LeetCode</a> problem
				</li>
			</ul>

			<h3>Pair Programming Resources</h3>
			<strong>Live Coding Tools</strong>
			<ul>
				<li>
					<a href="https://duckly.com">Duckly</a>
				</li>
				<li>
					<a href="https://tuple.app">Tuple</a>
				</li>
				<li>Zoom screen sharing</li>
				<li>
					<a href="https://code.visualstudio.com/blogs/2017/11/15/live-share">
						VSCode liveshare
					</a>
				</li>
			</ul>
			<strong>Live Collaboration/Whiteboarding Tools</strong>
			<ul>
				<li>
					<a href="https://excalidraw.com/">Excalidraw</a>
				</li>
				<li>
					<a href="https://miro.com/">Miro</a>
				</li>
			</ul>
			<p>
				If you'd like to recommend a resource for pair programming, you can add
				them to
				<a href="https://github.com/Virtual-Coffee/virtualcoffee.io/discussions/516">
					this discussion
				</a>
				.
			</p>

			<h3>What if I need help?</h3>
			<p>
				You can ask a question in the #help-and-pairing VC channel, get 1:1 help
				during Office Hours (you can find the doc for office hours at the top of
				the #help-and-pairing channel.), join the VC co-working room, or ask at
				a coffee! Asking for help is part of the process.
			</p>
			<p>
				We have #learning-together channel in slack if you're looking for a
				study buddy, or you can create your own
				<a href="https://github.com/Virtual-Coffee/virtualcoffee.io/discussions/493">
					cohort
				</a>
			</p>

			<p>And remember, we're always here to help ❤️</p>
		</>
	);
}
