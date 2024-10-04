import Link from 'next/link';
import LeadText from '@/components/content/LeadText';

export const handle = {
	meta: {
		title: 'Virtual Coffee Newsletter, February 2024',
		description: 'Month of Learning! 💝',
	},
	date: '2024-02-01',
	listTitle: 'February 2024',
};

export default function Issue() {
	return (
		<>
			<h2>Hey Friends!</h2>
			<LeadText>
				<p>
					It's the second month of the year and it's time to learn! Join us as
					we implement our month of learning new things and putting our best
					thoughts and attempts forward.
				</p>
			</LeadText>

			<hr />

			<h2>💞 Kindness and Gratitude</h2>
			<p>
				<em>Spotlighting some of the kindness happening in our community.</em>
			</p>
			<blockquote className="blockquote">
				<p className="mb-0">
					"Thanks so much to everyone that started and helps keep VC running!"
				</p>
				<footer className="blockquote-footer">Justin</footer>
			</blockquote>
			<blockquote className="blockquote">
				<p className="mb-0">
					"I'm grateful for everything I learn from this community."
				</p>
				<footer className="blockquote-footer">Cris</footer>
			</blockquote>
			<blockquote className="blockquote">
				<p className="mb-0">
					"I'm grateful for spending more time in <code>#co-working-room</code>{' '}
					this week and catch up with my folks."
				</p>
				<footer className="blockquote-footer">Ayu</footer>
			</blockquote>
			<blockquote className="blockquote">
				<p className="mb-0">
					"It has been a long week; many things are still on my to-do list. I’m
					grateful for all my chats in the <code>#co-working-room</code> this
					week."
				</p>
				<footer className="blockquote-footer">Ethan</footer>
			</blockquote>

			<hr />

			<h2 className="my-5">📆 What's happening at Virtual Coffee</h2>
			<h3>January Recap</h3>
			<p>
				<strong>💡Monthly Theme & Challenge: New Year, New Goals!</strong>
			</p>
			<p>
				We took time at the start of a new year to really sit with our goals and
				put time and effort into making solid plans that we could stick to and
				achieve
			</p>

			<h3 className="mt-4">February: Month of Learning!</h3>
			<p>
				<strong>💡Monthly Theme & Challenge: Month of Learning!</strong>
			</p>
			<p>
				During this month, we'll work on learning new dev-related things. You
				might deep-dive into one topic, focus on a new topic every week, or do a
				little bit of everything.
			</p>
			<p>
				If you're inspired by what you learn and want to share more, we
				encourage you to give a{' '}
				<Link href="/lunch-and-learn-idea/">Lunch & Learn</Link> or get ready
				for our Lightning Talks in April!
			</p>
			<p>
				We aim to learn something new, share what we've learned, and{' '}
				<a href="https://github.com/orgs/Virtual-Coffee/discussions/1123">
					gather recommendations and resources
				</a>{' '}
				to share with the community.
			</p>

			<h3 className="mt-4">☕🪑 Coffee Table Events</h3>
			<ul>
				<li>Tech Interview Study Group (Mondays at 4:00 PM ET)</li>
				<li>
					Accountabilibuddies (Tuesdays at 7:00 PM ET and Thursdays at 9:00 AM
					ET)
				</li>
				<li>The Pack Hunt (Tandem Job Hunting) (Wednesdays at 2:00 PM ET)</li>
				<li>Feelings Friday (Fridays at 10:00 AM ET)</li>
				<li>
					Frontend Friday Folks fighting CSSBattle.dev (Fridays at 11:00 AM ET)
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

			<p className="mt-4">
				<strong>Note:</strong> These are the currently scheduled times for these
				events at the time of this publication. Please check the official VC{' '}
				<code>#announcements</code> Slack channel, or other noted channels, for
				any updates and links to event rooms. For the full list of events, check
				out <Link href="/events">our events page</Link>.
			</p>

			<h3>🆕 New Career Focus Channels Alert</h3>
			<p>
				We've added three new private channels — <code>Senior+</code>,{' '}
				<code>Mid-level</code>, <code>Early-career</code> — to our Slack for
				peer-to-peer conversation, because we know that it's good to be able to
				support and nurture conversations specific to your career level. If
				you're interested in joining the one you identify with most, DM Bekah on
				Slack.
			</p>

			<h3>📝 The End of Year Survey is here!</h3>
			<p>
				It's that time of year where we get feedback from you, the members! We
				always want to provide the best experience for our members and we'd love
				for you to fill out our{' '}
				<a href="https://airtable.com/appGHm8ztVWug6UxH/pagKrtAhS4jnRhtYD/form">
					short survey
				</a>{' '}
				and tell us what you love about the community, what you want, and what
				you wish you had more of!
			</p>

			<hr />

			<h3 className="mb-3">🤝 Volunteering at VC</h3>
			<p>
				We're very excited to continue open membership with the support of our
				active volunteers! All our active volunteers have an invite to send out
				to someone interested in joining Virtual Coffee. If you're interested in
				joining the volunteer team, check out some the roles{' '}
				<Link href="/resources/virtual-coffee-handbook/get-involved/paths-to-leadership">
					here
				</Link>
				!
			</p>

			<hr />

			<h2>✨ Member Content Highlights</h2>
			<p>
				<em>
					Our members are making the internet a better place with their words
					and wisdom!
				</em>
			</p>
			<h3>Articles</h3>
			<ul>
				<li>
					<a href="https://brianmeeker.me/2024/01/31/2023-year-in-review/">
						2023 Year In Review — Brian Meeker
					</a>
				</li>
				<li>
					<a href="https://dev.to/opensauced/stop-burning-out-maintainers-an-empathetic-guide-for-contributors-m20">
						Stop Burning Out Maintainers: An Empathetic Guide for Contributors —
						Bekah Hawrot Weigel
					</a>
				</li>
				<li>
					<a href="https://dev.to/anshu21/write-your-first-hello-world-program-in-rust-579o">
						Write your first Hello World! program in Rust — Anshuman Sathua
					</a>
				</li>
				<li>
					<a href="https://dev.to/opensauced/the-native-browser-dialog-element-1nhn">
						Unlocking the Power of HTML's Native Browser Dialog Element — Nick
						Taylor
					</a>
				</li>
				<li>
					<a href="https://mango-grammerjam.hashnode.dev/how-to-create-custom-clerk-auth-forms-with-next-typescript-and-tailwind">
						How to Create Custom Clerk Auth Forms with Next, TypeScript, and
						Tailwind — Alex Curtis-Slep and Steven Smodish
					</a>
				</li>
			</ul>

			<h3>Videos</h3>
			<ul>
				<li>
					<a href="https://www.youtube.com/watch?v=r0EoU5Mjttw">
						How Not To Strangle Your Coworkers: Resolving Conflict with
						Collaboration — Arthur Doler
					</a>
				</li>
			</ul>

			<div className="card my-5 border-primary">
				<div className="card-body">
					<h2 className="card-title text-primary mb-3">🏆 Member Wins</h2>
					<div className="card-text">
						<blockquote className="blockquote">
							<p className="mb-0">
								"Just did a major release with LinksHub, an open source project
								I maintain with another colleague. We redesigned the website to
								make it more user friendly and attractive."
							</p>
							<footer className="blockquote-footer">Christine</footer>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">
								"Just got accepted to Distribute Aid's Open Source Explorers
								program, which I found out about here on VC back in November.
								Program just kicked off today. Super psyched!!"
							</p>
							<footer className="blockquote-footer">Dierdre</footer>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">
								"Offer letter has been signed and I officially join the DevRel
								team at DigitalOcean as a Senior Developer Advocate."
							</p>
							<footer className="blockquote-footer">Chris</footer>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">
								"Finally finished my portfolio site! After weeks of
								flip-flopping between design decisions and even scrapping it
								altogether and starting over, I finally feel that this is worth
								deploying and sharing with the world."
							</p>
							<footer className="blockquote-footer">Shabab</footer>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">
								"The app we programmed launched yesterday!"
							</p>
							<footer className="blockquote-footer">Ariadne</footer>
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
					on YouTube!
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
					<a href="https://github.com/freeCodeCamp/Developer_Quiz_Site">
						FreeCodeCamps's Developer Quiz Site
					</a>{' '}
					— A newbie friendly repo that frequently accepts OSS contributions.
				</li>
				<li>
					<a href="https://github.com/open-sauced/docs">OpenSauced's Docs</a> —
					A static rendered documentation for open source developer onboarding
					to OpenSauced's projects.
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

			<p>
				If you're a member and you’d like to give a Lunch & Learn or Workshop,
				you can{' '}
				<a href="https://virtualcoffee.io/lunch-and-learn-idea">
					submit your idea here
				</a>
				.
			</p>
			<p>
				Have a question, suggestion, or want to nominate someone’s act of
				kindness or blogpost? Email us at{' '}
				<a href="mailto:hello@virtualcoffee.io">hello@virtualcoffee.io</a>.
			</p>
		</>
	);
}
