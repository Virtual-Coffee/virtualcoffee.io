import Link from 'next/link';
import LeadText from '@/components/content/LeadText';

export const handle = {
	meta: {
		title: 'Virtual Coffee Newsletter, May 2024',
		description: 'Community Kindness! 💝',
	},
	date: '2024-05-01',
	listTitle: 'May 2024',
};

export default function Issue() {
	return (
		<>
			<h2>Hey Friends!</h2>
			<LeadText>
				<p>
					After a lot of hard work from our presenters and organizers, Lightning
					Talks are complete! Next up is making the time to share good cheer
					with all the great people in this community.
				</p>
			</LeadText>

			<hr />

			<h2>💞 Kindness and Gratitude</h2>
			<p>
				<em>Spotlighting some of the kindness happening in our community.</em>
			</p>
			<blockquote className="blockquote">
				<p className="mb-0">
					"I'm grateful for Ethan running Feelings Friday."
				</p>
				<footer className="blockquote-footer">Eddie</footer>
			</blockquote>
			<blockquote className="blockquote">
				<p className="mb-0">
					"Super grateful to Andy for his detailed feedback."
				</p>
				<footer className="blockquote-footer">Lucia</footer>
			</blockquote>
			<blockquote className="blockquote">
				<p className="mb-0">
					"Thanks so much, Vic, for helping me troubleshoot my server issues!"
				</p>
				<footer className="blockquote-footer">Laura M</footer>
			</blockquote>

			<hr />

			<h2 className="my-5">📆 What's happening at Virtual Coffee</h2>
			<h3>April Recap</h3>
			<p>
				<strong>💡Monthly Theme & Challenge: Public Speaking!</strong>
			</p>
			<p>
				We spent the month getting back in conf talk mode, supporting each
				other's public personas and rounding things off with our annual
				LIGHTNING TALKS. Thank you so so much to all who participated. To learn
				more you can always check out our{' '}
				<Link href="/monthlychallenges/apr-2024">website</Link>, and you can
				check out a recap of the{' '}
				<a href="https://www.youtube.com/live/pzLXQYZpOPU?si=63xFbmK18J01fpLn&t=6">
					full lightning talk stream here
				</a>
				!
			</p>

			<h3 className="mt-4">May: Community Kindness!</h3>
			<p>
				<strong>💡Monthly Theme & Challenge: Community Kindness!</strong>
			</p>
			<p>
				As we work hard to make sure this community continues to be the special
				and close-knit group, this challenge encourages our members to celebrate
				one of the things that continually makes this community so special:
				Kindness. Some of the ways we see this include: practicing gratitude,
				reaching out to support other members, mentoring, helping, giving honest
				and constructive feedback, and continuing to make Virtual Coffee a safe
				and supportive space.
			</p>
			<p>
				To view all of the details of this month's challenge, check out the{' '}
				<Link href="/monthlychallenges/may-2024">May 2024 challenge page</Link>{' '}
				and Bekah's{' '}
				<a href="https://dev.to/virtualcoffee/monthly-challenge-cultivating-community-kindness-in-uncertain-times-7n">
					blog post
				</a>
				.
			</p>

			<h3 className="mt-4">☕🪑 Coffee Table Events</h3>
			<ul>
				<li>Tech Interview Study Group (Mondays at 4:00 PM ET)</li>
				<li>
					Accountabilibuddies (Tuesdays at 7:00 PM ET | Thursdays at 9:00 AM ET)
				</li>
				<li>The Pack Hunt (Tandem Job Hunting) (Wednesdays at 2:00 PM ET)</li>
				<li>Feelings Friday (Fridays at 8:00 PM ET)</li>
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
					Fridays:
					<ul>
						<li>
							Rust Learning Cohort check-in in <code>#learning-together</code>
						</li>
						<li>
							<a href="https://twitter.com/VirtualCoffeeIO">
								X (formerly Twitter)
							</a>{' '}
							chat and gratitude post in <code>#general</code>
						</li>
					</ul>
				</li>
			</ul>

			<h3 className="mt-4">☕ Official Virtual Coffee Events</h3>
			<ul>
				<li>
					Virtual Coffee (Tuesdays at 9:00 AM ET | Thursdays at 12:00 PM ET)
				</li>
				<li>
					Async Twitter Chat (Weekly chat begins every Friday at 9:00 AM ET)
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
				you're interested in joining the one you identify with most, DM Bekah or
				Meg on Slack.
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
					<a href="https://dev.to/opensauced/the-secret-recipe-to-getting-your-pull-requests-reviewed-and-merged-faster-1fag">
						The Secret Recipe to Getting Your Pull Requests Reviewed (and
						Merged) Faster — Ayu Adiati
					</a>
				</li>
				<li>
					<a href="https://css-tricks.com/managing-user-focus-with-focus-visible/?utm_team=devrel&utm_source=slack&utm_content=csstricks">
						Managing User Focus with :focus-visible — Chris DeMars
					</a>
				</li>
				<li>
					<a href="https://dev.to/opensauced/form-and-function-how-i-lost-my-submit-button-got-it-back-5b91">
						Form and Function: How I Lost My Submit Button & Got It Back — Nick
						Taylor
					</a>
				</li>
				<li>
					<a href="https://dev.to/marktnoonan/why-i-rarely-use-getbyrole-testing-library-and-the-first-rule-of-aria-4581">
						Why I rarely use `getByRole`: Testing Library and the first rule of
						ARIA — Mark Noonan
					</a>
				</li>
			</ul>

			<h3>Videos</h3>
			<ul>
				<li>
					<a href="https://www.youtube.com/watch?v=BdnpTrviJko">
						Should you await Inside Your C# Loops? — Michael Jolley
					</a>
				</li>
			</ul>

			<div className="card my-5 border-primary">
				<div className="card-body">
					<h2 className="card-title text-primary mb-3">🏆 Member Wins</h2>
					<div className="card-text">
						<blockquote className="blockquote">
							<p className="mb-0">
								"Just did my first PR on OpenSauced this morning (and it got
								merged)!"
							</p>
							<footer className="blockquote-footer">Becky</footer>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">
								"Finished the rough cut of all my slides and content this
								morning for a new talk I'm giving on Friday."
							</p>
							<footer className="blockquote-footer">Brian</footer>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">
								"I attended an in-person networking event for coders in my area,
								and had a first round interview with a company."
							</p>
							<footer className="blockquote-footer">Jenna</footer>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">
								"Joined Hack for LA, and completed my first ever GitHub issue.
								Waiting for the PR to be merged."
							</p>
							<footer className="blockquote-footer">Danielle</footer>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">
								"Officially 30,000 words into my first novel!"
							</p>
							<footer className="blockquote-footer">Drew</footer>
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
