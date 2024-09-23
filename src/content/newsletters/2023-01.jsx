import Link from 'next/link';

export const handle = {
	meta: {
		title: 'Virtual Coffee Newsletter, January 2023',
		description: "It's a New Year for Success! 💝",
	},
	date: '2023-01-01',
	listTitle: 'January 2023',
};

export default function Issue() {
	return (
		<>
			<h2>Hey friends!</h2>

			<p className="lead">
				December was great for doing some non-tech activities but we're back in
				the swing of things with a new year and new challenges!
			</p>

			<hr />

			<h2>💞 Kindness and Gratitude</h2>
			<p>
				<em>Spotlighting some of the kindness happening in our community.</em>
			</p>
			<blockquote className="blockquote">
				<p className="mb-0">
					"As the year grows and closes, I am always grateful for you all. I
					appreciate, learn from and have grown because of this community."
				</p>
				<footer className="blockquote-footer">Nerando</footer>
			</blockquote>
			<blockquote className="blockquote">
				<p className="mb-0">"I am grateful for Virtual Coffee."</p>
				<footer className="blockquote-footer">Jessica</footer>
			</blockquote>
			<blockquote className="blockquote">
				<p className="mb-0">
					"I'm grateful for people who constantly support me in my down times.
					And I'm always grateful for being part of VC family."
				</p>
				<footer className="blockquote-footer">Bekah</footer>
			</blockquote>

			<hr />

			<h2 className="my-5">📆 What's happening at Virtual Coffee</h2>

			<h3 className="font-italic">December Recap</h3>
			<p>
				Monthly challenge -&gt;{' '}
				<Link to="/monthlychallenges/dec-2022">
					Creative Community Challenge
				</Link>
				!
			</p>
			<p>
				Last month we wound down the year by indulging in our non-tech hobbies
				and interests, sharing them with our friends and community. Shout out to
				everyone who shared their music, arts, crafts, and outdoor activities.
				It was great to see more sides of our wonderful wonderful community.
			</p>

			<h3 className="mb-3 font-italic">
				January -&gt;{' '}
				<Link to="/monthlychallenges/jan-2023">Month of Learning</Link>!
			</h3>
			<p>
				During this month, we'll work on learning new dev-related things. You
				might deep-dive into one topic, start a small-group that focuses on
				community learning, focus on a new topic every week, or do a little bit
				of everything.
			</p>
			<p>
				If you're inspired by what you learn and want to share more, we
				encourage you to give a Lunch & Learn in February or get ready for our
				Lightning Talks in March!
			</p>
			<p>
				Our goal is to learn something new, share what we've learned, and gather
				recommendations and resources to share with the community. Check out the{' '}
				<Link to="/monthlychallenges/jan-2023">Virtual Coffee website</Link> for
				more details!
			</p>

			<h4 className="mt-4">☕🪑 Coffee Table Events</h4>
			<ul>
				<li>Tech Interview Study Group (Mondays at 4:00 PM ET)</li>
				<li>
					Accountabilibuddies (Tuesdays at 7:00 PM ET, Thursdays at 9:00 AM ET,
					and Sundays at 1:00 PM ET)
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
				<li>Async Twitter Chat (Friday, prompts tweeted out at 9:00 AM ET)</li>
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
				We're very excited to continue open membership with the support of our
				active volunteers! All our active volunteers have an invite to send out
				to someone interested in joining Virtual Coffee. If you're interested in
				joining the volunteer team, check out some the roles{' '}
				<Link to="/resources/virtual-coffee/get-involved/paths-to-leadership">
					here
				</Link>
				!
			</p>

			<hr />

			<h2>Member Highlights</h2>

			<h3>Blogposts</h3>
			<p>
				<em>Here's some of the awesome articles our members wrote!</em>
			</p>
			<ul>
				<li>
					<a href="https://brianmeeker.me/2022/12/31/2022-year-in-review/">
						2022 Year In Review — Brian Meeker
					</a>
				</li>
				<li>
					<a href="https://emmettnaughton.com/posts/a-year-in-review/">
						A year in review (2022) — Emmett Naughton
					</a>
				</li>
				<li>
					<a href="https://elpha.com/posts/7alkh53u/how-the-job-search-taught-me-to-be-kind-to-myself?utm_campaign=sl-guest-sarah-b&utm_medium=content&utm_source=collab">
						How the Job Search Taught Me to Be Kind to Myself — Sarah Bartley
					</a>
				</li>
				<li>
					<a href="https://dev.to/aurelieverrot/lets-talk-about-globalization-5c9k">
						Let's Talk About Globalization — Aurelie Verrot
					</a>
				</li>
				<li>
					<a href="https://dev.to/dominicduffin1/a-review-of-coding-with-chatgpt-a-simple-express-server-571l">
						A Review of Coding with ChatGPT: A Simple Express Server — Dominic
						Duffin
					</a>
				</li>
			</ul>

			<div className="card my-5 border-primary">
				<div className="card-body">
					<h5 className="card-title text-primary font-italic">Member Wins</h5>
					<div className="card-text">
						<blockquote className="blockquote">
							<p className="mb-0">
								"Dor Moshe put my CSS Ugly Sweater post in his CSS trends
								newsletter. Code newbies shared the post on Twitter."
							</p>
							<footer className="blockquote-footer">Chris</footer>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">"Pushed some code on my first day!"</p>
							<footer className="blockquote-footer">Alex</footer>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">"I finally finished Flexbox Zombies!"</p>
							<footer className="blockquote-footer">Kai</footer>
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
					<a href="https://www.twitch.tv/hobojohn6">Andrew Harper</a>,{' '}
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
					Newsletter alert!{' '}
					<a href="https://vic.substack.com/p/issue-1-code-as-gardening-the-rise">
						{' '}
						Code as Gardening: The Rise of AI — Vic Vijayakumar
					</a>
				</li>
				<li>
					<a href="https://www.getrevue.co/profile/luciacerchie">
						Lucia Cerchie's newsletter
					</a>{' '}
					is a breath of fresh air in the tech space.
				</li>
				<li>
					Dominic Duffin co-hosts{' '}
					<a href="https://twitter.com/ArtTechChat">ArtTechChat on Twitter</a>{' '}
					every Sunday at 1:00 PM ET.
				</li>
			</ul>

			<h3>Open Source Projects</h3>
			<ul>
				<li>
					<a href="https://github.com/Virtual-Coffee/virtualcoffee.io/issues">
						VirtualCoffee.io
					</a>{' '}
					— a Remix Web App for our community created by Dan Ott
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
					pre-processor that compiles to JavaScript!
				</li>
				<li>
					<a href="https://github.com/BekahHW/postpartum-wellness-app">
						Postpartum Wellness App
					</a>{' '}
					— a React Native App by Bekah HW
				</li>
			</ul>
		</>
	);
}
