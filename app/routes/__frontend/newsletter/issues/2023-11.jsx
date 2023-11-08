import { Link } from '@remix-run/react';
import LeadText from '~/components/content/LeadText';

export const handle = {
	meta: {
		title: 'Virtual Coffee Newsletter, November 2023',
		description: 'National November Writing Month! 💝',
	},
	date: '2023-11-01',
	listTitle: 'November 2023',
};

export const meta = () => {
	return handle.meta;
};

export default function Issue() {
	return (
		<>
			<h2>Hey budding writers!</h2>
			<LeadText>
				<p>
					October was Hacktoberfest and it was amazing, but now we're switching
					gears and putting our writer caps on! It's Nanowrimo!
				</p>
			</LeadText>

			<hr />

			<h2>💞 Kindness and Gratitude</h2>
			<p>
				<em>Spotlighting some of the kindness happening in our community.</em>
			</p>
			<blockquote className="blockquote">
				<p className="mb-0">
					"Grateful for MagnoliaJS and meeting a bunch of VC people in person!"
				</p>
				<footer className="blockquote-footer">Dan</footer>
			</blockquote>
			<blockquote className="blockquote">
				<p className="mb-0">
					"Had my first virtual coffee today and I’m grateful."
				</p>
				<footer className="blockquote-footer">Josh</footer>
			</blockquote>
			<blockquote className="blockquote">
				<p className="mb-0">
					"Grateful for many learning opportunities I got this week around open
					source and I'm always, always grateful for being part of the VC
					family."
				</p>
				<footer className="blockquote-footer">Ayu</footer>
			</blockquote>

			<hr />

			<h2 className="my-5">📆 What's happening at Virtual Coffee</h2>
			<h3 className="font-italic">October Recap</h3>
			<p>
				<strong>💡Monthly Theme & Challenge: Hacktoberfest!</strong>
			</p>
			<p>
				October was our annual{' '}
				<a href="https://hacktoberfest.com/">Hacktoberfest</a> and it was
				amazing! Shoutout to everyone who participated. Everyone was
				contributed, or mentored, or maintained or just tried to provide
				support. We're super proud of all of you.
			</p>
			<p>
				<strong>
					A huge thank you to{' '}
					<a href="https://clerk.com/?utm_source=sponsorship&utm_medium=event&utm_campaign=virtual-coffee">
						Clerk
					</a>{' '}
					for sponsoring the Virtual Coffee Hacktoberfest Initiative this year
				</strong>
				! Additional gratitude to{' '}
				<a href="https://www.levelupfinancialplanning.com/?vc">
					LevelUp Financial Planning
				</a>{' '}
				for their support as well!
			</p>

			<h3 className="mt-4">November: Nanowrimo time!</h3>
			<p>
				<strong>💡Monthly Theme & Challenge: Blogging Challenge!</strong>
			</p>
			<p>
				This month, we're working together to blog 100,000 words! Based off the
				NaNoWriMo (National Novel Writing Month) Challenge, we'll be doing the
				tech take on writing and working together towards the goal while posting
				on our own blogs. We hit over 100k words last year, and we're going to
				start this year's challenge with a goal of 100k words. Get those blog
				posts up!
			</p>
			<p>
				Bekah wrote an amazing blog post called{' '}
				<a href="https://dev.to/virtualcoffee/blogging-2023-monthly-challenge-3kng">
					Blogging 2023 Monthly Challenge
				</a>{' '}
				to get us started! You can learn more about the challenge{' '}
				<Link to="/monthlychallenges/nov-2023">here</Link>!
			</p>

			<h3 className="mt-4">🎙️Podcasts</h3>
			<p className="font-italic">Season 9 is out!</p>
			<ul>
				<li>
					<Link to="/podcast/open-source-licenses-with-matt-mcinnis-tom-cudd-and-ray-deck">
						Open Source Licenses with Matt McInnis, Tom Cudd, and Ray Deck
					</Link>
				</li>
				<li>
					<Link to="/podcast/jessica-wilkins-using-open-source-to-create-connections">
						Jessica Wilkins — Using Open Source to Create Connections
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
					on GitHub
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
					Async Twitter Chat (Fridays — prompts tweeted out at 9:00 AM ET)
				</li>
			</ul>

			<p>
				<strong>Note:</strong> These are the currently scheduled times for these
				events at the time of this publication. Please check the official VC
				<code>#announcements</code> Slack channel, or other noted channels, for
				any updates and links to event rooms. For the full list of events, check
				out <Link to="/events">our events page</Link>.
			</p>

			<hr />

			<h3 className="mb-3">🤝 Volunteering at VC</h3>
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

			<h2>✨ Member Content Highlights</h2>
			<p>
				<em>Some of our member contents we loved in October!</em>
			</p>
			<h3>Articles</h3>
			<ul>
				<li>
					<a href="https://dev.to/terieyenike/building-an-efficient-waitlist-app-with-nextjs-and-xata-caf">
						Building an Efficient Waitlist App with Next.js and Xata — Teri
						Eyenike
					</a>
				</li>
				<li>
					<a href="https://blog.frankmtaylor.com/2023/10/02/introducing-selectorhound/">
						Introducing SelectorHound — Frank Paceaux
					</a>
				</li>
				<li>
					<a href="https://cam.bio/posts/3-reasons-your-laravel-validations-arent-working/">
						3 Reasons Your Laravel Validations Aren't Working — Camilo Payan
					</a>
				</li>
				<li>
					<a href="https://dev.to/nehamaity/lessons-ive-learned-after-three-years-as-a-full-time-software-engineer-hml">
						Lessons I've Learned After Three Years as a Full-time Software
						Engineer — Neha Maity
					</a>
				</li>
				<li>
					<a href="https://dev.to/cbid2/four-ways-to-survive-hacktoberfest-as-a-maintainer-26fk">
						Four Ways To Survive Hacktoberfest As A Maintainer — Christine
						Belzie
					</a>
				</li>
			</ul>

			<div className="card my-5 border-primary">
				<div className="card-body">
					<h2 className="card-title text-primary font-italic">
						🏆 Member Wins
					</h2>
					<div className="card-text">
						<blockquote className="blockquote">
							<p className="mb-0">
								"I got two talks accepted to{' '}
								<a href="https://confoo.ca">ConFoo Montreal</a>! This will be
								the first time I’m giving a talk in person!"
							</p>
							<footer className="blockquote-footer">Nick</footer>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">
								"Had a win today : an interview tomorrow and I passed the AZ-900
								(Microsoft Certified: Azure Fundamentals)."
							</p>
							<footer className="blockquote-footer">Nerando</footer>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">
								"I'm unexpectedly speaking at Momentum next week."
							</p>
							<footer className="blockquote-footer">Brian</footer>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">
								"It's official that Christine and I are supporting OpenSauced as
								community maintainers!"
							</p>
							<footer className="blockquote-footer">Ayu</footer>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">
								"You are now looking at one of the newest members on the
								Developer Advocate Advisory Board at DevNetwork &
								DeveloperWeek."
							</p>
							<footer className="blockquote-footer">Chris</footer>
						</blockquote>
					</div>
				</div>
			</div>

			<h2>👀 What our members are up to</h2>
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

			<h2>💻 Open Source Projects</h2>
			<ul>
				<li>
					<a href="https://github.com/Virtual-Coffee/virtualcoffee.io/issues">
						VirtualCoffee.io
					</a>{' '}
					— a Remix Web App for our community created by Dan Ott.
				</li>
				<li>
					<a href="https://github.com/Virtual-Coffee/podcast-transcripts">
						Virtual Coffee Podcast Transcipts
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
					<a href="https://github.com/open-sauced/docs">OpenSauced's Docs</a> —
					A static rendered documentation for open source developer onboarding
					to OpenSauced.
				</li>
				<li>
					<a href="https://github.com/open-sauced/intro/">
						Intro to Open Source
					</a>{' '}
					— An introduction to open source and guide through the process of
					contributing to projects.
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

			<hr />

			<LeadText>
				Thanks to this issue's sponsor,{' '}
				<a href="https://www.levelupfinancialplanning.com/?vc">
					LevelUP Financial Planning
				</a>
				, who understands the importance of finding balance between having an
				awesome life today, and being confident and excited about your future
				possibilities.
			</LeadText>
		</>
	);
}
