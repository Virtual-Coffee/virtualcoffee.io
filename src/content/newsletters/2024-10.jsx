import Link from 'next/link';
import LeadText from '@/components/content/LeadText';

export const handle = {
	meta: {
		title: 'Virtual Coffee Newsletter, October 2024',
		description: "We're halfway through Hacktoberfest at Virtual Coffee! 💝",
	},
	date: '2024-10-01',
	listTitle: 'October 2024',
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
					Hacktoberfest is here! It’s been a long road of preparation,
					encouragement, and support. As always, shoutout to all our volunteers
					who’ve spread the good word about getting our members geared up to
					contribute!
				</p>
				<p>
					To start the month off in the true spirit of Hacktoberfest, we’ve done
					something big. We open-sourced our{' '}
					<a href="https://github.com/Virtual-Coffee/VC-Community-Docs">
						VC Community Docs
					</a>
					! By sharing our playbook, we're not just supporting our immediate
					community—we're extending a hand to community builders everywhere.
					We're living our values of creating a positive, inclusive community
					and removing tech barriers on a broader scale.
				</p>
			</LeadText>

			<hr />

			<h2>💞 Kindness and Gratitude</h2>
			<p>
				<em>Spotlighting some of the kindness happening in our community.</em>
			</p>
			<blockquote className="blockquote">
				<p className="mb-0">
					"I am grateful for everyone at Virtual Coffee. ☕️❤️ I want to give a
					special shout-out to Megan though! We had an awesome 'coffee chat'
					yesterday and she let me pick her brain about developer education
					roles."
				</p>
				<footer className="blockquote-footer">Micha</footer>
			</blockquote>
			<blockquote className="blockquote">
				<p className="mb-0">
					"I'm super grateful for Bekah for her continuous support in many ways.
					💖 "
				</p>
				<footer className="blockquote-footer">Ayu</footer>
			</blockquote>
			<blockquote className="blockquote">
				<p className="mb-0">
					"So grateful to have met Stephanie in person!! 🙌"
				</p>
				<footer className="blockquote-footer">Jono</footer>
			</blockquote>

			<hr />

			<h2 className="my-5">💡 What's happening at Virtual Coffee</h2>
			<h3 className="mb-4">September Recap: Preptember!</h3>
			<p>
				Every year since 2020, we’ve tried to get involved in some way with the
				Hacktoberfest initiative. Virtual Coffee aligns with the spirit and
				ethos of open source and tries every year to be an accessible avenue to
				learning, supporting, and tending to open-source projects.
			</p>
			<p>
				Learn more about this challenge in{' '}
				<em>
					<a href="https://dev.to/virtualcoffee/preptember-preparing-for-a-successful-hacktoberfest-5baa">
						this blog post
					</a>
				</em>
				.
			</p>
			<p>Check out the workshops we ran to prepare for Hacktoberfest:</p>
			<ul>
				<li>
					<a href="https://www.youtube.com/watch?v=KoVX3kGMn3c">
						Introduction to Open Source
					</a>
				</li>
				<li>
					<a href="https://www.youtube.com/watch?v=a-wrAFiBqFI">
						Becoming a Maintainer
					</a>
				</li>
				<li>
					<a href="https://www.youtube.com/watch?v=NhX2GSCvR6Q">
						Hacktoberfest Initiative Kickoff 2024
					</a>
				</li>
			</ul>

			<h3 className="mb-4">
				October Challenge: October? You must mean Hacktober!!! Time to Open
				Source!
			</h3>
			<p>
				This challenge is always run during October and was our first-ever
				monthly challenge. In many ways, we think of Hacktoberfest as the event
				that solidified Virtual Coffee beyond a pandemic meetup.
			</p>
			<p>
				We have three tracks: approved maintainers will provide issues labeled
				for Hacktoberfest, contributors will solve issues, and mentors will help
				contributors and maintainers be successful.
			</p>
			<h4>Maintainers:</h4>
			<p>
				They provide the repositories with "hacktoberfest" topic(s) and issues
				labeled "hacktoberfest" on their repositories. They will also answer the
				contributors' questions, review the pull requests (PRs), and validate
				and merge them following the contest rules.
			</p>
			<h4>Contributors:</h4>
			<p>
				They find repositories with "hacktoberfest" topic(s) and issues they
				want to solve. The contest's goal is to have four (4) pull requests
				(PRs) approved during October.
			</p>
			<h4>Mentors:</h4>
			<p>
				A mentor will be paired with a mentee (contributor or maintainer). They
				provide support through a 1:1, a pairing session, Slack, or whatever
				works best for the team!
			</p>
			<p>
				Learn more about this challenge in{' '}
				<a href="https://dev.to/virtualcoffee/hacktoberfest-2024-why-you-should-participate-4ffm">
					this blog post.
				</a>
			</p>
			<p>
				To view all of the details of this year's challenge,{' '}
				<Link href="/monthlychallenges/sept-2024">
					check out the September 2024 challenge page
				</Link>
				.
			</p>

			<h3 className="mt-4">☕🪑 Coffee Table Events</h3>
			<ul>
				<li>Tech Interview Study Group (Mondays at 4:00 PM ET)</li>
				<li>
					Accountabilibuddies (Tuesdays at 7:00 PM ET | Thursdays at 9:00 AM ET)
				</li>
				<li>The Pack Hunt (Tandem Job Hunting) (Wednesdays at 10:00 AM ET)</li>
				<li>
					Data Structures and Algorithms (DSA) Office Hours (Wednesdays at 4:00
					PM ET)
				</li>
				<li>Feelings Friday (Fridays at 8:00 PM ET)</li>
				<li>
					Frontend Friday Folks fighting CSSBattle.dev (Fridays at 11:00 AM ET)
				</li>
			</ul>

			<h3 className="mt-4">📅 Weekly Async Events</h3>
			<ul>
				<li>
					<strong>Mondays:</strong> Goal-setting post in{' '}
					<code>#goals-and-wins</code>
				</li>
				<li>
					<strong>Tuesdays:</strong> Trivia in <code>#game-night</code>
				</li>
				<li>
					<strong>Wednesdays:</strong> Midweek check-in in <code>#general</code>
				</li>
				<li>
					<strong>Fridays:</strong>{' '}
					<a href="https://twitter.com/VirtualCoffeeIO">X (formerly Twitter)</a>{' '}
					chat and gratitude post in <code>#general</code>
				</li>
			</ul>
			<ul>
				<li>
					<a href="https://github.com/orgs/Virtual-Coffee/discussions/1223">
						Practical Deep Learning Study Group
					</a>
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

			<h3 className="mt-5 mb-4">🎙️ The Podcast is Back!</h3>
			<ul>
				<li>
					<a href="https://virtualcoffee.io/podcast/remote-collaboration-tools-and-techniques">
						Remote Collaboration Tools and Techniques
					</a>
				</li>
				<li>
					<a href="https://virtualcoffee.io/podcast/how-to-build-trust-capital">
						How to Build Trust Capital
					</a>
				</li>
				<li>
					<a href="https://virtualcoffee.io/podcast/big-m-versus-little-m-mentorship">
						'Big M' versus 'Little m' Mentorship
					</a>
				</li>
				<li>
					<a href="https://virtualcoffee.io/podcast/how-to-make-a-positive-impact-during-hacktoberfest">
						How to Make a Positive Impact during Hacktoberfest
					</a>
				</li>
				<li>
					<a href="https://virtualcoffee.io/podcast/open-source-maintainer-challenges-and-benefits">
						Open Source Maintainer Challenges and Benefits
					</a>
				</li>
			</ul>

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
				joining the volunteer team, check out{' '}
				<Link href="/resources/virtual-coffee-handbook/get-involved/paths-to-leadership">
					some the roles
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
					<a href="https://dev.to/nickytonline/creating-your-first-github-copilot-extension-a-step-by-step-guide-28g0">
						Creating a GitHub Copilot Extension: A Step-by-Step Guide — Nick
						Taylor
					</a>
				</li>
				<li>
					<a href="https://ortelius.io/blog/2024/04/05/how-to-bake-an-ortelius-pi-part-1-the-hardware/">
						How to Bake an Ortelius Pi Part 1 | The Hardware — Sacha Wharton
					</a>
				</li>
			</ul>

			<h3>Videos</h3>
			<ul>
				<li>
					<a href="https://www.youtube.com/shorts/a_yw0Z0nbng">
						Never Forget a Command Again with this Windows Terminal Trick —
						Michael Jolley
					</a>
				</li>
			</ul>

			<div className="card my-5 border-primary">
				<div className="card-body">
					<h2 className="card-title text-primary mb-3">🏆 Member Wins</h2>
					<div className="card-text">
						<blockquote className="blockquote">
							<p className="mb-0">"Just got accepted to speak at CodeMash!"</p>
							<footer className="blockquote-footer">Brian</footer>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">"I hit my goal weight of 180."</p>
							<footer className="blockquote-footer">Justin</footer>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">
								"Did my very first Open-Source contribution last week."
							</p>
							<footer className="blockquote-footer">B Suraj</footer>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">
								"Exciting week—started a new contract-to-hire role and just
								received another job offer."
							</p>
							<footer className="blockquote-footer">Derek</footer>
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

			<h2 className="mt-5 mb-4">💻 Resource Highlights!</h2>
			<p>
				<a href="https://dev.to/virtualcoffee/hacktoberfest-2024-why-you-should-participate-4ffm">
					Hacktoberfest 2024: Why You Should Participate
				</a>{' '}
				— Ayu Adiati
			</p>

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
