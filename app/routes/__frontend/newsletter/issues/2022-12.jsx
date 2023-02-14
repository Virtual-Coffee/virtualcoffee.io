import { Link } from '@remix-run/react';

export const handle = {
	meta: {
		title: 'Virtual Coffee Newsletter, December 2022',
		description: 'Creative Communities in December! 💝',
	},
	date: '2022-12-01',
	listTitle: 'December 2022',
};

export const meta = () => {
	return handle.meta;
};

export default function Issue() {
	return (
		<>
			<h2>Hey friends!</h2>

			<p className="lead">
				<Link to="/monthlychallenges/nov-2022">NaNoWriMo</Link> was a blast and
				the community did so so much but now it's time to focus in on the
				activities we do <strong>Just For Us</strong> with Community Creativity!
			</p>

			<hr />

			<h2>💞 Kindness and Gratitude</h2>
			<p>
				<em>Spotlighting some of the kindness happening in our community.</em>
			</p>
			<blockquote className="blockquote">
				<p className="mb-0">
					"Friday is gratitude day at @VirtualCoffeeIO & I'm always grateful to
					be part of the family."
				</p>
				<footer className="blockquote-footer">Ayu</footer>
			</blockquote>
			<blockquote className="blockquote">
				<p className="mb-0">
					"I am grateful to Tom hopping into the #co-working-room and helping
					prompt a new line of investigation that led me to discover an edge
					case in AWS routing that had been causing a bug for several weeks."
				</p>
				<footer className="blockquote-footer">David</footer>
			</blockquote>
			<blockquote className="blockquote">
				<p className="mb-0">
					"I’m grateful for the carrot to my stick, Raynald, for once again
					leading a Thursday Accountabilibuddies session when I had a conflict."
				</p>
				<footer className="blockquote-footer">Meg</footer>
			</blockquote>

			<hr />

			<h2 className="my-5">📆 What's happening at Virtual Coffee</h2>

			<h3 className="font-italic">November Recap</h3>
			<p>
				Monthly challenge -&gt;{' '}
				<Link to="/monthlychallenges/nov-2022">NaNoWriMo</Link>!
			</p>
			<p>
				Last month we hit <strong>106,978 words</strong> during our writing
				challenge as part of NaNoWriMo. Thank you and congratulations to
				everyone who participated and a special shoutout to this year's top
				writer, <a href="https://twitter.com/AbbeyPerini">Abbey Perini</a>! You
				can see the details of the challenge and all those who helped on the{' '}
				<Link to="/monthlychallenges/nov-2022">Virtual Coffee website</Link>.
			</p>

			<h3 className="mb-3 font-italic">
				December -&gt;{' '}
				<Link to="/monthlychallenges/dec-2022">
					Creative Community Challenge!
				</Link>
				!
			</h3>
			<p>
				Devs are more than just the code we write. This month is all about
				embracing self-expression. Give back to yourself by indulging in
				something just for fun. Share the art, music, poetry, sports, games, or
				any other hobbies that spark joy for you. We spend so much time grinding
				away on understanding things in the tech space.Let's make some space for
				the other parts of ourselves.
			</p>
			<p>
				We're encouraging folks to spend time this month working on things that
				aren't necessarily code specific, or using code to improve other hobbies
				and outlets. Let the rest of VC know what you've got going on. You don't
				have to share your work, but we'd love to see and celebrate your
				achievements. It can also be a great time to explore new hobbies and
				activities. If someone is doing something you're interested in, this is
				the month to learn more and maybe give it a try. Check out the{' '}
				<Link to="/monthlychallenges/dec-2022">Virtual Coffee website</Link> for
				more details!
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

			<h3>Blogposts</h3>
			<p>
				<em>
					Here's some of the awesome articles our members wrote last month!
				</em>
			</p>
			<ul>
				<li>
					<a href="https://dev.to/adiatiayu/what-makes-you-stay-in-a-community-4go">
						What Makes You Stay In A Community? — Ayu Adiati
					</a>
				</li>
				<li>
					<a href="https://dev.to/codergirl1991/beginner-javascript-tutorial-how-to-build-your-own-mad-libs-game-4hf8">
						Beginner JavaScript Tutorial: How to build your own Mad Libs game —
						Jessica Wilkins
					</a>
				</li>
				<li>
					<a href="https://dev.to/bekahhw/speech-racer-my-first-hackathon-project-2ona">
						Speech Racer: My first hackathon project — Bekah HW
					</a>
				</li>
			</ul>

			<div className="card my-5 border-primary">
				<div className="card-body">
					<h5 className="card-title text-primary font-italic">Member Wins</h5>
					<div className="card-text">
						<blockquote className="blockquote">
							<p className="mb-0">
								"The startup I work for onboarded our first users today!"
							</p>
							<footer className="blockquote-footer">Cameron</footer>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">"Gave my talk at Pyjamas Conf today!"</p>
							<footer className="blockquote-footer">Kai</footer>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">
								"WIN: The article I wrote last night got picked up by an
								Obsidian newsletter."
							</p>
							<footer className="blockquote-footer">Brian</footer>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">
								"Surpassed 150,000 total post views and 3,000 followers on DEV
								with my series for the monthly challenge."
							</p>
							<footer className="blockquote-footer">Abbey</footer>
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
