import { Link } from '@remix-run/react';

export const handle = {
	meta: {
		title: 'Virtual Coffee Newsletter, August 2023',
		description: 'August is Heathy Habits at VC 💝',
	},
	date: '2023-08-01',
	listTitle: 'August 2023',
};

export const meta = () => {
	return handle.meta;
};

export default function Issue() {
	return (
		<>
			<h2>Hey friends!</h2>
			<p className="lead">
				July was all about public projects, but we're taking time in August to
				get our habits back on track!
			</p>

			<hr />

			<h2>💞 Kindness and Gratitude</h2>
			<p>
				<em>Spotlighting some of the kindness happening in our community.</em>
			</p>
			<blockquote className="blockquote">
				<p className="mb-0">
					"I'm also grateful to Joe, Jessica Wilkins, Meg, and Ramón for their
					advice on my conference talk a few weeks ago at a Tuesday VC chat."
				</p>
				<footer className="blockquote-footer">Brian</footer>
			</blockquote>
			<blockquote className="blockquote">
				<p className="mb-0">
					"I'm grateful for Ray for his time explaining API to me. And I'm
					grateful for VC."
				</p>
				<footer className="blockquote-footer">Ayu</footer>
			</blockquote>
			<blockquote className="blockquote">
				<p className="mb-0">"I'm so grateful to be a part of VC."</p>
				<footer className="blockquote-footer">Justin</footer>
			</blockquote>

			<hr />

			<h2 className="my-5">📆 What's happening at Virtual Coffee</h2>

			<h3 className="font-italic">July Recap</h3>
			<p>
				<strong>💡Monthly Theme & Challenge: Build in Public!</strong>
			</p>
			<p>
				Last month the community took on the challenge of sharing our unfinished
				works! As a community, we talked about our works in progress, the things
				we wanted to complete, the things that we were stuck on. We celebrated
				wins where we could, the power of incremental change. A special thank
				you to all the people who participated.
			</p>

			<h3 className="font-italic">August Happenings</h3>
			<p>
				<strong>💡Monthly Theme & Challenge: Healthy Habits!</strong>
			</p>
			<p>
				This challenge is all about doing some work on yourself, identifying the
				things that contribute to health, happiness, and forward progress in
				your life, and building back the habits that make them sustainable. It's
				been quite a year so far and we recognise that we can fall short of the
				good intentions we set for ourselves. We're tying to come together as a
				community and get to back to the fundamentals of good health, good
				habits, good attitudes, and gratitude. One of our members, the wonderful
				Jessica Wilkins wrote an amazing blog post called{' '}
				<a href="https://dev.to/virtualcoffee/join-virtual-coffee-in-the-healthy-habits-for-happy-devs-monthly-challenge-5b7h">
					Healthy Habits for Healthy Devs
				</a>{' '}
				to get us started! You can learn more{' '}
				<Link to="/monthlychallenges">here</Link>!
			</p>

			<h4 className="mt-4">🎙️Podcasts</h4>
			<p className="font-italic">Season 8 is out!</p>
			<ul>
				<li>
					<Link to="/podcast/reda-from-maritime-engineer-to-self-taught-front-end-developer">
						Reda — From Maritime Engineer to Self-Taught Front-End Developer
					</Link>
				</li>
				<li>
					<Link to="/podcast/josh-the-life-of-a-full-time-open-source-developer">
						Josh — The Life of a Full Time Open Source Developer
					</Link>
				</li>
				<li>
					<Link to="/podcast/taiwo-yusuf-the-importance-of-having-a-learning-mindset">
						Taiwo Yusuf — The Importance of Having a Learning Mindset
					</Link>
				</li>
			</ul>

			<h4 className="mt-4">☕🪑 Coffee Table Events</h4>
			<ul>
				<li>Tech Interview Study Group (Mondays at 4:00 PM ET)</li>
				<li>
					Accountabilibuddies (Tuesdays at 7:00 PM ET | Thursdays at 9:00 AM ET
					| Every other Sundays at 1:00 PM ET)
				</li>
				<li>The Pack Hunt (Tandem Job Hunting) (Wednesdays at 2:00 PM ET)</li>
				<li>Feelings Friday (Fridays at 10:00 AM ET)</li>
				<li>
					Frontend Friday Folks fighting CSSBattle.dev (Fridays at 11:00 AM ET)
				</li>
				<li>
					Savvy Saturday Stylers Slaying CSSBattle.dev (Saturdays at 12:00 PM
					ET)
				</li>
			</ul>

			<h4 className="mt-4">☕ Official Virtual Coffee Events</h4>
			<ul>
				<li>
					Virtual Coffee (Tuesdays at 9:00 AM ET | Thursdays at 12:00 PM ET)
				</li>
				<li>
					Async Twitter Chat (Fridays — prompts tweeted out at 9:00 AM ET)
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
				We're very excited to continue open membership with the support of our
				active volunteers! All our active volunteers have an invite to send out
				to someone interested in joining Virtual Coffee. If you're interested in
				joining the volunteer team, check out some the roles{' '}
				<Link to="/resources/virtual-coffee-handbook/get-involved/paths-to-leadership">
					here
				</Link>
				!
			</p>

			<hr />

			<h2>Member Content Highlights</h2>
			<p>
				<em>Some of our member contents we loved in July!</em>
			</p>
			<h3>Articles</h3>
			<ul>
				<li>
					<a href="https://dev.to/opensauced/devex-and-oss-elevating-developer-experience-through-open-source-collaboration-46j8">
						DevEx and OSS- Elevating Developer Experience through Open Source
						Collaboration — Bekah Hawrot Weigel
					</a>
				</li>
				<li>
					<a href="https://dev.to/adiatiayu/building-portfolio-with-nextjs-migrate-to-app-router-48ib">
						Building Portfolio with Next.js: Migrate to App Router — Ayu Adiati
					</a>
				</li>
				<li>
					<a href="https://jonathanyeong.com/adding-topics-in-astro/">
						Adding Topics (aka tags) in Astro — Jonathan Yeong
					</a>
				</li>
			</ul>
			<h3>Videos</h3>
			<ul>
				<li>
					<a href="https://www.youtube.com/watch?v=iXxNmjdqRUY&ab_channel=ThisDotMedia">
						From Idea to Design for Non-Designers with Abbey Perini | JS Drops
					</a>
				</li>
				<li>
					<a href="https://www.youtube.com/@techmesomethingcool">
						Tech Me Something Cool — Ray Deck
					</a>
				</li>
			</ul>

			<div className="card my-5 border-primary">
				<div className="card-body">
					<h5 className="card-title text-primary font-italic">Member Wins</h5>
					<div className="card-text">
						<blockquote className="blockquote">
							<p className="mb-0">
								"Closed a bunch of tickets on my own, half way done with a SQL
								class, studying LPI certification, and reconnected with past
								co-workers. My mentor, manager, and team think I’m doing great."
							</p>
							<footer className="blockquote-footer">Q</footer>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">
								"This win is from a week ago. My very first Hackathon turned out
								successful thanks to my team members. My team built FundRiser
								with Web3 technology and won 2 prizes. I was in charge of the
								front-end part. I made a React app with Tailwind on my own. It
								was also my first time using Tailwind, but the designs turned
								out really nice."
							</p>
							<footer className="blockquote-footer">Satoshi</footer>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">
								"A project I’ve been maintaining with a colleague has reached #1
								on Google."
							</p>
							<footer className="blockquote-footer">Christine</footer>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">"I've finished Harvard's CS50 yesterday!"</p>
							<footer className="blockquote-footer">Ariadne</footer>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">
								I just wrapped up a project at work and the business
								requirements weren't always easy to understand but we persevered
								and kept asking questions till we got it and were able to build
								out exactly what the client wanted.
							</p>
							<footer className="blockquote-footer">Jessica</footer>
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
					<a href="https://www.getrevue.co/profile/nickytonline/issues/yet-another-newsletter-lol-issue-31-1002343">
						Nick Taylor's newsletter
					</a>{' '}
					keeps you up to date with the hot topics in tech.
				</li>
				<li>
					Dominic Duffin co-hosts{' '}
					<a href="https://twitter.com/ArtTechChat">ArtTechChat on Twitter</a>{' '}
					every Sunday at 1:00 PM ET.
				</li>
				<li>
					Ray Deck is{' '}
					<a href="https://www.youtube.com/@techmesomethingcool">
						co-hosting a vid-pod about low code/no code solutions
					</a>{' '}
					on youtube!
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
					<a href="https://github.com/open-sauced/intro">
						Intro to Open Source
					</a>{' '}
					— an open source course to support new contributors to open source
				</li>
				<li>
					<a href="https://jesscss.github.io/">JESS CSS</a> — a CSS
					pre-processor that compiles to JavaScript!
				</li>
			</ul>
		</>
	);
}
