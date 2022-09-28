export const handle = {
	meta: {
		title: 'Virtual Coffee Newsletter, June 2022',
		description: 'Virtual Coffee is Giving Meaningful Feedback in June 💝',
	},
	date: '2022-06-01',
	listTitle: 'June 2022',
};

export const meta = () => {
	return handle.meta;
};

export default function Issue() {
	return (
		<>
			<h2>Hey friends!</h2>

			<p className="lead">
				It's time to support each other. After a month of community kindness,
				it's time to turn it up a notch with some quality feedback!
			</p>

			<hr />

			<h2>💞 Community Kindness</h2>
			<p>
				<em>Spotlighting some of the kindness happening in our community.</em>
			</p>
			<blockquote className="blockquote">
				<p className="mb-0">
					"I'm grateful for Bekah sharing Just JavaScript on Tuesday. I know it
					wasn't the perfect approach for you, but I'm LOVING the drawing steps
					and have had several mind-blowing breakthroughs in understanding."
				</p>
				<footer className="blockquote-footer">Shelley</footer>
			</blockquote>
			<blockquote className="blockquote">
				<p className="mb-0">
					"I am grateful for Tommy who always makes time to help me out when I
					need it and for checking in on me when I'm sick. He's a real G!"
				</p>
				<footer className="blockquote-footer">Raeshelle</footer>
			</blockquote>
			<blockquote className="blockquote">
				<p className="mb-0">
					"I'm grateful for Dan and all he quietly does for the community."
				</p>
				<footer className="blockquote-footer">Bekah</footer>
			</blockquote>
			<blockquote className="blockquote">
				<p className="mb-0">
					"Grateful for Jennifer who helped me get my current job (which I’ve
					been loving), told me about this Slack (which I’m loving) and is now
					helping me do more pushups than I ever thought I’d do in a day!"
				</p>
				<footer className="blockquote-footer">Camilo</footer>
			</blockquote>

			<hr />

			<h2 className="my-5">📆 What's happening at Virtual Coffee</h2>

			<h3 className="font-italic">May Recap</h3>
			<p>
				Monthly challenge -&gt;{' '}
				<a href="https://virtualcoffee.io/monthlychallenges/may-2022">
					All About Kindness!
				</a>
			</p>
			<p>
				We spent the month of May focusing on what really matters; our wonderful
				community members. It's good to tell the people who have supported you
				how much that means to you and it was amazing to hear all the wonderful
				acts of kindness being performed in this community every day!
			</p>

			<h3 className="mb-3 font-italic">Volunteering at VC</h3>
			<p>
				Over the last few months we've been trying to improve our documentation
				here at VC. The team continues to work hard prepping for the next phase
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

			<h3 className="mb-3 font-italic">June Happenings</h3>
			<h4 className="mt-4">
				💡 Monthly Theme &amp; Challenge:{' '}
				<a href="https://virtualcoffee.io/monthlychallenges/june-2022">
					Giving Meaningful and Empathetic Feedback
				</a>
				!
			</h4>
			<h5>
				We're challenging you to both give and accept feedback from others.
			</h5>
			<p>
				When we care about our community members, we can offer empathetic
				responses that are honest and allow them to grow and to fix a problem.
				Sometimes these conversations are hard. But sometimes we need hard
				conversations to help us grow. Let's approach each other with kindness
				and honesty, and allow this kind of feedback to be a regular part of our
				process.
			</p>
			<p>
				For this month's challenge we both need people asking for feedback and
				people giving feedback! If you need feedback on content or code, please
				post in the #monthly-challenge channel. It could be on a blog post, an
				idea, a coding project/PR, a talk, an interview, or whatever you could
				use feedback on.
			</p>
			<p>
				You can check out our{' '}
				<a href="https://virtualcoffee.io/monthlychallenges/june-2022">
					monthly challenge page
				</a>{' '}
				for more ideas on how to get started with our empathetic feedback
				challenge.
			</p>

			<h4 className="mt-4">☕🪑 Coffee Table Events</h4>
			<ul>
				<li>Tech Interview Study Group (Mondays at 4:00 PM ET)</li>
				<li>
					Job Seekers Coworking (Tuesdays at 7:00 PM ET and Thursdays at 9:00 AM
					ET)
				</li>
				<li>React/JS Meetup (Wednesday, June 1st and 15th, at 1:00 PM ET)</li>
				<li>
					VC Toastmasters (Monday, June 6th and 20th, at 12:00 PM ET — see
					#content-creation)
				</li>
				<li>
					Indie-startup hackers (Wednesday, June 1st, 15th, and 29th, at 12:00
					PM ET — see #indie-startup-hackers)
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
					<a href="https://dev.to/chad_r_stewart/a-front-end-engineers-journey-into-back-end-engineering-44e4">
						A Front-End Engineer’s Journey into Back-End Engineering — Chad
						Stewart
					</a>
				</li>
				<li>
					<a href="https://dev.to/nickytonline/my-eleventy-meetup-talk-3b2p">
						Automate syndication of your content with Eleventy, dev.to, and
						GitHub Actions — Nick Taylor
					</a>
				</li>
				<li>
					<a href="https://medium.com/@ianmugenya/what-does-it-even-mean-to-be-asynchronous-in-javascript-529807d30532">
						What does it even mean to be Asynchronous in JavaScript? — Ian
						Mugenya
					</a>
				</li>
				<li>
					<a href="https://dev.to/abbeyperini/web-development-accessibility-f8i">
						Web Development === Accessibility — Abbey Perini
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
								And shout out to all those who got to attend the Remixconf and
								RenderATL conferences together!
							</p>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">
								"Went to my very-first-ever in-person meetup and made some
								contacts today, am now slated to give my very-first-ever
								in-person talk in 2 weeks!"
							</p>
							<footer className="blockquote-footer">Lucia</footer>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">"I was on the CodeNewbie podcast"</p>
							<footer className="blockquote-footer">Jessica</footer>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">
								"What I fully intend to be my final book is finally in print."
							</p>
							<footer className="blockquote-footer">Brian</footer>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">"Today marks 30 days at my new job!"</p>
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
