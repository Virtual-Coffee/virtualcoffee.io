const handle = {
	listTitle: 'July, 2022: Demo in public!',
	meta: {
		title: 'Monthly Theme & Challenge for July, 2022: Build in Public',
		description:
			"July challenge -> Let's build in public, starting with Daily Standup! During this month, let's learn to communicate what we're working on, show our development, be confident and proud of any progress we've made, and demo what we've done!",
	},
	date: '2022-07-01',
	hero: {
		heroHeader: '',
	},
};

export const metadata = handle.meta;

export default function Challenge() {
	return (
		<>
			<h1>
				<small>Monthly Challenge for July, 2022:</small> Let's build in public,
				starting with Daily Standup!
			</h1>

			<p className="lead">
				During this month, let's learn to communicate what we're working on,
				show our development, and be confident and proud of any progress made.
			</p>

			<hr />

			<h2>Theme</h2>
			<p>Demo in public!</p>

			<h2>Goals</h2>
			<p>To end the month with:</p>
			<ul>
				<li>A habit of talking about the things we're working on.</li>
				<li>A plan for continuing progress.</li>
				<li>A demo for the VC community.</li>
			</ul>

			<h3>Who can participate?</h3>
			<p>
				Virtual Coffee's goal is to support all developers, no matter where they
				are in their coding journey. This challenge is opened to non-coding
				projects as well. So if you want to talk about the projects you're doing
				in other areas of your life, we want to hear about it. We encourage all
				members to participate. This challenge can be done alone or in a group.
			</p>
			<h4>Getting Started</h4>
			<ul>
				<li>
					Define and set goals: decide what you want to share, define what is
					the scope and the result you want to reach at the end of the month.
				</li>
				<li>
					Start working: once your demo project is defined you can start
					considering your demo plans. Share and celebrate your progress!
				</li>
			</ul>
			<h4>Making Progess</h4>
			<p>
				Share your progress in the #monthly-challenge channel in Slack. We have
				a slack reminder everyday, but feel free to post when you can. Some of
				our monthly-challenge team will also be holding video check-ins, so be
				on the lookout for those announcements!
			</p>

			<p>
				While no other platform is imposed, it can be a good idea to also share
				on social media for more reach but only if you are comfortable to do so
				(Twitter using -or not- the hashtag #buildinpublic, a personal blog, a
				post on DEV.to, etc.).
			</p>

			<p>
				Sharing every time some work is added is a good idea, small progress is
				still progress. You don't need to write a detailed blog post: a 140
				characters Tweet can be enough! For example: "Today I added some
				styling. I used Bootstrap and implemented some cards to display the
				users in the home page".
			</p>
			<p>
				Prepare for your demo. Would you prefer to pre-record your demo or share
				itlive? Pick your demo method and make a commitment for the final week.
			</p>

			<h3>What if I need help?</h3>
			<p>
				You can ask a question in the #help-and-pairing channel, get support in
				the #co-working-room channel, or ask at a coffee! You can also take
				advantage of our coffee table groups like our VC Indie-hackers and our
				Accountabilibuddies groups. Asking for help is part of the process.
			</p>
			<h3>To Complete the Challenge</h3>
			<ul>
				<li>Participate in 15 standups;</li>
				<li>Create a plan for progress;</li>
				<li>Demo in public either live or with a recording.</li>
			</ul>
			<h3>Demo Day</h3>
			<p>There will be two ways for participants to demo their projects:</p>
			<ul>
				<li>
					Synchronously - A Zoom meetup will be held for members who wish to
					demo their project to the VC community. You will need to register by
					the end of week 3 with the monthly challenge team.
				</li>
				<li>
					Asynchronously - You will be able to share your pre-recorded demos on
					the #monthly-challenge Slack channel, using{' '}
					<a href="https://www.loom.com/">Loom</a> for example (check{' '}
					<a href="https://www.loom.com/share/8e56d17338b04037ac83bea40556b03c">
						this example
					</a>
					).
				</li>
			</ul>
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
				<li>
					Check out this{' '}
					<a href="https://www.loom.com/share/e01d8a5d90f043439c21dd8cb7dd7ab8">
						demo
					</a>{' '}
					of one of our members preparing for a demo
				</li>
			</ul>

			<h3>Resources</h3>
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
