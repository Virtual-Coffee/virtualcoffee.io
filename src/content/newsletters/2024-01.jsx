import Link from 'next/link';
import LeadText from '@/components/content/LeadText';

export const handle = {
	meta: {
		title: 'Virtual Coffee Newsletter, January 2024',
		description: 'Ready, Set, Goals! 💝',
	},
	date: '2024-01-01',
	listTitle: 'January 2024',
};

export default function Issue() {
	return (
		<>
			<h2>Hey Friends!</h2>
			<LeadText>
				<p>
					2023 was a whirlwind year, for good and for bad, but the strength and
					energy of this community shone through it all. We're looking forward
					to a bright 2024, and starting it off with a goal-setting theme for
					January!
				</p>
			</LeadText>

			<hr />

			<h2>💞 Kindness and Gratitude</h2>
			<p>
				<em>Spotlighting some of the kindness happening in our community.</em>
			</p>
			<blockquote className="blockquote">
				<p className="mb-0">
					"Been loving the group pomodoro sessions in the{' '}
					<code>#co-working-room</code>! Definitely help my ADHD brain get/stay
					in flow state!"
				</p>
				<footer className="blockquote-footer">Ethan</footer>
			</blockquote>
			<blockquote className="blockquote">
				<p className="mb-0">
					"I spent all day in bed yesterday due to a migraine. Today, I didn't
					really want to do anything, but I saw we needed a room leader for
					today's coffee. Grudgingly, I volunteered. I had a great time and was
					immediately lifted out of my horrible mood. Thanks so much to everyone
					that started and helps keep VC running. My life would be a much darker
					place without all of you."
				</p>
				<footer className="blockquote-footer">Justin</footer>
			</blockquote>
			<blockquote className="blockquote">
				<p className="mb-0">
					"I started a four month contract at EA this week as a Technical
					Writer! This group has helped me feel more confident navigating a
					career in tech, so thank you all so much."
				</p>
				<footer className="blockquote-footer">Taryn</footer>
			</blockquote>

			<hr />

			<h2 className="my-5">📆 What's happening at Virtual Coffee</h2>
			<h3>December Recap</h3>
			<p>
				<strong>💡Monthly Theme & Challenge: Creative Community!</strong>
			</p>
			<p>
				Keeping up a VC tradition, our December focus was on making, sharing,
				and creativity. We baked, crocheted, sewed, built with Legos,
				photographed, and everything in between. If you enjoyed it, you can join
				in the fun all year in the <code>#making-stuff</code> channel!
			</p>

			<h3 className="mt-4">January: Goal Get It!</h3>
			<p>
				<strong>💡Monthly Theme & Challenge: New Year, New Goals!</strong>
			</p>
			<p>
				Setting goals is a pretty well-worn practice for January, but New Year's
				resolutions are notoriously hard to keep. This month's challenge is
				about setting better goals that will serve you all year long, then
				building the habits and tools to help you achieve. Check out the{' '}
				<Link to="/monthlychallenges/jan-2024">VC Monthly Challenge page</Link>{' '}
				or{' '}
				<a href="https://dev.to/virtualcoffee/join-virtual-coffee-in-new-year-new-goals-241m">
					Ayu's blog post
				</a>{' '}
				for more inspiration and info!
			</p>
			<p>
				Some of our Coffee Table groups and Slack channels will have special
				sessions and posts focused on the theme, including a goal-setting
				workshop in <code>#tech-interview-study-group</code> on January 8 and
				some creative goal tracking activities in The Pack Hunt.
			</p>
			<p>
				In past years, our January theme has been "Month of Learning", and we'd
				love to see folks setting goals to learn new tech stacks, data
				structures and algorithms, RegEx wizardry, or tech interviewing skills.
				But this community is more than tech! The goals to find more work/life
				balance, improve your 5K time, or be a better ally are all just as
				worthwhile. Whatever goals you set for this year, VC members are ready
				to support you and cheer you on.
			</p>

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

			<h3>📝 Survey</h3>
			<p>
				The end of the year survey will be ready soon. We ask you take a couple
				of minutes to fill it out so we can continue to improve this community
				and make it a space that provides value to our members.
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
					<a href="https://chrissycodes.hashnode.dev/novice-to-expert-my-freecodecamp-writing-journey">
						Novice To Expert: My freeCodeCamp Writing Journey — Christine Belzie
					</a>
				</li>
				<li>
					<a href="https://baldbeardedbuilder.com/blog/choosing-between-dotnet-controllers-and-minimal-apis/">
						Choosing Between Controllers and Minimal API for .NET APIs — Michael
						Jolley
					</a>
				</li>
				<li>
					<a href="https://dev.to/jarvisscript/ugly-sweater-css-spider-man-2ke2">
						Ugly Sweater CSS: Spider-man. — Chris Jarvis
					</a>
				</li>
				<li>
					<a href="https://dev.to/opensauced/migrating-from-jest-to-vitest-for-your-react-application-1b75">
						Migrating from Jest to Vitest for your React Application — Nick
						Taylor
					</a>
				</li>
				<li>
					<a href="https://github.com/compose-us/build-in-public/blob/main/updates/2023-12-01%20Gathering%20Feedback/README.md">
						Gathering Feedback (Build In Public project) — Jörn Bernhardt
					</a>
				</li>
			</ul>

			<h3>Videos</h3>
			<ul>
				<li>
					<a href="https://www.youtube.com/watch?v=xbJRNwfnQb4&themeRefresh=1">
						Introduction to Consumer Group IDs (Apache Kafka Explained) — Lucia
						Cerchie
					</a>
				</li>
				<li>
					<a href="https://www.youtube.com/watch?v=xoEiMWxidPE">
						The Power of Communities for Self-Taught Devs — Ayu Adiati
					</a>
				</li>
				<li>
					<a href="https://www.youtube.com/watch?v=n8mNX2YqkUs">
						Learn JavaScript Interactively in New freeCodeCamp.org Curriculum —
						Jessica Wilkins
					</a>
				</li>
			</ul>

			<div className="card my-5 border-primary">
				<div className="card-body">
					<h2 className="card-title text-primary mb-3">🏆 Member Wins</h2>
					<div className="card-text">
						<blockquote className="blockquote">
							<p className="mb-0">"My blog reached 10K+ views!"</p>
							<footer className="blockquote-footer">Christine</footer>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">
								"I finally broke a million post views on dev.to!"
							</p>
							<footer className="blockquote-footer">Nick</footer>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">
								"Woohoo! Bekah's New Maintainers Resources making it into
								Favorite Series of the year on DEV! Congrats!!!"
							</p>
							<footer className="blockquote-footer">Ayu</footer>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">
								"I deleted over 20,000 emails and freed 16% of my inbox."
							</p>
							<footer className="blockquote-footer">Rad</footer>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">
								"I've been really into both scrollytales and clis for a while
								now... and now I'm iterating faster and faster! The hard work is
								paying off."
							</p>
							<footer className="blockquote-footer">Lucia</footer>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">
								"Just submitted the final draft of my final article for
								Stoplight, and I think it’s one of the best articles I’ve ever
								written. My editor agrees!"
							</p>
							<footer className="blockquote-footer">Julia</footer>
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
					<a href="https://www.nickyt.co/news">Nick Taylor's newsletter</a>{' '}
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
