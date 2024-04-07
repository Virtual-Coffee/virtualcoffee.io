import { Link } from '@remix-run/react';
import LeadText from '~/components/content/LeadText';

export const handle = {
	meta: {
		title: 'Virtual Coffee Newsletter, April 2024',
		description: 'Public Speaking! 💝',
	},
	date: '2024-04-01',
	listTitle: 'April 2024',
};

export const meta = () => {
	return handle.meta;
};

export default function Issue() {
	return (
		<>
			<h2>Hey Friends!</h2>
			<LeadText>
				<p>
					It's April and Lightning Talks are quickly approaching! So we're doing
					everything we can to get geared up to share our knowledge, learnings,
					and insights!
				</p>
			</LeadText>

			<hr />

			<h2>💞 Kindness and Gratitude</h2>
			<p>
				<em>Spotlighting some of the kindness happening in our community.</em>
			</p>
			<blockquote className="blockquote">
				<p className="mb-0">
					"So grateful to find so many encouraging people!"
				</p>
				<footer className="blockquote-footer">Alex</footer>
			</blockquote>
			<blockquote className="blockquote">
				<p className="mb-0">"Grateful also as always for this community."</p>
				<footer className="blockquote-footer">David</footer>
			</blockquote>
			<blockquote className="blockquote">
				<p className="mb-0">
					"I am also grateful for all the encouragement Julia gave me this week;
					it helped me break out of my shell."
				</p>
				<footer className="blockquote-footer">Ethan</footer>
			</blockquote>
			<blockquote className="blockquote">
				<p className="mb-0">
					"Grateful for the VC Community, Good health, Family, getting assigned
					another client this month."
				</p>
				<footer className="blockquote-footer">Brendan</footer>
			</blockquote>

			<hr />

			<h2 className="my-5">📆 What's happening at Virtual Coffee</h2>
			<h3>March Recap</h3>
			<p>
				<strong>💡Monthly Theme & Challenge: Getting Job Ready!</strong>
			</p>
			<p>
				We spent the month working on resumes, cover letters, interview skills
				and all thing getting ready to work! Shoutout to all our community
				members who participated!
			</p>

			<h3 className="mt-4">April: Find Your Voice with Public Speaking!</h3>
			<p>
				<strong>💡Monthly Theme & Challenge: Public Speaking!</strong>
			</p>
			<p>
				Whether you're preparing for a keynote, a tech talk, or just want to get
				more comfortable speaking in public, we've got your back.
			</p>
			<p>
				During this month, we'll be breaking down the art of public speaking
				into manageable steps, focusing on different aspects each week.
				Throughout the month, we'll provide resources, tips, and opportunities
				to practice and get feedback from the community.
			</p>
			<p>
				To view all of the details of this year's challenge, check out the{' '}
				<Link to="/monthlychallenges/apr-2024">April 2024 challenge page</Link>{' '}
				on the Virtual Coffee website.
			</p>

			<h3 className="mt-4">☕🪑 Coffee Table Events</h3>
			<ul>
				<li>Tech Interview Study Group (Mondays at 4:00 PM ET)</li>
				<li>
					Accountabilibuddies (Tuesdays at 7:00 PM ET | Thursdays at 9:00 AM ET)
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
				out <Link to="/events">our events page</Link>.
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
				<Link to="/resources/virtual-coffee-handbook/get-involved/paths-to-leadership">
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
					<a href="https://dev.to/jlxfd/coding-out-loud-why-im-choosing-to-learn-in-public-1mgh">
						Coding Out Loud: Why I'm Choosing to "Learn in Public" — Julia
						Alexis Diaz
					</a>
				</li>
				<li>
					<a href="https://dev.to/opensauced/collaborate-conquer-grow-mastering-the-art-of-issue-management-for-open-source-projects-49gi">
						Collaborate, Conquer, & Grow: Mastering the Art of Issue Management
						for Open Source Projects — Ayu Adiati
					</a>
				</li>
				<li>
					<a href="https://dev.to/opensauced/stuck-in-the-middle-with-you-an-intro-to-middleware-1gjo">
						Stuck in the Middle with You: An intro to Middleware — Nick Taylor
					</a>
				</li>
			</ul>

			<h3>Videos</h3>
			<ul>
				<li>
					<a href="https://www.youtube.com/watch?v=p5EHpUucJIw">
						Crafting Interpreters in OCaml | For Loops — Caleb Weeks
					</a>
				</li>
				<li>
					<a href="https://www.youtube.com/shorts/tP5bhciEyHE">
						Take Me Home VS Code — Michael Jolley
					</a>
				</li>
			</ul>

			<div className="card my-5 border-primary">
				<div className="card-body">
					<h2 className="card-title text-primary mb-3">🏆 Member Wins</h2>
					<div className="card-text">
						<blockquote className="blockquote">
							<p className="mb-0">
								Brave. Bold. Fearless. Our very own Meg spent 4+ hours working
								on Rust ( <code>#doitlive</code> ) this weekend. While I don’t
								always advocate weekend work, what a great show of effort and
								inclusion to work through what we’re doing in the Rust{' '}
								<code>#learning-together</code> cohort live. Live! On YouTube
								and Twitch! Congrats and way to go Meg.
							</p>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">
								"DEV picked my WeCoded post for their Top 7 Posts of the Week."
							</p>
							<footer className="blockquote-footer">Sarah</footer>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">
								"Pretty pleased I managed from a mkdir to a "working" &{' '}
								<a href="https://gitlab-sast-parser.netlify.app/">
									publicly hosted website
								</a>{' '}
								in under 45 minutes"
							</p>
							<footer className="blockquote-footer">Mike</footer>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">
								"Im on{' '}
								<a href="https://www.wtxl.com/crawfordville/put-in-that-dedication-persevere-program-designed-to-help-inmates-re-enter-society-in-crawfordville">
									the news
								</a>
								! WXTL did a little article of the class I teach"
							</p>
							<footer className="blockquote-footer">Andrew</footer>
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
