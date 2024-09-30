import Link from 'next/link';

export const handle = {
	meta: {
		title: 'Virtual Coffee Newsletter, February 2023',
		description: 'Get job ready! 💝',
	},
	date: '2023-02-01',
	listTitle: 'February 2023',
};

export default function Issue() {
	return (
		<>
			<h2>Hey VC family!</h2>

			<p className="lead">
				We started the new year by diving into new goals and projects, and with
				February, we think it's time to get our technical personas back on
				track, as well as share are newfound knowledge and insights!
			</p>

			<hr />

			<h2>💞 Kindness and Gratitude</h2>
			<p>
				<em>Spotlighting some of the kindness happening in our community.</em>
			</p>
			<blockquote className="blockquote">
				<p className="mb-0">
					"Just went looking for a gratitude channel to quickly shout out Meg
					for all the amazing and consistent support I see her providing just
					like, all the time, it’s fantastic."
				</p>
				<footer className="blockquote-footer">Mark</footer>
			</blockquote>
			<blockquote className="blockquote">
				<p className="mb-0">
					"I've really been enjoying the CSS Battles. Kudos to Jörn Bernhardt
					for running these. It's a nice break in my day."
				</p>
				<footer className="blockquote-footer">Nick</footer>
			</blockquote>
			<blockquote className="blockquote">
				<p className="mb-0">
					"I'm so grateful for the awesome room I was in during VC chat today.
					Y'all gave me so much good info and advice, and now I feel much better
					equipped and less panicky/frustrated about my next learning steps.
					Thank you!"
				</p>
				<footer className="blockquote-footer">Kai</footer>
			</blockquote>
			<blockquote className="blockquote">
				<p className="mb-0">
					"HUGE shoutout to Andrew Bush for doing a great job leading last
					month's monthly challenge!"
				</p>
				<footer className="blockquote-footer">VC Maintainers</footer>
			</blockquote>

			<hr />

			<h2 className="my-5">📆 What's happening at Virtual Coffee</h2>

			<h3 className="font-italic">January Recap</h3>
			<p>
				Monthly challenge -&gt;{' '}
				<Link href="/monthlychallenges/jan-2023">
					Month of Learning Challenge
				</Link>
				!
			</p>
			<p>
				The year began with renewed vigor in seeking out learning, hobbies, and
				projects. Virtual Coffee members shared their goals together and
				formulated strategies to make those goals achievable.
			</p>

			<h3 className="font-italic">
				February -&gt;{' '}
				<Link href="/monthlychallenges/feb-2023">Get Job Ready</Link>!
			</h3>
			<p>
				<strong>
					This challenge is sponsored by: Joe Masilotti, founder of{' '}
					<a href="https://railsdevs.com/">RailsDevs</a>, the reverse job board
					for Ruby on Rails developers.
				</strong>
			</p>
			<p>
				It is never a bad thing to keep your job packet updated, and we're going
				to challenge you to do it, whether or not you're actively applying to
				jobs.
			</p>
			<p>
				During this month, we'll work on creating, revising, or updating your
				job packet materials and that elevator pitch that might get you in the
				door. Each week, we'll work on a new piece, starting with the resume.
			</p>
			<p>
				We're focusing on creating job application materials. Whether you're
				actively looking, getting ready to look, or want to update your
				materials in case that dream job comes along, this is a great time to do
				it with the community and get feedback.
			</p>
			<p>
				We encourage you to post your ideas, questions, and fears in the
				#monthly-challenge channel in Slack. We're all learning and growing
				together!
			</p>
			<p>
				Each week, we'll do a Slack check-in to brainstorm, support, and learn
				from each other. Keep in mind that different experiences will have
				different approaches to the materials, but we can all provide positive
				feedback.
			</p>
			<p>
				Check out the{' '}
				<Link href="/monthlychallenges/feb-2023">Virtual Coffee website</Link>{' '}
				for more details!
			</p>

			<h4 className="mt-4">☕🪑 Coffee Table Events</h4>
			<ul>
				<li>Tech Interview Study Group (Mondays at 4:00 PM ET)</li>
				<li>
					Accountabilibuddies (Tuesdays at 7:00 PM ET, Thursdays at 9:00 AM ET,
					and every other Sundays at 1:00 PM ET)
				</li>
				<li>
					Indie-startup hackers (Every other Wednesday at 12:00 PM ET — see
					#indie-startup-hackers)
				</li>
				<li>
					Frontend Friday Folks fighting CSSBattle.dev (Fridays at 2:00 PM ET)
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
				<Link href="/events">our events page</Link>.
			</p>

			<h3 className="mb-3 font-italic">Volunteering at VC</h3>
			<p>
				We're very excited to continue open membership with the support of our
				active volunteers! All our active volunteers have an invite to send out
				to someone interested in joining Virtual Coffee. If you're interested in
				joining the volunteer team, check out some the roles{' '}
				<Link href="/resources/virtual-coffee/get-involved/paths-to-leadership">
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
					<a href="https://dev.to/virtualcoffee/assume-best-intent-is-not-the-best-approach-14c2">
						Assume Best Intent is not the Best Approach — Bekah Hawrot Weigel
					</a>
				</li>
				<li>
					<a href="https://taiwodevlab.hashnode.dev/defer-to-the-rescue-cld0l0rc7000008ky9dms1q70">
						Defer To The Rescue — Taiwo Yusuf
					</a>
				</li>
				<li>
					<a href="https://adiati.com/tips-from-a-shy-introvert-how-to-engage-and-get-more-involved-in-a-community">
						Tips From A Shy Introvert: How To Engage And Get More Involved In A
						Community — Ayu Adiati
					</a>
				</li>
				<li>
					<a href="https://temitayoogunsusi.hashnode.dev/how-to-build-a-design-system-in-nextjs-with-storybook-and-tailwind-css">
						How to build a Design System in Next.Js with Storybook and
						TailwindCSS — Temitayo Ogunsusi
					</a>
				</li>
				<li>
					<a href="https://emmettnaughton.com/posts/bet-on-me-in-2023/">
						Bet On Me In 2023 — Emmett Naughton
					</a>
				</li>
			</ul>

			<div className="card my-5 border-primary">
				<div className="card-body">
					<h5 className="card-title text-primary font-italic">Member Wins</h5>
					<div className="card-text">
						<blockquote className="blockquote">
							<p className="mb-0">
								"My POTA (Parks on the Air/ham radio) activities this weekend
								earned me the Bronze Hunter Award for making 10 unique contacts.
								I also made my first international contact in Ontario yesterday,
								which was pretty cool!"
							</p>
							<footer className="blockquote-footer">Rebecca</footer>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">
								"I got word this morning that my application for one of the
								Program Committee positions for RailsConf 2023 in Atlanta was
								accepted, and I'll be starting almost immediately on curating
								the talks for that (major) conference for the Ruby on Rails
								community!"
							</p>
							<footer className="blockquote-footer">Danielle</footer>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">
								"I've gotten 2 stars and 1 contributor to my MtgApp! Was not
								expecting that so that is exciting!"
							</p>
							<footer className="blockquote-footer">Andrew</footer>
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
					<a href="https://www.nickyt.co/news">Nick Taylor's newsletter</a>{' '}
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
