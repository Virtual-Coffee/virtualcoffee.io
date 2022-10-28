import type { MetaFunction } from '@remix-run/node';
import type { NewsletterHandle } from '~/types';

export const handle: NewsletterHandle = {
	meta: {
		title: 'Virtual Coffee Newsletter, May 2022',
		description:
			'Virtual Coffee is focusing on Community Kindness and the future in May 💝',
	},
	date: '2022-05-01',
	listTitle: 'May 2022',
};

export const meta: MetaFunction = () => {
	return handle.meta;
};

export default function Issue() {
	return (
		<>
			<h2>Hey friends!</h2>

			<p className="lead">
				It's time to support each other. After a month of job prep, it's time to
				touch base with some community work!
			</p>

			<hr />

			<h2>💞 Community Kindness</h2>
			<p>
				<em>Spotlighting some of the kindness happening in our community.</em>
			</p>
			<blockquote className="blockquote">
				<p className="mb-0">
					"The community made me feel very special this week!"
				</p>
				<footer className="blockquote-footer">Kirk</footer>
			</blockquote>
			<blockquote className="blockquote">
				<p className="mb-0">
					"Grateful for having family and community supporting my projects.
					Finally get a break in life to continue my education/professional
					development."
				</p>
				<footer className="blockquote-footer">SV</footer>
			</blockquote>
			<blockquote className="blockquote">
				<p className="mb-0">
					"This is truly the thing I value most about this community is that
					while we are all technical people, here together we are people first."
				</p>
				<footer className="blockquote-footer">David</footer>
			</blockquote>
			<blockquote className="blockquote">
				<p className="mb-0">
					"I freaking love this community!... Its welcoming, helpful, and fun."
				</p>
				<footer className="blockquote-footer">Daniel</footer>
			</blockquote>

			<hr />

			<h2 className="my-5">📆 What's happening at Virtual Coffee</h2>

			<h3 className="font-italic">April Recap</h3>
			<p>
				Monthly challenge -&gt;{' '}
				<a href="https://virtualcoffee.io/monthlychallenges/apr-2022">
					All About Job Prep!
				</a>
			</p>
			<p>
				We spent the month of April getting resume's reviewed and working on our
				portfolio sites. Teamwork makes the dream work, and sometimes it takes a
				whole community to get yourself in the right place for your next round
				of job searching.
			</p>

			<h3 className="mb-3 font-italic">Lightning talks! ⚡</h3>
			<p>
				We can an amazing lightning talk event last month and we want to express
				our gratitude to everyone involved; our brave speakers, but also our
				volunteers, and all the supportive viewers! You can view all the talks{' '}
				<a href="https://www.youtube.com/playlist?list=PLh9uT23TA65gwNgoeeZ21XWlxLOwxs3Ls">
					here
				</a>
				!
			</p>

			<h3 className="mb-3 font-italic">VC Phase Three Update</h3>
			<p>
				The team continues to work hard prepping for the next phase of Virtual
				Coffee. We have a lot of great things planned and we can't wait to open
				up membership again to an even better, more supportive, more inviting
				community. We are still so grateful to all of you on this journey with
				us and eagerly looking forward to opening up membership again!
			</p>

			<h3 className="mb-3 font-italic">Volunteering at VC</h3>
			<p>
				Over the last few months we've been trying to improve our documentation
				here at VC. he team continues to work hard prepping for the next phase
				of Virtual Coffee. We have a lot of great things planned and we can't
				wait to open up membership again to an even better, more supportive,
				more inviting community. We are still so grateful to all of you on this
				journey with us and eagerly looking forward to opening up membership
				again! If you're interested in joining the volunteer team, check out
				some the roles{' '}
				<a href="https://virtualcoffee.io/resources/virtual-coffee/get-involved/paths-to-leadership">
					here
				</a>
				!
			</p>

			<h3 className="mb-3 font-italic">May Happenings</h3>
			<h4 className="mt-4">
				💡 Monthly Theme &amp; Challenge:{' '}
				<a href="https://virtualcoffee.io/monthlychallenges/may-2022">
					Community Kindness: Let's connect
				</a>
				!
			</h4>
			<h5>Making connections, practicing gratitude, finding commonalities!</h5>
			<p>
				It's never too late to celebrate the community, and yourself in it. This
				month we're focusing especially on doing kind works in the community.
				Whether that means helping someone solve a coding problem, sharing your
				experiences, or just giving thanks for the support.
			</p>
			<p>
				The thing that makes us great isn't the languages we write or the code
				we ship, it's our personalities and how we use our precious time to
				share good moments with each other. So if you've been feeling a sense of
				disconnect, or worry, feel free to use the next few weeks to find joy
				through helping others.
			</p>
			<p>
				You can check out our{' '}
				<a href="https://virtualcoffee.io/monthlychallenges/may-2022">
					monthly challenge page
				</a>{' '}
				for more ideas on how to get started with our community kindness
				challenge.
			</p>

			<h4 className="mt-4">💡 Lunch and Learns</h4>
			<ul>
				<li>
					Asking Coding Questions with Bekah and Nick — Friday, May 27th, at
					12:00 PM ET
				</li>
			</ul>

			<h4 className="mt-4">☕🪑 Coffee Table Events</h4>
			<ul>
				<li>Tech Interview Study Group (Mondays at 4:00 PM ET)</li>
				<li>
					Job Seekers Coworking (Tuesdays at 7:00 PM ET and Fridays at 9:00 AM
					ET)
				</li>
				<li>React/JS Meetup (Wednesday, May 18th, at 1:00 PM ET)</li>
				<li>
					VC Toastmasters (Monday, May 9th, at 12:00 PM ET — see
					#content-creation)
				</li>
				<li>
					Indie-startup hackers (Wednesday, May 4th and May 18th, at 12:00 PM ET
					— see #indie-startup-hackers)
				</li>
			</ul>

			<p>
				Note: These are the currently scheduled times for these events at the
				time of this publication. Please check the official VC announcements
				Slack channel, or other noted channels, for any updates and links to
				event rooms.
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
					<a href="https://shift.infinite.red/welcome-back-to-in-person-conferences-37f0838b4be8">
						Welcome Back to In-Person Conferences — Gant Laborde
					</a>
				</li>
				<li>
					<a href="https://dev.to/jarvisscript/css-color-gradients-258n">
						CSS Color Gradients — Chris Jarvis
					</a>
				</li>
				<li>
					<a href="https://dev.to/cerchie/series/17618">
						A series on Tech Jargon — Lucia Cerchie
					</a>
				</li>
				<li>
					<a href="https://dev.to/alexcurtisslep/two-ways-to-get-noticed-in-the-tech-job-hunt-4k8">
						Two Ways to Get Noticed in the Tech Job Hunt — Alex Curtis-Slep
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
							<p className="mb-0 font-italic">
								And an extra special shout out to those who participated in our
								lightning talks!
							</p>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">"Completed my first week at my new job"</p>
							<footer className="blockquote-footer">Logan</footer>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">
								"I am super proud of myself building this Pomodoro Timer! Mainly
								from just my mind!"
							</p>
							<footer className="blockquote-footer">Andrew</footer>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">"Got my first PR merged at work today!"</p>
							<footer className="blockquote-footer">Nick</footer>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">
								"Win: Had my first online presentation and Lightning Talk"
							</p>
							<footer className="blockquote-footer">Emmanuel</footer>
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
