import { Link } from '@remix-run/react';

export const handle = {
	meta: {
		title: 'Virtual Coffee Newsletter, July 2023',
		description: 'Build in Public 💝',
	},
	date: '2023-07-01',
	listTitle: 'July 2023',
};

export const meta = () => {
	return handle.meta;
};

export default function Issue() {
	return (
		<>
			<h2>Hey friends!</h2>
			<p className="lead">
				June was all about reflection and learnings, but we're back in action in
				July, sharing our work with the community around us!
			</p>

			<hr />

			<h2>💞 Kindness and Gratitude</h2>
			<p>
				<em>Spotlighting some of the kindness happening in our community.</em>
			</p>
			<blockquote className="blockquote">
				<p className="mb-0">
					"I'm grateful for my VC family and all communities that have been
					supporting me to grow."
				</p>
				<footer className="blockquote-footer">Ayu</footer>
			</blockquote>
			<blockquote className="blockquote">
				<p className="mb-0">
					"I am grateful for the gorgeous mild high 70s weather my area of the
					world is experiencing right now. I am also grateful to have joined
					this VC community this week!"
				</p>
				<footer className="blockquote-footer">Cassie</footer>
			</blockquote>
			<blockquote className="blockquote">
				<p className="mb-0">
					"I’m grateful for having a job I enjoy, all my VC friends who have
					been so supportive, and my family."
				</p>
				<footer className="blockquote-footer">Bekah</footer>
			</blockquote>

			<hr />

			<h2 className="my-5">📆 What's happening at Virtual Coffee</h2>

			<h3 className="font-italic">June Recap</h3>
			<p>
				<strong>💡Monthly Theme & Challenge: Reflection!</strong>
			</p>
			<p>
				Last month the community took some time to reflect, recuperate and
				recenter ourselves for the rest of the year. We took stock of our
				achievements for the year, identified spaces where we could improve, and
				figured out the necessary steps for further growth. Most importantly, we
				sought feedback and support from each other while doing so.
			</p>

			<h3 className="font-italic">July Happenings</h3>
			<p>
				<strong>💡Monthly Theme & Challenge: Build in Public!</strong>
			</p>
			<p>
				Build in Public! This challenge is all about sharing your efforts as you
				make progress! This is the month for revealing the things you're
				actively working on as you build them up. Anyone can showcase a final
				product but there's real vulnerability in showing yourself in the weeds,
				doing the hard parts. Writing, streaming, Github links, review sessions,
				do what you can to get your work out there. If you don't want to go full
				public eye, you can always just stick to your handy dandy VC crew of
				compatriots. Don't be scared to share! We always appreciate each other's
				endeavours. You can learn more <Link to="/monthlychallenges">here</Link>
				!
			</p>

			<h4 className="mt-4">🍔 Lunch & Learn</h4>
			<ul>
				<li>
					Creating a Feedback Culture: The Key to Personal and Professional
					Growth with Bekah Hawrot Weigel (Wednesday, July 12 at 12:00 PM ET)
				</li>
			</ul>

			<h4 className="mt-4">🎙️Podcasts</h4>
			<p className="font-italic">Season 8 is out!</p>
			<ul>
				<li>
					<Link to="/podcast/caitlin-floyd">Caitlin Floyd — Mentorship</Link>
				</li>
				<li>
					<Link to="/podcast/carmen-tech-industry-friendships-leveraging-connections-for-growth-challenges-and-opportunities-and-devops">
						Carmen — Tech Industry Friendships: Leveraging Connections for
						Growth, Challenges, and Opportunities and DevOps!
					</Link>
				</li>
				<li>
					<Link to="/podcast/alex-curtis-slep-enriching-your-life-as-a-developer">
						Alex Curtis-Slep — Enriching Your Life as a Developer
					</Link>
				</li>
				<li>
					<Link to="/podcast/vc-maintainers-importance-of-culture-citizenship">
						VC Maintainers — Importance of Culture Citizenship
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
				<li>
					Indie-startup hackers (Every other Wednesday at 12:00 PM ET — see
					#indie-startup-hackers)
				</li>
				<li>The Pack Hunt (Tandem Job Hunting) (Wednesdays at 2:00 PM ET)</li>
				<li>Feelings Friday (Fridays at 10:00 AM ET)</li>
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
				<em>Some of our member contents we loved in June!</em>
			</p>
			<h3>Articles</h3>
			<ul>
				<li>
					<a href="https://dev.to/abbeyperini/live-regions-in-react-4dmd">
						Live Regions in React — Abbey Perini
					</a>
				</li>
				<li>
					<a href="https://dev.to/scaleway/cool-things-for-a-hot-open-source-summer-scaleway-community-newsletter-june-2023-21b">
						🧊 Cool things for a hot open-source summer! — Kai Katschthaler
					</a>
				</li>
			</ul>
			<h3>Videos</h3>
			<ul>
				<li>
					<a href="https://www.youtube.com/watch?v=d_Sh7d5QKbQ">
						Write Code faster with ChatGPT — Nick Taylor and Matt McInnis
					</a>
				</li>
			</ul>

			<div className="card my-5 border-primary">
				<div className="card-body">
					<h5 className="card-title text-primary font-italic">Member Wins</h5>
					<div className="card-text">
						<blockquote className="blockquote">
							<p className="mb-0">
								"I've recently started a new full-time role! I am the new
								Communications Manager at Amateur Radio Digital Communications
								(ARDC)."
							</p>
							<footer className="blockquote-footer">Rebecca</footer>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">
								"Had the best stream ever in terms of engagement today! Feels
								good."
							</p>
							<footer className="blockquote-footer">Nick</footer>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">
								"Successfully hosted a 3½hr teams call with presentations from 8
								different teams, 50+ attendees and 2 guest speakers and it ran
								to time with 10 minutes to spare."
							</p>
							<footer className="blockquote-footer">Andy</footer>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">
								"WIN: Attending my first conference this week!"
							</p>
							<footer className="blockquote-footer">Chuck</footer>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">
								Yayyy I was promoted to staff developer today!
							</p>
							<footer className="blockquote-footer">Jono</footer>
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
