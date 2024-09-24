import Link from 'next/link';
import LeadText from '@/components/content/LeadText';

export const handle = {
	meta: {
		title: 'Virtual Coffee Newsletter, March 2024',
		description: 'Get Job Ready! 💝',
	},
	date: '2024-03-01',
	listTitle: 'March 2024',
};

export default function Issue() {
	return (
		<>
			<h2>Hey Friends!</h2>
			<LeadText>
				<p>
					It's the third month of the year and it's time to get job ready! Join
					us as we work together as a community to get resume ready, interview
					prepped and get those jobs!
				</p>
			</LeadText>

			<hr />

			<h2>💞 Kindness and Gratitude</h2>
			<p>
				<em>Spotlighting some of the kindness happening in our community.</em>
			</p>
			<blockquote className="blockquote">
				<p className="mb-0">
					"Grateful for friends who kept me company and made my days in the{' '}
					<code>#co-working-room</code>"
				</p>
				<footer className="blockquote-footer">Ayu</footer>
			</blockquote>
			<blockquote className="blockquote">
				<p className="mb-0">
					"I’m honestly just so grateful to be a part of an amazing community
					that supports and uplifts each other."
				</p>
				<footer className="blockquote-footer">Chris</footer>
			</blockquote>
			<blockquote className="blockquote">
				<p className="mb-0">
					"Grateful for this community and for Cris taking time to review my
					very novice code when I requested critique to get better!"
				</p>
				<footer className="blockquote-footer">Ryan</footer>
			</blockquote>
			<blockquote className="blockquote">
				<p className="mb-0">
					"I’m grateful for Chris not just for his L&L today but bc he’s stepped
					up as a volunteer in all the things. He’s an amazing volunteer,
					speaker, and person willing to try new things."
				</p>
				<footer className="blockquote-footer">Bekah</footer>
			</blockquote>

			<hr />

			<h2 className="my-5">📆 What's happening at Virtual Coffee</h2>
			<h3>February Recap</h3>
			<p>
				<strong>💡Monthly Theme & Challenge: Month of Learning!</strong>
			</p>
			<p>
				We spent February picking up some new skills, joining cohorts, and
				broadening our knowledge!
			</p>

			<h3 className="mt-4">March: Get Job Ready!</h3>
			<p>
				<strong>💡Monthly Theme & Challenge: Get Job Ready!</strong>
			</p>
			<p>
				During this month, we're all about Resumes, Cover Letters, and Elevator
				Pitch. There's never a bad time to update your job application
				materials.
			</p>
			<p>
				The goal of this challenge is to work on creating, revising, or updating
				your job packet materials and that elevator pitch that might get you in
				the door. Your resume, cover letter, and elevator pitch should work
				together to tell your story and represent where you are on your career
				journey; each piece should complement the others. This challenge
				emphasizes taking time to ensure they work together or get some extra
				feedback on what you've worked on.
			</p>
			<p>
				To view all of the details of this year's challenge, check out the{' '}
				<Link href="/monthlychallenges/mar-2024">
					March 2024 challenge page
				</Link>{' '}
				on the Virtual Coffee website.
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
					<a href="https://dev.to/theoriginalbpc/sarah-dye-returns-to-coding-in-2024-4am2">
						Sarah Dye Returns to Coding in 2024 — Sarah Dye
					</a>
				</li>
				<li>
					<a href="https://dev.to/abbeyperini/a-love-letter-to-the-underrepresented-in-tech-4jj3">
						A Love Letter to the Underrepresented in Tech — Abbey Perini
					</a>
				</li>
				<li>
					<a href="https://dev.to/wdp/how-to-spot-and-avoid-job-scams-a-guide-for-junior-tech-professionals-2be8">
						How to Spot and Avoid Job Scams: A Guide for Junior Tech
						Professionals — Klesta
					</a>
				</li>
				<li>
					<a href="https://dev.to/nickytonline/newsletters-the-good-the-bad-and-the-ugly-43g4">
						Newsletters: the good, the bad and the ugly — Nick Taylor
					</a>
				</li>
				<li>
					<a href="https://yyt.dev/blog/cro/ecommerce-ab-test-guide">
						A/B tests for eCommerce: Why and how to run A/B tests on your site —
						Dominic Duffin
					</a>
				</li>
			</ul>

			<h3>Videos</h3>
			<ul>
				<li>
					<a href="https://www.youtube.com/watch?v=Z39GBdakyaw">
						Stop Burning Out Maintainers — BekahHW
					</a>
				</li>
			</ul>

			<div className="card my-5 border-primary">
				<div className="card-body">
					<h2 className="card-title text-primary mb-3">🏆 Member Wins</h2>
					<div className="card-text">
						<blockquote className="blockquote">
							<p className="mb-0">
								The VC Team won{' '}
								<a href="https://devpost.com/software/time-tracking-application">
									Dev Post's MLH (Month Long Hackathon)
								</a>
								! Huge congratulations to David Akim, Rad Turkin, and Satoshi
								Shirosaka!!! 🎉
							</p>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">
								"I gave my first in person conference talk Wednesday and doing
								my second one today!"
							</p>
							<footer className="blockquote-footer">Nick</footer>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">
								"Just got accepted to speak at StirTrek this year. Shout out to
								Ryan for helping me polish my abstract!"
							</p>
							<footer className="blockquote-footer">Brian</footer>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">
								"Finally released the mvp of my accessible color palette builder
								(also my first React project)!"
							</p>
							<footer className="blockquote-footer">Raynald</footer>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">
								"I passed the AWS Data Engineer Associate beta I took back in
								December!"
							</p>
							<footer className="blockquote-footer">Justin</footer>
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
				<li>
					Michael Jolley is{' '}
					<a href="https://www.twitch.tv/baldbeardedbuilder">
						streaming on twitch!
					</a>
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
