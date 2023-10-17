import { Link } from '@remix-run/react';

export const handle = {
	meta: {
		title: 'Virtual Coffee Newsletter, June 2023',
		description: 'Mid-Year Check-In 💝',
	},
	date: '2023-06-01',
	listTitle: 'June 2023',
};

export const meta = () => {
	return handle.meta;
};

export default function Issue() {
	return (
		<>
			<h2>Hey friends!</h2>
			<p className="lead">
				May was all about pair programming and achieving the dream together. Now
				it's time to do a mid-year check in and do some reflection.
			</p>

			<hr />

			<h2>💞 Kindness and Gratitude</h2>
			<p>
				<em>Spotlighting some of the kindness happening in our community.</em>
			</p>
			<blockquote className="blockquote">
				<p className="mb-0">
					"I'm grateful for meeting David at co-working room this morning."
				</p>
				<footer className="blockquote-footer">Ayu</footer>
			</blockquote>
			<blockquote className="blockquote">
				<p className="mb-0">
					"I’m grateful for Dominic taking care of the Twitter chats each week."
				</p>
				<footer className="blockquote-footer">Bekah</footer>
			</blockquote>
			<blockquote className="blockquote">
				<p className="mb-0">
					"Thank you for having me, I learned a LOT, from each and everyone of
					you, whole lot of food for thoughts. I’m incredibly grateful :)"
				</p>
				<footer className="blockquote-footer">Piotrek</footer>
			</blockquote>

			<hr />

			<h2 className="my-5">📆 What's happening at Virtual Coffee</h2>

			<h3 className="font-italic">May Recap</h3>
			<p>
				<strong>💡Monthly Theme & Challenge</strong>: Pairing!
			</p>
			<p>
				Last month the community was all about{' '}
				<a href="https://dev.to/virtualcoffee/the-power-of-pair-programming-benefits-types-and-tips-1h4c">
					Pair Programming
				</a>
				! We came together to collaborate on each other's projects, share ideas
				and tips, and just celebrate the collaborative aspects of coding.
				Together as a community, we got over 30 pairing sessions for the month
				of May. Thank you to everyone who participated.
			</p>

			<h3 className="font-italic">June Happenings</h3>
			<p>
				<strong>💡Monthly Theme & Challenge</strong>: Reflect. Reevaluate. Grow.
			</p>
			<p>
				The <Link to="/monthlychallenges">Mid-Year Check-In challenge</Link> is
				designed to provide an opportunity for Virtual Coffee members to reflect
				on their progress, reevaluate goals, and gain clarity on their journey.
				Let’s pause, assess, and adjust as we reach the halfway point of the
				year. This challenge aims to encourage personal growth, foster
				connection within the community, and provide a supportive space for
				members to share their insights, challenges, and successes.
			</p>
			<p>
				For this challenge, members are challenged to share insights and support
				each other as we reflect on our journeys.
			</p>

			<h4 className="mt-4">☕🪑 Coffee Table Events</h4>
			<ul>
				<li>Tech Interview Study Group (Mondays at 4:00 PM ET)</li>
				<li>
					Accountabilibuddies (Tuesdays at 7:00 PM ET | Thursdays at 9:00 AM ET
					| Every other Sundays at 1:00 PM ET)
				</li>
				<li>
					Indie-startup hackers (Every other Wednesday at 12:00 PM ET — see
					#indie-startup-hackers)
				</li>
				<li>The Pack Hunt (Tandem Job Hunting) (Wednesdays at 2:00 PM ET)</li>
				<li>
					Frontend Friday Folks fighting CSSBattle.dev (Fridays at 11:00 AM ET |
					Saturdays at 12:00 PM ET)
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
				<Link to="/resources/virtual-coffee/get-involved/paths-to-leadership">
					here
				</Link>
				!
			</p>

			<hr />

			<h2>Member Content Highlights</h2>
			<p>
				<em>Some of our member contents we loved in May!</em>
			</p>
			<h3>Articles</h3>
			<ul>
				<li>
					<a href="https://dev.to/nerajno/so-this-is-your-1st-tech-conference-volunteeredition-450c">
						So ... This is Your 1st Tech Conference : #VolunteerEdition —
						Nerando Johnson
					</a>
				</li>
			</ul>
			<h3>Videos</h3>
			<ul>
				<li>
					<a href="https://www.youtube.com/watch?v=DAYQZ4vIjSw">
						How to model NoSQL one-to-one relationships — Michael Jolley
					</a>
				</li>
				<li>
					<a href="https://www.youtube.com/watch?v=k0ke-2nYz0M">
						Build a Full Stack E-commerce website in React — Om
					</a>
				</li>
			</ul>

			<div className="card my-5 border-primary">
				<div className="card-body">
					<h5 className="card-title text-primary font-italic">Member Wins</h5>
					<div className="card-text">
						<blockquote className="blockquote">
							<p className="mb-0">
								"I've accepted a place sponsored by Code First Girls on their
								Product Management course!"
							</p>
							<footer className="blockquote-footer">Shan</footer>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">
								"I created a dictionary app using React! This simple project
								taught me a lot about the fundamentals of React!!!"
							</p>
							<footer className="blockquote-footer">Imani</footer>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">
								"My talk submission for DevRelCon in London got accepted!!"
							</p>
							<footer className="blockquote-footer">Kai</footer>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">
								"Very Excited! Just completed the Tableau component of a project
								I've been working on for a few months. The only thing left to do
								now is to finish organizing the readme and github!"
							</p>
							<footer className="blockquote-footer">Justin</footer>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">
								Dan Ott had his first PR to the React codebase merged in!
							</p>
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
