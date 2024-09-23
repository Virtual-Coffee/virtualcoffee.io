export const handle = {
	meta: {
		title: 'Virtual Coffee Newsletter, August 2022',
		description:
			'Virtual Coffee is Making Healthy Habits and Welcoming New Members 💝',
	},
	date: '2022-08-01',
	listTitle: 'August 2022',
};

export default function Issue() {
	return (
		<>
			<h2>Hey friends!</h2>

			<p className="lead">
				It's time to keep ourselves steady with some Healthy Habits in August!
			</p>

			<hr />

			<h2>💞 Community Kindness</h2>
			<p>
				<em>Spotlighting some of the kindness happening in our community.</em>
			</p>
			<blockquote className="blockquote">
				<p className="mb-0">
					"Today was the first time demo-ing an app I've built to a live
					audience. I'm grateful to VC for providing that opportunity!"
				</p>
				<footer className="blockquote-footer">Rebecca</footer>
			</blockquote>
			<blockquote className="blockquote">
				<p className="mb-0">
					"Grateful for Julia and Marie for all the feedback in April!"
				</p>
				<footer className="blockquote-footer">Glen</footer>
			</blockquote>
			<blockquote className="blockquote">
				<p className="mb-0">
					"Whenever I'm reading a book about some bit of the tech industry it
					reminds me how grateful I am to be part of this bit of the industry
					here, where people are kind and supportive, even towards people
					working on projects other than the specific ones they favour."
				</p>
				<footer className="blockquote-footer">Dominic</footer>
			</blockquote>

			<hr />

			<h2 className="my-5">📆 What's happening at Virtual Coffee</h2>

			<h3 className="font-italic">July Recap</h3>
			<p>
				Monthly challenge -&gt;{' '}
				<a href="https://virtualcoffee.io/monthlychallenges/july-2022">
					All About Building in Public!
				</a>
			</p>
			<p>
				We spent July working on our projects and sharing that process with
				compatriots and well-wishers. Shout out to all the VC members who showed
				off what they did on demo day!
			</p>

			<h3 className="mb-3 font-italic">Volunteering at VC</h3>
			<p>
				Over the last few months, we've been trying to improve our documentation
				and support here at VC. We're very excited to be opening up membership!
				All of our active volunteers have an invite to send out to someone
				interested in joining Virtual Coffee. If you're interested in joining
				the volunteer team, check out some the roles{' '}
				<a href="https://virtualcoffee.io/resources/virtual-coffee/get-involved/paths-to-leadership">
					here
				</a>
				!
			</p>

			<h3 className="mb-3 font-italic">August Happenings</h3>
			<h4 className="mt-4">
				💡 Monthly Theme &amp; Challenge:{' '}
				<a href="https://virtualcoffee.io/monthlychallenges/aug-2022">
					Healthy Habits for Happy Devs
				</a>
				!
			</h4>
			<h5>
				This month's challenge is all about nourishing our bodies, minds, and
				spirits so that we can become healthier developers.
			</h5>
			<p>
				Build a new habit that will make you a healthier dev, this can be mind
				and body-centered (drink, move, read, meditate, rearrange your work
				station) or code-centered (review your ReadMe, clean your code, refresh
				your GitHub repo) or both.
			</p>
			<p>
				Set the goal for yourself this month and define what successfully
				completing the challenge looks like. For example, could be something
				like: review the README in 5 of your projects (one every week) or run 2k
				twice a week.
			</p>
			<p>
				You can check out our{' '}
				<a href="https://virtualcoffee.io/monthlychallenges">
					monthly challenge page
				</a>{' '}
				for more ideas on on getting started with our sharing challenge.
			</p>

			<h4 className="mt-4">☕🪑 Coffee Table Events</h4>
			<ul>
				<li>Tech Interview Study Group (Mondays at 4:00 PM ET)</li>
				<li>
					Job Seekers Coworking (Tuesdays at 7:00 PM ET and Thursdays at 9:00 AM
					ET)
				</li>
				<li>
					React/JS Meetup (Wednesday at 1:00 PM ET on the first and third weeks
					of the month)
				</li>
				<li>
					VC Public Speaking Support Group (Every other Monday at 12:00 PM ET —
					see #content-creation)
				</li>
				<li>
					Indie-startup hackers (Every other Wednesday at 12:00 PM ET - see
					#indie-startup-hackers)
				</li>
			</ul>

			<p>
				Note: These are the currently scheduled times for these events at the
				time of this publication. Please check the official VC #announcements
				Slack channel, or other noted channels, for any updates and links to
				event rooms.
			</p>

			<hr />

			<h2>Member Highlights</h2>

			<h3>Lunch & Learn Sessions</h3>
			<p>
				<em>We've had some amazing L&L's lately! Here's our latest.</em>
			</p>
			<ul>
				<li>
					<a href="https://www.youtube.com/watch?v=HnvPeNaLgck&t=2s">
						What’s The Goal? Give Feedback That Gets You Closer!
					</a>{' '}
					— Julia Seidman
				</li>
				<li>
					<a href="https://www.youtube.com/watch?v=zjtda-WHH8c">
						Cheap hosting with GitHub Pages and Actions
					</a>{' '}
					— Jörn Bernhardt
				</li>
				<li>
					<a href="https://www.youtube.com/watch?v=hmikm9Md7dQ">
						Parallels Between Fight Training and A Coding Bootcamp
					</a>{' '}
					— Safety Vest
				</li>
			</ul>

			<h3>Podcast</h3>
			<p>
				<em>We're back with Season 6 of the podcast!</em>
			</p>
			<ul>
				<li>
					<a href="https://virtualcoffee.io/podcast/david-alpert-on-pairing-and-providing-support">
						David Alpert — On pairing and providing support
					</a>
				</li>
				<li>
					<a href="https://virtualcoffee.io/podcast/bogdan-covrig-navigating-tech-career-paths">
						Bogdan Covrig — Navigating Tech Career Paths
					</a>
				</li>
			</ul>

			<h3>Blogposts</h3>
			<p>
				<em>
					Here's some of the awesome articles our members wrote last month!
				</em>
			</p>
			<ul>
				<li>
					<a href="https://stepzen.com/blog/using-vercels-middleware-and-graphql">
						Living on the Edge: Using Vercel’s Middleware and GraphQL — Lucia
						Cerchie
					</a>
				</li>
				<li>
					<a href="https://hashnode.iamdeveloper.com/what-is-deno-13he">
						What is Deno? — Nick Taylor
					</a>
				</li>
				<li>
					<a href="https://yougotthis.io/library/power-of-persuasion/">
						The Power Of Persuasion: Negotiation For Techies — Suze Shardlow
					</a>
				</li>
			</ul>

			<div className="card my-5 border-primary">
				<div className="card-body">
					<h5 className="card-title text-primary font-italic">Member Wins</h5>
					<div className="card-text">
						<blockquote className="blockquote">
							<p className="mb-0 font-italic">
								As always, shout-out to all our members celebrating new roles
								this month!
							</p>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">
								"Finally did my first in-person talk ever! Met so many nice
								folks at Phoenix JavaScript afterwards."
							</p>
							<footer className="blockquote-footer">Lucia</footer>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">
								"You guys…I built my first “project” project (as in, not lesson
								challenges and homework) with JS!"
							</p>
							<footer className="blockquote-footer">Debra-Kaye</footer>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">
								"Finishing up and prepping to demo the first big feature I've
								owned at my current job. It has been a looong process. it feels
								so good to finally make it to the end stages!"
							</p>
							<footer className="blockquote-footer">Courtney</footer>
						</blockquote>
					</div>
				</div>
			</div>

			<h2>What our members are up to</h2>
			<ul>
				<li>
					Check out some of our resident streamers:{' '}
					<a href="https://www.twitch.tv/bekahhw">Bekah</a>,{' '}
					<a href="https://www.twitch.tv/nickytonline">Nick</a>,{' '}
					<a href="https://www.twitch.tv/jonathanyeong">Jono</a>,{' '}
					<a href="https://www.twitch.tv/arthurdoler">Arthur</a>, and{' '}
					<a href="https://www.twitch.tv/iandouglas736">Ian</a>.
				</li>
				<li>
					<a href="https://www.getrevue.co/profile/nickytonline/issues/yet-another-newsletter-lol-issue-31-1002343">
						Nick Taylor's newsletter
					</a>{' '}
					keeps you up to date with the hot topics in tech.
				</li>
				<li>
					<a href="https://www.getrevue.co/profile/luciacerchie">
						Lucia Cerchie's newsletter
					</a>{' '}
					is a breath of fresh air in the tech space.
				</li>
			</ul>

			<h3>Open Source Projects</h3>
			<ul>
				<li>
					<a href="https://github.com/Virtual-Coffee/virtualcoffee.io/issues">
						VirtualCoffee.io
					</a>{' '}
					— an 11ty Web App for our community created by Dan Ott
				</li>
				<li>
					<a href="https://github.com/AmyShackles/regex_parser">Regex Parser</a>{' '}
					— a regular expression parser project by Amy Shackles
				</li>
				<li>
					<a href="https://github.com/drone/drone">DRONE</a> — a Continuous
					Delivery system built on container technology
				</li>
				<li>
					<a href="https://jesscss.github.io/">JESS CSS</a> — a CSS
					pre-processor that compiles to Javascript!
				</li>
			</ul>
		</>
	);
}
