import Link from 'next/link';
import LeadText from '@/components/content/LeadText';

export const handle = {
	meta: {
		title: 'Virtual Coffee Newsletter, June 2024',
		description: 'Mid-Year Check-In! 💝',
	},
	date: '2024-06-01',
	listTitle: 'June 2024',
};

export default function Issue() {
	return (
		<>
			<h2>Hey Friends!</h2>
			<LeadText>
				<p>
					After a month of checking in on each other, it's time to check in on
					ourselves! Checking in with our goals, doing some accountability,
					recognizing our efforts and coordinating our actions for the future!
				</p>
			</LeadText>

			<hr />

			<h2>💞 Kindness and Gratitude</h2>
			<p>
				<em>Spotlighting some of the kindness happening in our community.</em>
			</p>
			<blockquote className="blockquote">
				<p className="mb-0">
					"I'm grateful for the Tuesday night accountabilibuddies group. I'd
					name them all but I'm sure I'd leave someone out. You know who you
					are."
				</p>
				<footer className="blockquote-footer">Cris</footer>
			</blockquote>
			<blockquote className="blockquote">
				<p className="mb-0">
					"I'm grateful to Nick for reaching out about joining him for a stream
					at some point."
				</p>
				<footer className="blockquote-footer">Brian</footer>
			</blockquote>
			<blockquote className="blockquote">
				<p className="mb-0">
					"I’m grateful for Dominic and Ayu who always keep things going and
					approach everything thoughtfully."
				</p>
				<footer className="blockquote-footer">Bekah</footer>
			</blockquote>
			<blockquote className="blockquote">
				<p className="mb-0">
					"This week, I'm really grateful for my first VC meeting. It was
					inspiring."
				</p>
				<footer className="blockquote-footer">Marianna</footer>
			</blockquote>

			<hr />

			<h2 className="my-5">💡 What's happening at Virtual Coffee</h2>
			<h3 className="mb-4">May Recap: Community Kindness!</h3>
			<p>
				We spent some time just reaching out to old friends, sharing our
				appreciation for each other, and making space for good conversations!
				And as always, we don't have to stop the energy as the month concludes.
				Taking time to touch base with people we love and appreciate is an
				evergreen way to cultivate the kind of life that restores us!
			</p>

			<h3 className="mb-4">June Challenge: Mid-Year Check-In!</h3>
			<p>
				The Mid-Year Check-In challenge is designed to provide an opportunity
				for Virtual Coffee members to reflect on their progress, reevaluate
				goals, and gain clarity on their journey. Let’s pause, assess, and
				adjust as we reach the halfway point of the year. This challenge aims to
				encourage personal growth, foster connection within the community, and
				provide a supportive space for members to share their insights,
				challenges, and successes.
			</p>
			<p>
				Learn more about this challenge in{' '}
				<a href="https://dev.to/virtualcoffee/monthly-challenge-mid-year-check-in-recharge-and-refocus-for-an-amazing-second-half-2k4c">
					this blog post
				</a>{' '}
				and check out the full{' '}
				<Link href="/monthlychallenges/june-2024">monthly challenge page</Link>!
			</p>

			<h3 className="mt-5 mb-4">☕📅 Virtual Coffee Events</h3>
			<h4>MONDAYS</h4>
			<ul>
				<li>Tech Interview Study Group — 16:00 GMT-4</li>
				<li>
					Goal-setting post in <code>#goals-and-wins</code> — async
				</li>
			</ul>
			<h4>TUESDAYS</h4>
			<ul>
				<li>Virtual Coffee — 09:00 GMT-4</li>
				<li>Accountabilibuddies — 19:00 GMT-4</li>
				<li>
					Trivia in <code>#game-night</code> — async
				</li>
			</ul>
			<h4>WEDNESDAYS</h4>
			<ul>
				<li>The Pack Hunt (Tandem Job Hunting) — 10:00 GMT-4</li>
				<li>Data Structures and Algorithms (DSA) Office Hours — 16:00 GMT-4</li>
				<li>
					Midweek check-in in <code>#general</code> — async
				</li>
			</ul>
			<h4>THURSDAYS</h4>
			<ul>
				<li>Accountabilibuddies — 09:00 GMT-4</li>
				<li>Virtual Coffee — noon GMT-4</li>
				<li>
					Book club discussion: "Mindset: The New Psychology of Success" — async
				</li>
			</ul>
			<h4>FRIDAYS</h4>
			<ul>
				<li>Frontend Friday Folks Fighting CSSBattle.dev — 11:00 GMT-4</li>
				<li>Feeling Friday — 20:00 GMT-4</li>
				<li>
					Rust Learning Cohort check-in in <code>#learning-together</code> —
					async
				</li>
				<li>
					<a href="https://twitter.com/VirtualCoffeeIO">X (formerly Twitter)</a>{' '}
					chat and gratitude post in <code>#general</code> — async
				</li>
			</ul>

			<p className="mt-4">
				<strong>Note:</strong> These are the currently scheduled times for these
				events at the time of this publication. Please check the official VC{' '}
				<code>#announcements</code> Slack channel, or other noted channels, for
				any updates and links to event rooms. For the full list of events, check
				out <Link href="/events">our events page</Link>.
			</p>

			<h3 className="mt-5 mb-4">🆕 New Career Focus Channels Alert</h3>
			<p>
				We've added three new private channels — <code>Senior+</code>,{' '}
				<code>Mid-level</code>, <code>Early-career</code> — to our Slack for
				peer-to-peer conversation, because we know that it's good to be able to
				support and nurture conversations specific to your career level. If
				you're interested in joining the one you identify with most, DM Bekah or
				Meg on Slack.
			</p>

			<hr />

			<h3 className="mb-4">🤝 Volunteering at VC</h3>
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
					<a href="https://dev.to/ritadee/my-open-source-journey-with-opensauced-from-beginner-to-confident-contributor-4jkp">
						My Open Source Journey with OpenSauced: From Beginner to Confident
						Contributor — Rita Nkem Daniel
					</a>
				</li>
				<li>
					<a href="https://opensauced.pizza/blog/maintainer-course">
						Nurturing the Future of Open Source: Maintainers — Bekah Hawrot
						Weigel
					</a>
				</li>
				<li>
					<a href="https://dev.to/opensauced/how-to-create-a-welcoming-space-for-new-open-source-contributors-25fd">
						How To Create A Welcoming Space For New Open Source Contributors —
						Christine Belzie
					</a>
				</li>
			</ul>

			<div className="card my-5 border-primary">
				<div className="card-body">
					<h2 className="card-title text-primary mb-3">🏆 Member Wins</h2>
					<div className="card-text">
						<blockquote className="blockquote">
							<p className="mb-0">
								"I wrote my first shell script today. I used vim."
							</p>
							<footer className="blockquote-footer">Lauren</footer>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">
								"I just got accepted to speak at Elixir Conf US! Super hyped for
								this one."
							</p>
							<footer className="blockquote-footer">Brian</footer>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">
								"Did my first solo presentation today at work and got a lot of
								great feedback from managers and other devs! It was in person
								too!"
							</p>
							<footer className="blockquote-footer">Klesta</footer>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">
								"Wow I'm still taking it in, but got a reply on a job position I
								went for, as a tech lead/coach."
							</p>
							<footer className="blockquote-footer">Brett</footer>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">
								"I am glad to have given a talk last week."
							</p>
							<footer className="blockquote-footer">Teri</footer>
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
				kindness or blog post? Email us at{' '}
				<a href="mailto:hello@virtualcoffee.io">hello@virtualcoffee.io</a>.
			</p>
		</>
	);
}
