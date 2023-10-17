import { Link } from '@remix-run/react';

export const handle = {
	meta: {
		title: 'Virtual Coffee Newsletter, October 2022',
		description: 'Hacktoberfest is here! 💝',
	},
	date: '2022-10-01',
	listTitle: 'October 2022',
};

export const meta = () => {
	return handle.meta;
};

export default function Issue() {
	return (
		<>
			<h2>Hey friends!</h2>

			<p className="lead">
				It's time to get our open source on! Hacktoberfest is HERE.
			</p>

			<hr />

			<h2>💞 Community Kindness</h2>
			<p>
				<em>Spotlighting some of the kindness happening in our community.</em>
			</p>
			<blockquote className="blockquote">
				<p className="mb-0">
					"Just wanted to say how much I love the folks here. All the good
					things in my life are better because of you all, either directly or
					indirectly. And this is where I've made the most friends in a long
					time."
				</p>
				<footer className="blockquote-footer">Kirk</footer>
			</blockquote>
			<blockquote className="blockquote">
				<p className="mb-0">
					"I love and appreciate you all and thank you for helping me as a
					person."
				</p>
				<footer className="blockquote-footer">Nerando</footer>
			</blockquote>

			<hr />

			<h2 className="my-5">📆 What's happening at Virtual Coffee</h2>

			<h3 className="font-italic">September Recap</h3>
			<p>
				Monthly challenge -&gt;{' '}
				<Link to="/monthlychallenges/sept-2022">Hacktoberfest Prep!</Link>
			</p>
			<p>
				We spent September getting ready for Hacktoberfest contributions. Some
				folks are going to be hosting their own projects as maintainers, and
				have been making their repos as accessible as possible. Others are
				getting ready for their first time contributions or gearing up for more
				work in their favourite projects. Some people just want to help, and
				signed up to be mentors and supporters for the OSS contributors.
			</p>

			<h3 className="mb-3 font-italic">
				October -{'>'} <Link to="/monthlychallenges/oct-2022">Hacktober</Link>!
			</h3>
			<p>
				<a href="https://hacktoberfest.virtualcoffee.io/">
					Virtual Coffee is tackling Hacktoberfest 2022
				</a>{' '}
				at full force and we want our Virtual Coffee members to join us!
			</p>
			<p>
				Hacktoberfest is a month-long virtual event that encourages and supports
				open-source contributions. Open Source Software (OSS) is code that the
				public can view, contribute to, and use. Sponsored by{' '}
				<a href="https://hacktoberfest.com/">Digital Ocean</a>, a contributor
				can qualify for the official Hacktoberfest swag by registering and
				making four pull requests (PRs) between October 1-31.
			</p>
			<p>
				Our plan is to harness the power in our community to help developers
				become excited about contributing to Open Source Software, and to
				contribute to some of our favourite Open Source repositories along the
				way.
			</p>
			<p>
				Because not everyone will need the same level or type of support, we're
				working to accommodate as many needs as possible. This could include 1:1
				mentorship, access to private Slack channels, a group coding session, a
				review of the project you're using for Hacktoberfest, or general
				community support. We're also here to cheer you on throughout the month,
				whether on social media, through our events, or Slack.
			</p>
			<p>
				Whether you want to be a contributor, a project maintainer, or a mentor,
				we have a place for you! You can sign up with Virtual Coffee's
				Hacktoberfest initiative{' '}
				<a href="https://hacktoberfest.virtualcoffee.io/">here</a>.
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
					Lunch & Learn: I Am Not The Product (Friday, October 21st, 12:00 PM
					ET)
				</li>
				<li>
					Lunch & Learn: Building A Custom React Renderer (Monday, October 24th,
					12:00 PM ET)
				</li>
				<li>
					Lunch & Learn: Deceptive Patterns (Friday, October 28th, 09:30 AM ET)
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
					<Link to="/podcast/chad-stewart-oss-and-techishiring">
						Chad Stewart — OSS and #TechisHiring
					</Link>
				</li>
				<li>
					<Link to="/podcast/julia-seidman-embracing-the-careen-over-the-career">
						Julia Seidman — Embracing the Careen Over the Career
					</Link>
				</li>
				<li>
					<Link to="/podcast/ryan-kahn-building-better-teams">
						Ryan Kahn — Building Better Teams
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
					<a href="https://brianmeeker.me/2022/09/27/flipping-tiles-with-angular-and-tailwind/">
						Flipping Tiles With Angular and Tailwind — Brian Meeker
					</a>
				</li>
				<li>
					<a href="https://dev.to/nickytonline/hacktoberfest-preptember-3p7">
						Hacktoberfest 2022: Preptember! — Nick Taylor
					</a>
				</li>
				<li>
					<a href="https://klescode.hashnode.dev/how-i-started-contributing-to-open-source">
						How I Started Contributing to Open Source — Klesta L
					</a>
				</li>
				<li>
					<a href="https://adiati.com/mini-portfolio-bring-your-github-profile-to-the-next-level">
						Mini Portfolio: Bring Your GitHub Profile To The Next Level — Ayu
						Adiati
					</a>
				</li>
			</ul>

			<div className="card my-5 border-primary">
				<div className="card-body">
					<h5 className="card-title text-primary font-italic">Member Wins</h5>
					<div className="card-text">
						<blockquote className="blockquote">
							<p className="mb-0">
								"Just merged my first PR at work, something I wrote, as a
								developer, for real life!"
							</p>
							<footer className="blockquote-footer">Shelley</footer>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">
								"Win: at the Atlanta Developers Conference yesterday I met
								somebody who had seen my talk about accessibility last year, he
								came up and said he came in knowing nothing about accessibility
								but has been using the resources from my slides all year at his
								job and is getting better all the time."
							</p>
							<footer className="blockquote-footer">Ryan</footer>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">"First PR made at my new job"</p>
							<footer className="blockquote-footer">Brian</footer>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">
								"WIN: I got featured in my local newspaper today."
							</p>
							<footer className="blockquote-footer">Ian</footer>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">
								Also, special mention to Ayu Adiati's amazing{' '}
								<a href="https://github.com/adiati98">new github profile</a>!
							</p>
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
