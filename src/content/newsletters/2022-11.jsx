import Link from 'next/link';

export const handle = {
	meta: {
		title: 'Virtual Coffee Newsletter, November 2022',
		description: 'November is for writing! 💝',
	},
	date: '2022-11-01',
	listTitle: 'November 2022',
};

export default function Issue() {
	return (
		<>
			<h2>Hey friends!</h2>

			<p className="lead">
				<a href="https://www.digitalocean.com/blog/hacktoberfest-2022-your-mission-for-open-source">
					Hacktoberfest
				</a>{' '}
				was amazing but now it's time to share not just our time and code, but
				our ideas and dreams! It's time to write!
			</p>

			<hr />

			<h2>💞 Community Kindness</h2>
			<p>
				<em>Spotlighting some of the kindness happening in our community.</em>
			</p>
			<blockquote className="blockquote">
				<p className="mb-0">
					"I am so grateful for this community and everything that everyone here
					continues to do to make this community and the larger tech world a
					kinder, more inclusive, and more positive place."
				</p>
				<footer className="blockquote-footer">Bekah</footer>
			</blockquote>
			<blockquote className="blockquote">
				<p className="mb-0">
					"Late to respond, but I'm always grateful for this community. I have
					so many great friendships here even though we've never met... yet."
				</p>
				<footer className="blockquote-footer">Nick</footer>
			</blockquote>

			<hr />

			<h2 className="my-5">📆 What's happening at Virtual Coffee</h2>

			<h3 className="font-italic">October Recap</h3>
			<p>
				Monthly challenge -&gt;{' '}
				<Link to="/monthlychallenges/oct-2022">Hacktoberfest</Link>!
			</p>
			<p>
				We spent October doing all things{' '}
				<a href="https://hacktoberfest.virtualcoffee.io/">Hacktoberfest</a>.
				We're so proud of the community for coming together on another
				successful Hacktoberfest in every way. Thank you to all the maintainers,
				mentors, and contributors who participated, and a special thanks to
				those who helped on the{' '}
				<a href="https://github.com/Virtual-Coffee/virtualcoffee.io">
					Virtual Coffee website
				</a>
				.
			</p>

			<h3 className="mb-3 font-italic">
				November -&gt;{' '}
				<Link to="/monthlychallenges/nov-2022">
					NaNoWriMo Writing Challenge
				</Link>
				!
			</h3>
			<p>
				This month we're working together to blog 100,000 words! Based off the{' '}
				<a href="https://nanowrimo.org/">NaNoWriMo</a> (National Novel Writing
				Month) Challenge, we'll be doing the tech take on writing and working
				together towards the goal while posting on our own blogs. And since we
				hit over 125,000 words last year, we're going to start this year's
				challenge big with a goal of 100k words.
			</p>

			<h4 className="mt-4">☕🪑 Coffee Table Events</h4>
			<ul>
				<li>Tech Interview Study Group (Mondays at 4:00 PM ET)</li>
				<li>
					Job Seekers Coworking Room (Tuesdays at 7:00 PM ET and Thursdays at
					9:00 AM ET)
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
					Indie-startup hackers (Every other Wednesday at 12:00 PM ET — see
					#indie-startup-hackers)
				</li>
			</ul>

			<h4 className="mt-4">☕ Official Virtual Coffee Events</h4>
			<ul>
				<li>
					Virtual Coffee (Tuesdays at 9:00 AM ET | Thursdays at 12:00 PM ET)
				</li>
				<li>
					TypeScript Tuesday (Tuesdays at 2:00 PM ET on{' '}
					<a href="https://www.twitch.tv/virtualcoffeeio">Twitch</a>)
				</li>
			</ul>
			<h5>🍔 Lunch & Learn</h5>
			<ul>
				<li>
					Lunch & Learn: Writing Month Kickoff (Friday, November 4th, 1:30 PM
					ET)
				</li>
				<li>
					Lunch & Learn: Bite-Sized Computer Science Fundamentals: Number
					Representations (Friday, November 18th, 12:00 PM ET)
				</li>
				<li>
					Lunch & Learn: Implementing Feature Flags (Friday, November 25th,
					12:00 PM ET)
				</li>
			</ul>

			<p>
				Note: These are the currently scheduled times for these events at the
				time of this publication. Please check the official VC #announcements
				Slack channel, or other noted channels, for any updates and links to
				event rooms. For the full list of events, check out{' '}
				<Link to="/events">our events page</Link>.
			</p>

			<h3 className="mb-3 font-italic">Volunteering at VC</h3>
			<p>
				Over the last few months, we've been trying to improve our documentation
				and support here at VC. We're very excited to be opening up membership!
				All of our active volunteers have an invite to send out to someone
				interested in joining Virtual Coffee. If you're interested in joining
				the volunteer team, check out some the roles{' '}
				<Link to="/resources/virtual-coffee/get-involved/paths-to-leadership">
					here
				</Link>
				!
			</p>

			<hr />

			<h2>Member Highlights</h2>

			<h3>Podcast</h3>
			<p>
				<em>We're back with Season 6 of the podcast!</em>
			</p>
			<ul>
				<li>
					<Link to="/podcast/shelley-mchardy-junior-dev-life">
						Shelley McHardy — Junior Dev life
					</Link>
				</li>
				<li>
					<Link to="/podcast/season-six-finale-talking-hacktoberfest-with-bekah-dan-and-kirk">
						Season Six Finale — Talking Hacktoberfest with Bekah, Dan, and Kirk
					</Link>
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
					<a href="https://hashnode.iamdeveloper.com/repurposing-content-for-content-creation-3l4d">
						Repurposing Content for Content Creation — Nick Taylor
					</a>
				</li>
				<li>
					<a href="https://dev.to/chad_r_stewart/migrating-the-techishiring-twitter-bot-42fm">
						Migrating The TechIsHiring Twitter Bot — Chad R. Stewart
					</a>
				</li>
				<li>
					<a href="https://dev.to/jarvisscript/css-halloween-eyes-see-you-492c">
						CSS Halloween: Eyes See You. — Chris Jarvis
					</a>
				</li>
			</ul>

			<div className="card my-5 border-primary">
				<div className="card-body">
					<h5 className="card-title text-primary font-italic">Member Wins</h5>
					<div className="card-text">
						<blockquote className="blockquote">
							<p className="mb-0">
								"Just had my talk accepted to a second online conf!"
							</p>
							<footer className="blockquote-footer">Kai</footer>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">
								"Just gave a meetup talk and got complimented by someone on
								Open-sourced learning."
							</p>
							<footer className="blockquote-footer">Nerando</footer>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">
								"Did a sprint on my birthday to make a fun project and I made it
								with like a few minutes left!"
							</p>
							<footer className="blockquote-footer">Brett</footer>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">
								"My team was complimenting me during todays stand up."
							</p>
							<footer className="blockquote-footer">Brian</footer>
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
