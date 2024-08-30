import { Link } from '@remix-run/react';
import LeadText from '~/components/content/LeadText';

export const handle = {
	meta: {
		title: 'Virtual Coffee Newsletter, August 2024',
		description: 'Photography Challenge! 💝',
	},
	date: '2024-08-01',
	listTitle: 'August 2024',
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
					After a month of welcoming new community, we’re decided to take some
					time outside! As programmers, we spend all day in front of the screen.
					Let's get folks out and about!
				</p>
			</LeadText>

			<hr />

			<h2>💞 Kindness and Gratitude</h2>
			<p>
				<em>Spotlighting some of the kindness happening in our community.</em>
			</p>
			<blockquote className="blockquote">
				<p className="mb-0">
					"Grateful for folks in VC who gave me recommendations for todo list
					apps a few months ago."
				</p>
				<footer className="blockquote-footer">Brian</footer>
			</blockquote>
			<blockquote className="blockquote">
				<p className="mb-0">
					"Grateful for the things I have learnt by just listening in VC."
				</p>
				<footer className="blockquote-footer">Taiwo</footer>
			</blockquote>
			<blockquote className="blockquote">
				<p className="mb-0">
					"I am grateful to Andy and Justin for addressing my Visual Studio Code
					problem so quickly in <code>#help-and-pairing</code>. Problem solved!"
				</p>
				<footer className="blockquote-footer">Joan</footer>
			</blockquote>

			<hr />

			<h2 className="my-5">💡 What's happening at Virtual Coffee</h2>
			<h3 className="mb-4">July Recap: New Member Welcome!</h3>
			<p>
				We spent the month opening the space up to new members. Having an influx
				of new folks in the space keeps the community healthy, thriving, and
				moving forward. Cheers to all our new members!
			</p>

			<h3 className="mb-4">August Challenge: Photography Challenge!</h3>
			<p>
				This challenge asks the community to get outside! Go out into the world,
				have some great moments and then bring them back to share with the
				community. We’re more than our times behind the desk and we want to see
				all the cool things our members get up to. So we’re asking everyone to
				share those moments of joy and fun and happiness with each other, and
				turn the space into a place of inspiration, wonderment, and beauty.
			</p>
			<p>
				Learn more about this challenge in{' '}
				<a href="https://dev.to/virtualcoffee/monthly-challenge-photography-4g18">
					this blog post.
				</a>
			</p>
			<p>
				To view all of the details of this year's challenge,{' '}
				<Link to="/monthlychallenges/aug-2024">
					check out the August 2024 challenge page
				</Link>
				.
			</p>

			<h3 className="mt-4">☕🪑 Coffee Table Events</h3>
			<ul>
				<li>Tech Interview Study Group (Mondays at 4:00 PM ET)</li>
				<li>
					Accountabilibuddies (Tuesdays at 7:00 PM ET | Thursdays at 9:00 AM ET)
				</li>
				<li>The Pack Hunt (Tandem Job Hunting) (Wednesdays at 2:00 PM ET)</li>
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
					Mondays: Goal-setting post in <code>#goals-and-wins</code>
				</li>
				<li>
					Tuesdays: Trivia in <code>#game-night</code>
				</li>
				<li>
					Wednesdays: Midweek check-in in <code>#general</code>
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
					Async Twitter Chat (Weekly chat begins every Friday at 9:00 AM ET)
				</li>
			</ul>

			<p className="mt-4">
				<strong>Note:</strong> These are the currently scheduled times for these
				events at the time of this publication. Please check the official VC{' '}
				<code>#announcements</code> Slack channel, or other noted channels, for
				any updates and links to event rooms. For the full list of events, check
				out <Link to="/events">our events page</Link>.
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
				joining the volunteer team, check out{' '}
				<Link to="/resources/virtual-coffee-handbook/get-involved/paths-to-leadership">
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
					<a href="https://opensauced.pizza/blog/open-source-network-effects">
						The Compound Interest of Open Source: How Collaboration Leads to
						Growth — Bekah Hawrot Weigel
					</a>
				</li>
				<li>
					<a href="https://flottform.io/updates/2024-07-01-boosting-web-form-efficiency">
						Boosting web form efficiency — Jörn Bernhardt
					</a>
				</li>
			</ul>

			<h3>Videos</h3>
			<ul>
				<li>
					<a href="https://www.youtube.com/watch?v=gjmIbKyjpbo">
						Highlight: An Intro to Elixir — Brian Meeker and Nick Taylor
					</a>
				</li>
			</ul>

			<div className="card my-5 border-primary">
				<div className="card-body">
					<h2 className="card-title text-primary mb-3">🏆 Member Wins</h2>
					<div className="card-text">
						<blockquote className="blockquote">
							<p className="mb-0">
								"Pumped that I can announce that I’m giving a talk at Netlify
								Compose this year!"
							</p>
							<footer className="blockquote-footer">Nick Taylor</footer>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">
								"Added user accounts, a Library, ability to save stories for my
								kids story-generating app-launched today!"
							</p>
							<footer className="blockquote-footer">Mike Cavaliere</footer>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">
								"Got honorable mention in the "You're so Nashville. If.."
								contest ran by the local entertainment independent paper."
							</p>
							<footer className="blockquote-footer">Chris Jarvis</footer>
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

			<h2>💻 Resource Highlights!</h2>
			<p>
				<a href="https://dev.to/virtualcoffee/monthly-challenge-photography-4g18">
					Monthly Challenge: Photography
				</a>{' '}
				— Dominic Duffin
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
