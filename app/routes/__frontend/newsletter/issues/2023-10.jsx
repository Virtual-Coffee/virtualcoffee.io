import { Link } from '@remix-run/react';
import LeadText from '~/components/content/LeadText';

export const handle = {
	meta: {
		title: 'Virtual Coffee Newsletter, October 2023',
		description: 'Hacktoberfest is finally here! 👻',
	},
	date: '2023-10-01',
	listTitle: 'October 2023',
};

export const meta = () => {
	return handle.meta;
};

export default function Issue() {
	return (
		<>
			<h2>Hey, fellow Open Source Contributors!</h2>
			<LeadText>
				<p>
					September was Preptember, getting ready for our open source efforts
					but now it's finally here. It's HACKTOBERFEST!
				</p>
			</LeadText>

			<hr />

			<h2>💞 Kindness and Gratitude</h2>
			<p>
				<em>Spotlighting some of the kindness happening in our community.</em>
			</p>
			<blockquote className="blockquote">
				<p className="mb-0">
					"Folks in this community and the node.js community have been very
					helpful to me and I just... yeah. Super appreciate it."
				</p>
				<footer className="blockquote-footer">Frank</footer>
			</blockquote>
			<blockquote className="blockquote">
				<p className="mb-0">
					"I'm grateful for Virtual Coffee's Preptember kickoff. I forgot about
					it this year, and I'm really impressed by all of the amazing
					documentation that Virtual Coffee has put together."
				</p>
				<footer className="blockquote-footer">Ross</footer>
			</blockquote>
			<blockquote className="blockquote">
				<p className="mb-0">
					"I'm grateful for Dominic for our collaboration times and for having
					my back."
				</p>
				<footer className="blockquote-footer">Ayu</footer>
			</blockquote>

			<hr />

			<h2 className="my-5">📆 What's happening at Virtual Coffee</h2>
			<h3>September Recap</h3>
			<p>
				<strong>💡Monthly Theme & Challenge: Preptember!</strong>
			</p>
			<p>
				We spent the whole month getting ready for{' '}
				<a href="https://hacktoberfest.com/">Hacktoberfest</a>. Our monthly
				challenge team put together a whole slew of resources, talks, and
				prompts to help folks get started.
			</p>

			<h3 className="mt-4">Hacktoberfest is HERE</h3>
			<p>
				<strong>
					💡Monthly Theme & Challenge: Hacktoberfest and Open Source!
				</strong>
			</p>
			<p>
				The{' '}
				<a href="https://hacktoberfest.virtualcoffee.io/">
					Virtual Coffee Hacktoberfest Initiative
				</a>{' '}
				is live and we're ready to rumble! We're kicking of on October 2nd, and
				looking forward to seeing how the community works together. As always,
				we're super proud of our mentors, maintainers, and contributors for
				choosing to participate.
			</p>
			<div className="card my-3 border-primary">
				<div className="card-body">
					<LeadText>
						<p>
							Shoutout to two of our volunteers, Dominic Duffin and Ayu Adiati,
							for their amazing work getting the community ready for the season!
						</p>
					</LeadText>
				</div>
			</div>

			<h3 className="mt-4">🎙️Podcasts</h3>
			<p className="font-italic">Season 9 is out!</p>
			<ul>
				<li>
					<Link to="/podcast/ayu-dominic-hacktoberfest-is-coming-preptember-is-here">
						Ayu & Dominic — Hacktoberfest is Coming, Preptember is Here!
					</Link>
				</li>
				<li>
					<Link to="/podcast/working-in-public-the-making-and-maintenance-of-open-source-software-book-review">
						OSS Book Review: Nadia Eghbal's Working in Public — The Making and
						Maintenance of Open Source Software
					</Link>
				</li>
			</ul>

			<h3 className="mt-4">☕🪑 Coffee Table Events</h3>
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

			<h3 className="mt-4">📅 Weekly Async Events</h3>
			<ul>
				<li>
					Mondays: Goal-setting post in <code>#goals-and-wins</code>
				</li>
				<li>
					Tuesdays: Trivia in <code>#game-night</code>
				</li>
				<li>
					Wednesdays: Midweek check-in in <code>#general</code>
				</li>
				<li>
					Thursdays: New book club questions for Cracking the Coding Interview
					on GitHub in <code>#book-club</code>
				</li>
				<li>
					Fridays:{' '}
					<a href="https://twitter.com/VirtualCoffeeIO">X (formerly Twitter)</a>{' '}
					chat and gratitude post in <code>#general</code>
				</li>
			</ul>

			<h3 className="mt-4">☕ Official Virtual Coffee Events</h3>
			<ul>
				<li>
					Virtual Coffee (Tuesdays at 9:00 AM ET | Thursdays at 12:00 PM ET)
				</li>
				<li>
					Async X (formerly Twitter) chat (Fridays — prompts tweeted out at 9:00
					AM ET)
				</li>
			</ul>

			<p>
				Note: These are the currently scheduled times for these events at the
				time of this publication. Please check the official VC{' '}
				<code>#announcements</code> Slack channel or other noted channels for
				any updates and links to event rooms. For the full list of events, check
				out <Link to="/events">our events page</Link>.
			</p>

			<hr />

			<h2 className="mb-3">Volunteering at VC</h2>
			<p>
				We're very excited to continue open membership with the support of our
				active volunteers! All our active volunteers have an invite to send out
				to someone interested in joining Virtual Coffee. If you're interested in
				joining the volunteer team, check out some of{' '}
				<Link to="/resources/virtual-coffee-handbook/get-involved/paths-to-leadership">
					our open roles
				</Link>
				!
			</p>

			<hr />

			<h2>Member Content Highlights</h2>
			<p>
				<em>Some of our member contents we loved in September!</em>
			</p>
			<h3>Articles</h3>
			<ul>
				<li>
					<a href="https://dev.to/opensauced/how-to-participate-in-hackoberfest-13hm">
						How to Participate in Hacktoberfest — Bekah Hawrot Weigel
					</a>
				</li>
				<li>
					<a href="https://www.freecodecamp.org/news/how-to-contribute-to-open-source/">
						How to Contribute to Open Source Projects – Non-Technical Things You
						Should Know — Ayu Adiati
					</a>
				</li>
				<li>
					<a href="https://dev.to/opensauced/supercharge-your-repository-with-code-owners-4clg">
						Supercharge your Repository with Code Owners — Nick Taylor
					</a>
				</li>
				<li>
					<a href="https://www.harness.io/blog/demystifying-trunk-based-development?utm_source=devrel-chris-demars&utm_medium=slack">
						Demystifying Trunk-Based Development — Chris DeMars
					</a>
				</li>
			</ul>

			<div className="card my-5 border-primary">
				<div className="card-body">
					<h2 className="card-title text-primary font-italic">Member Wins</h2>
					<div className="card-text">
						<blockquote className="blockquote">
							<p className="mb-0">
								"I just finished writing the last section for the alpha draft of
								my book on public speaking."
							</p>
							<footer className="blockquote-footer">Arthur</footer>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">
								"I just got accepted to be a writer at freeCodeCamp!"
							</p>
							<footer className="blockquote-footer">Nick</footer>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">"Won my first-ever solo hackathon."</p>
							<footer className="blockquote-footer">Wilfred</footer>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">
								I finished my bootcamp course (Node.js) last week.
							</p>
							<footer className="blockquote-footer">Satoshi</footer>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">
								I've been accepted into the University of Colorado - Boulder's
								Post Baccalaureate ​Applied Computer Science​ program!
							</p>
							<footer className="blockquote-footer">Lauren</footer>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">
								Some big news! I’m going to be working with Bekah!!!!!
							</p>
							<footer className="blockquote-footer">Nick</footer>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">I am now a Postman Supernova.</p>
							<footer className="blockquote-footer">Teri</footer>
						</blockquote>
					</div>
				</div>
			</div>

			<h2>What our members are up to</h2>
			<ul>
				<li>
					Chris Jarvis does a{' '}
					<a href="https://dev.to/jarvisscript/series/19128">
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
					<a href="https://twitter.com/ArtTechChat">
						ArtTechChat on X (formerly Twitter)
					</a>{' '}
					every Sunday at 1:00 PM ET.
				</li>
				<li>
					Ray Deck is{' '}
					<a href="https://www.youtube.com/@techmesomethingcool">
						co-hosting a vid-pod about low code/no code solutions
					</a>{' '}
					on YouTube!
				</li>
			</ul>

			<hr />

			<h2>Open Source Projects (Hacktoberfest Approved)</h2>
			<ul>
				<li>
					<a href="https://github.com/Virtual-Coffee/virtualcoffee.io/issues">
						VirtualCoffee.io
					</a>{' '}
					— a Remix Web App for our community created by Dan Ott.
				</li>
				<li>
					<a href="https://github.com/Virtual-Coffee/podcast-transcripts">
						Virtual Coffee / podcast transcipts
					</a>
					— SRT files for the Virtual Coffee Podcast episodes.
				</li>
				<li>
					<a href="https://github.com/freeCodeCamp/Developer_Quiz_Site">
						FreeCodeCamps's Developer Quiz Site
					</a>{' '}
					— A newbie friendly repo that frequently accepts OSS contributions.
				</li>
				<li>
					<a href="https://github.com/EddieHubCommunity/BioDrop">
						EddieHubCommunity's BioDrop
					</a>{' '}
					— Connect to your audience with a single link. Showcase the content
					you create and your projects in one place. Make it easier for people
					to find, follow and subscribe.
				</li>
				<li>
					<a href="https://github.com/open-sauced/intro/">
						Intro to Open Source
					</a>{' '}
					— An introduction to open source and guide through the process of
					contributing to projects.
				</li>
				<li>
					<a href="https://github.com/open-sauced/guestbook">GuestBook</a> — The
					place where future contributors are born.
				</li>
				<li>
					<a href="https://github.com/open-sauced/pizza-verse">PizzaVerse</a> —
					A beginner-friendly repository for all things pizza.
				</li>
				<li>
					<a href="https://github.com/dominicduffin1/python-turtle-art-canvas">
						Python Turtle Art Canvas
					</a>{' '}
					— The aim of this project is to create a collaborative piece of
					creative coding using Python Turtle Graphics.
				</li>
				<li>
					<a href="https://github.com/hacktoberfesthowto/howto-blog">
						Hacktoberfest How To
					</a>{' '}
					— Hugo blog template for Hacktoberfest HOW-TO.
				</li>
				<li>
					<a href="https://github.com/forem/forem">Forem</a> — For Empowering
					Community.
				</li>
				<li>
					<a href="https://github.com/Terieyenike/linktree">
						Django Link-In-Bio Tool
					</a>{' '}
					— A link-in-bio tool like Linktree that allows you to create a webpage
					with all your links in one place.
				</li>
				<li>
					<a href="https://github.com/cmcrawford2/memory-game">
						Classic Memory Game
					</a>{' '}
					— Memory card game from 1968.
				</li>
				<li>
					<a href="https://github.com/TarynMcMillan/Tiny-Troves-of-Dev-Wisdom">
						Tiny Troves of Dev Wisdom
					</a>{' '}
					— A small Unity 2D game made for Hacktoberfest 2023.
				</li>
				<li>
					<a href="https://github.com/tkshill/elm-rpg-session">
						Elm TTRPG Session
					</a>{' '}
					— A session manager, ttrpg character builder, and dice roller built
					with Elm and Lamdera.
				</li>
			</ul>
		</>
	);
}
