import { Link } from '@remix-run/react';
import LeadText from '~/components/content/LeadText';

export const handle = {
	meta: {
		title: 'Virtual Coffee Newsletter, December 2023',
		description: 'Creative Community at the End of 2023! 💝',
	},
	date: '2023-12-01',
	listTitle: 'December 2023',
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
					After a successful blogging challenge with NaNoWriMo in November,
					we're enjoying the creative parts of ourselves with Creative
					Community!
				</p>
			</LeadText>

			<hr />

			<h2>💞 Kindness and Gratitude</h2>
			<p>
				<em>Spotlighting some of the kindness happening in our community.</em>
			</p>
			<blockquote className="blockquote">
				<p className="mb-0">
					"Grateful for feedback from Justin, Meg, and Ryan for my new
					educational static site. Thanks to everyone for helping me get it out
					there!"
				</p>
				<footer className="blockquote-footer">Lucia</footer>
			</blockquote>
			<blockquote className="blockquote">
				<p className="mb-0">
					"Managed to get two nights of restful sleep after having a night with
					almost no sleep. Grateful for all the support from VC."
				</p>
				<footer className="blockquote-footer">Vitaly</footer>
			</blockquote>
			<blockquote className="blockquote">
				<p className="mb-0">
					"I participated in my first Hacktoberfest this year and just received
					my reward kit. The content is really sick!!! I'm so grateful for this
					community cause you guys really gave me the push through all your
					messages here."
				</p>
				<footer className="blockquote-footer">Wonuola</footer>
			</blockquote>

			<hr />

			<h2 className="my-5">📆 What's happening at Virtual Coffee</h2>
			<h3>November Recap</h3>
			<p>
				<strong>💡Monthly Theme & Challenge: NaNoWriMo!</strong>
			</p>
			<p>
				November was our annual{' '}
				<a href="https://virtualcoffee.io/monthlychallenges/nov-2023">
					Writing Challenge
				</a>{' '}
				and it was amazing! We got over 150,000 words as a community. Shoutout
				to <strong>Amy Shackles</strong> for her massive contribution this month
				of almost 60,000 words!
			</p>

			<h3 className="mt-4">December: Creative Community!</h3>
			<p>
				<strong>
					💡Monthly Theme & Challenge: Creative Community Challenge!
				</strong>
			</p>
			<p>
				Devs are more than just the code we write. This challenge is all about
				embracing self-expression. Give back to yourself by indulging in
				something just for fun. Share the art, music, poetry, sports, games, or
				other hobbies that spark your joy.
			</p>
			<p>
				We spend so much time grinding away on understanding things in the tech
				space; let's make some space for the other parts of ourselves. In{' '}
				<a href="https://virtualcoffee.io/monthlychallenges/dec-2023">
					this challenge
				</a>
				, we encourage folks to work on things that aren't necessarily
				code-specific or use code to improve other hobbies and outlets.
			</p>
			<p>
				Bekah wrote an amazing blog post called{' '}
				<a href="https://dev.to/virtualcoffee/join-virtual-coffee-in-the-creative-community-monthly-challenge-44d5?preview=1915937bfaddd231a989f8d4f4f99215178b688fe8eb5cd6533fd81a188698c0ec971b8bcad6e4b34cb65930afb4cdb718543ce10b9d3ad83c51bf1c">
					Join Virtual Coffee in the Creative Community Monthly Challenge!
				</a>{' '}
				to get us started!
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

			<h3>🆕 New Channels Alert</h3>
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
				<em>Some of our member posts we loved during our Writing Challenge</em>
			</p>
			<h3>Articles</h3>
			<ul>
				<li>
					<a href="https://harshleey.hashnode.dev/demystifying-the-internet">
						Demystifying the Internet — Fatima Adekunle-logun
					</a>
				</li>
				<li>
					<a href="https://dev.to/nickytonline/typescript-and-react-enforcing-props-for-accessibility-2h49">
						TypeScript and React: Enforcing Props for Accessibility — Nick
						Taylor
					</a>
				</li>
				<li>
					<a href="https://klescode.hashnode.dev/volunteering-as-a-developer">
						Volunteering as a Developer: Win-Win for You and the Tech Community
						— Klesta L
					</a>
				</li>
				<li>
					<a href="https://baldbeardedbuilder.com/blog/primary-constructors-in-csharp-12-dotnet/">
						Using Primary Constructors in C# 12 & .NET 8 — Michael Jolley
					</a>
				</li>
				<li>
					<a href="https://dev.to/raaynaldo/binary-search-finding-maxmin-template-in-javascript-1de7">
						Binary Search Finding Max/Min Template in Javascript — Raynaldo
						Sutisna
					</a>
				</li>
				<li>
					<a href="https://dev.to/bekahhw/hiring-firing-and-becoming-indispensable-kfe">
						Hiring, Firing, and Becoming Indispensable — BekahHW
					</a>
				</li>
				<li>
					<a href="https://www.freecodecamp.org/news/how-to-write-commit-messages-maintainers-will-like/">
						How to Write Commit Messages that Project Maintainers Will
						Appreciate — Christine Belzie
					</a>
				</li>
				<li>
					<a href="https://dev.to/alexcurtisslep/lessons-from-starting-an-open-source-project-2g3l">
						Lessons from Starting an Open Source Project — Alex Curtis-Slep
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
								"I am so excited to officially be launching my new service, Say
								My Name, on Product Hunt today."
							</p>
							<footer className="blockquote-footer">Justin</footer>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">
								"Win: I had my PR merged into create-typescript-app."
							</p>
							<footer className="blockquote-footer">Dominic</footer>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">"Completed 3 blogs for this month!"</p>
							<footer className="blockquote-footer">David</footer>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">"Finally finished building my blog."</p>
							<footer className="blockquote-footer">Jessica</footer>
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
