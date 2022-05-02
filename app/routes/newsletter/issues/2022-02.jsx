import { Link } from '@remix-run/react';

export const handle = {
	listTitle: 'February 2022',
	meta: {
		title: 'Virtual Coffee Newsletter, February 2022',
		description: 'Pairing Up and Lightning Talk Prep in VC',
	},
	date: '2022-02-01',
};

export const meta = () => {
	return handle.meta;
};

export default function Issue() {
	return (
		<>
			<h2>Hey friends!</h2>

			<p className="lead">
				January was all about getting back into the swing of things, and in
				February, we're going one step further, finding friends to pair up with
				and getting ready for lightning talks!
			</p>

			<hr />

			<h2>💞 Community Kindness</h2>
			<p>
				<em>Spotlighting some of the kindness happening in our community.</em>
			</p>
			<blockquote className="blockquote">
				<p className="mb-0">
					"This community has been so supportive this week and I am very
					grateful that I have so much support."
				</p>
				<footer className="blockquote-footer">Bekah</footer>
			</blockquote>
			<blockquote className="blockquote">
				<p className="mb-0">
					"I'm so grateful for this community. It is possible that I would have
					quit trying on several occasions over the last two years, including
					this week, if it weren't for all of you. Some of them have tagged me
					in a message or reached out to me in DMs with just one or two
					sentences expressing support. You have absolutely no idea what your
					simple gestures have meant to me. Thank you!"
				</p>
				<footer className="blockquote-footer">Andrea</footer>
			</blockquote>

			<hr />

			<h2 className="my-5">📆 What's happening at Virtual Coffee</h2>

			<h3 className="font-italic">January Recap</h3>
			<ul className="mb-5">
				<li>
					Monthly challenge -&gt;{' '}
					<a href="https://virtualcoffee.io/monthlychallenges/jan-2022/">
						All About Learning!
					</a>
					<p>
						We spent the month of January choosing new technologies to learn and
						explore, and partnering up with others to learn.
					</p>
				</li>
			</ul>

			<h3 className="mb-3 font-italic">February Happenings</h3>

			<h4 className="mt-4">
				💡 Monthly Theme &amp; Challenge:{' '}
				<a href="https://virtualcoffee.io/monthlychallenges/feb-2022/">
					Month of Pairing
				</a>
				!
			</h4>
			<p>
				Pairing is more than just coding with someone else. Pairing is about
				communication, teaching, learning, positive reinforcements, and growing.
			</p>

			<h4 className="mt-4">🥪 Lunch & Learns and Workshops</h4>
			<p>
				<em>These are members-only events that last for 45 - 90 minutes.</em>
			</p>
			<ul>
				<li>
					Feb 4, 12:00am EST:{' '}
					<a href="https://meetingplace.io/groups/virtual-coffee/events/8731">
						Lunch & Learn: Personal Finance Basics - Julia Seidman
					</a>
				</li>
			</ul>

			<p>
				** Link for the Lunch & Learns can be found in Slack about 15 minutes
				before the event and the descriptions can be found at{' '}
				<a href="https://virtualcoffee.io/events/">virtualcoffee.io/events</a>
			</p>

			<h4 className="mt-4">💡 Lightning Talks are back!</h4>
			<p>We're bringing back the lightning talks!!!</p>
			<p className="mb-0">Day/Time: TBA, likely end of March</p>
			<p className="mb-0">Details: 7-10 minutes on a tech-related topic</p>
			<p>How: Livestreamed to the VC community</p>

			<p>
				** Mentorship will be available. This is a great space to test out a new
				talk, work on speaking in front of an audience, sharing and supporting
				others. All speakers must be VC members. Everyone who submits is
				accepted! To submit your talk,{' '}
				<a href="https://airtable.com/shrgdNwpXvsRp5P3V">
					head over to our form
				</a>
				. We'll be accepting proposals through Friday, February 11th.
			</p>

			<h2>Member Blogpost Highlights</h2>
			<p>
				<em>
					Here's some of the awesome articles our members wrote to kick the year
					off!
				</em>
			</p>
			<ul>
				<li>
					{' '}
					<a href="https://harpcode.tech/my-journey-through-the-100-days-of-code-day-0-7">
						My journey through the 100 days of code! Day 0-7 - Andrew Harper
					</a>
				</li>
				<li>
					<a href="https://dev.to/virtualcoffee/so-you-want-to-get-started-in-community-1g0p">
						So You Want to Get Started in Community? - Bekah Hawrot Weigel
					</a>
				</li>
				<li>
					<a href="https://www.algolia.com/blog/engineering/build-a-react-app-with-fast-indexing-and-instant-inventory-updates/">
						Build a React app with fast indexing and instant inventory updates -
						Julia Seidman
					</a>
				</li>
			</ul>

			<div className="card my-5 border-primary">
				<div className="card-body">
					<h5 className="card-title text-primary font-italic">Member Wins</h5>
					<div className="card-text">
						<p>
							<em>
								As always, shout-out to all our members celebrating new roles
								this month!
							</em>
						</p>
						<blockquote className="blockquote">
							<p className="mb-0">
								"I have had my end of year review and my title has changed from
								Junior Full Stack Developer to Full Stack Developer, effective
								immediately."
							</p>
							<footer className="blockquote-footer">Dominic</footer>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">
								"Was awarded for RenderATL scholarship to go to their conference
								in June!!! This is going to be my first professional conference
								that I’m going to in person!!"
							</p>
							<footer className="blockquote-footer">Yolanda</footer>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">
								"Finished 6 talk ideas and submitted to KCDC!"
							</p>
							<footer className="blockquote-footer">Tom</footer>
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
					<a href="https://www.twitch.tv/iandouglas736">Ian</a>
				</li>
				<li>
					<a href="https://www.getrevue.co/profile/nickytonline/issues/yet-another-newsletter-lol-issue-31-1002343">
						Nick Taylor's newsletter
					</a>{' '}
					keeps you up to date with the hot topics in tech.
				</li>
				<li>
					Arthur Doler created{' '}
					<a href="https://www.youtube.com/watch?v=-XYK8ulQId0">
						an amazing talk about burnout
					</a>
					.
				</li>
			</ul>

			<h3>Open Source Projects</h3>
			<ul>
				<li>
					<a href="https://github.com/Virtual-Coffee/virtualcoffee.io/issues">
						VirtualCoffee.io
					</a>
					, an 11ty Web App for our community created by Dan Ott
				</li>
				<li>
					<a href="https://protege.dev/">Protege.dev</a>, a React Web App to
					help junior devs find remote jobs by Drew Clements
				</li>
				<li>
					<a href="https://github.com/drone/drone">DRONE</a> - a Continuous
					Delivery system built on container technology
				</li>
				<li>
					<a href="https://jesscss.github.io/">JESS CSS</a> - a CSS
					pre-processor that compiles to Javascript!
				</li>
			</ul>
		</>
	);
}
