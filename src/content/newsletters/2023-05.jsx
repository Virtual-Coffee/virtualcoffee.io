import { Link } from '@remix-run/react';

export const handle = {
	meta: {
		title: 'Virtual Coffee Newsletter, May 2023',
		description: 'Pair Programming in May 💝',
	},
	date: '2023-05-01',
	listTitle: 'May 2023',
};

export const meta = () => {
	return handle.meta;
};

export default function Issue() {
	return (
		<>
			<h2>Hey friends!</h2>
			<p className="lead">
				April was all about sharing the love and May is all about sharing the
				cursor! We're gonna be pair programming at VC this month!
			</p>

			<hr />

			<h2>💞 Kindness and Gratitude</h2>
			<p>
				<em>Spotlighting some of the kindness happening in our community.</em>
			</p>
			<blockquote className="blockquote">
				<p className="mb-0">
					"As a new member here its obvious! I am grateful for this community
					and the welcoming spirit of all!"
				</p>
				<footer className="blockquote-footer">Matthew</footer>
			</blockquote>
			<blockquote className="blockquote">
				<p className="mb-0">
					"Grateful for this community; sometimes looking forward to our chats
					gets me through the week."
				</p>
				<footer className="blockquote-footer">Kai</footer>
			</blockquote>
			<blockquote className="blockquote">
				<p className="mb-0">
					"I am immensely grateful to the VC maintainers who work tirelessly to
					ensure its smooth functioning."
				</p>
				<footer className="blockquote-footer">Justin</footer>
			</blockquote>
			<blockquote className="blockquote">
				<p className="mb-0">
					"I'm grateful for Virtual Coffee and the opportunity to give a lunch
					and learn to my friends this morning."
				</p>
				<footer className="blockquote-footer">Jessica</footer>
			</blockquote>

			<hr />

			<h2 className="my-5">📆 What's happening at Virtual Coffee</h2>

			<h3 className="font-italic">April Recap</h3>
			<p>
				<strong>💡Monthly Theme & Challenge</strong>: Gratitude!
			</p>
			<p>
				Last month we really tried to spread the love around, acknowledging all
				the wonderful people who make this space great! Sometimes we need to
				remember that the most healing and restorative thing you do for yourself
				is to share gratitude and support to the people around you! Thank you to
				all the members who reached out to others and brought more positivity to
				the space!
			</p>

			<h3 className="font-italic">May Happenings</h3>
			<p>
				<strong>💡Monthly Theme & Challenge</strong>: Month of Pairing!
			</p>
			<p>
				This month we are{' '}
				<a href="https://dev.to/virtualcoffee/the-power-of-pair-programming-benefits-types-and-tips-1h4c">
					Pair Programming
				</a>
				! That means we are teaming up with each other all month to write code
				together. Zoom tuple, Skype, whatever you'd like. Pair programming is a
				great way to learn from each other and solve problems and we're taking
				it one step further by seeing if we can get as many pairings as possible
				as community!
			</p>
			<p>
				For this challenge, members are challenged to hit 5 pairing sessions per
				person. Some ways to get started pairing are on an open-source issue, a
				LeetCode problem, or a project they need help on.
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
				<li>The Pack Hunt (Tandem Job Hunting) (Wednesdays at 2:00 PM ET)</li>
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

			<h2>Member Blogpost Highlights</h2>
			<p>
				<em>Some of our member posts we loved in April!</em>
			</p>
			<ul>
				<li>
					<a href="https://dev.to/opensauced/managing-community-health-files-and-templates-with-a-github-repository-l8f">
						Managing Community Health Files and Templates with a GitHub
						Repository — Bekah Hawrot Weigel
					</a>
				</li>
				<li>
					<a href="https://www.tigrisdata.com/blog/astro-tigris-integration/">
						Creating database-driven Astro sites with the Tigris Astro
						integration — Michael Jolley
					</a>
				</li>
				<li>
					<a href="https://dev.to/abbeyperini/dark-mode-toggle-and-prefers-color-scheme-4f3m">
						Dark-Mode Toggle and Prefers Color Scheme — Abbey Perini
					</a>
				</li>
				<li>
					<a href="https://ramonh.dev/2023/04/20/objective-c-versatility/">
						How Objective-C Made Me a Versatile Software Engineer — Ramón
						Huidobro
					</a>
				</li>
			</ul>

			<div className="card my-5 border-primary">
				<div className="card-body">
					<h5 className="card-title text-primary font-italic">Member Wins</h5>
					<div className="card-text">
						<blockquote className="blockquote">
							<p className="mb-0">
								"Decided to try and make a new personal website this morning and
								succeeded!"
							</p>
							<footer className="blockquote-footer">Mark</footer>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">
								"I just got invited to my first ever software dev job
								interview!!!"
							</p>
							<footer className="blockquote-footer">Sōme</footer>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">"I gave my first conference talk!"</p>
							<footer className="blockquote-footer">Nick</footer>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">
								"I start my new job as Developer Experience Lead"
							</p>
							<footer className="blockquote-footer">Bekah</footer>
						</blockquote>
					</div>
				</div>
			</div>

			<h2>What our members are up to</h2>
			<ul>
				<li>
					Chris J. does a{' '}
					<a href="https://dev.to/jarvisscript/what-are-your-goals-for-the-week-3kc0">
						weekly post for goals of the week.
					</a>
				</li>
				<li>
					Ayu shared her journey into tech and the Power of Communities on the{' '}
					<a href="https://open.spotify.com/episode/6YazPGDQp6vYh8SXy4m1Pn?si=gGURPxOHRN-AX2F7vlX1QA&nd=1">
						Women Who Code podcast
					</a>
					.
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
					.
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
