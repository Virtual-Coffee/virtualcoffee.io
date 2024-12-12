import Link from 'next/link';
import LeadText from '@/components/content/LeadText';

export const handle = {
	meta: {
		title: 'Virtual Coffee Newsletter, December 2024',
		description:
			"It's time to get back to the things we love. Creative Community is here! 💝",
	},
	date: '2024-12-01',
	listTitle: 'December 2024',
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
					Time for some hobbies! Last month, we went all in on writing articles
					and sharing our words with a wider audience. But now, at the end of
					the year, we want to take some time for our passions, hobbies, games,
					and the little things that provide us joy.
				</p>
			</LeadText>

			<hr />

			<h2>💞 Kindness and Gratitude</h2>
			<p>
				<em>Spotlighting some of the kindness happening in our community.</em>
			</p>
			<blockquote className="blockquote">
				<p className="mb-0">
					"I just signed an offer letter! Super grateful for that, but also for
					this wonderful community and all the advice and encouragement they've
					been giving me through this process. Thank you all!"
				</p>
				<footer className="blockquote-footer">Micha</footer>
			</blockquote>
			<blockquote className="blockquote">
				<p className="mb-0">
					"Super grateful for the Thursday coffee chat. It confirmed the benefit
					of a lot of ideas I had, which served me well in an interview."
				</p>
				<footer className="blockquote-footer">Ryan</footer>
			</blockquote>
			<blockquote className="blockquote">
				<p className="mb-0">
					"I'm grateful for Ethan! A few weekends ago I went to Miami for the
					weekend and he let me stay with him and showed me around - it was a
					great time!"
				</p>
				<footer className="blockquote-footer">Eddie</footer>
			</blockquote>

			<hr />

			<h2 className="my-5">💡 What's happening at Virtual Coffee</h2>
			<h3 className="mb-4">November Recap: Writing!</h3>
			<p>
				Based on the NaNoWriMo (National Novel Writing Month) Challenge, this
				challenge was the tech and non-tech take on writing and working together
				towards a collective goal while posting on our own blogs. Thank you to
				all the community members who participated!
			</p>
			<p>
				To view all of the details of how this year's challenge went,{' '}
				<Link href="/monthlychallenges/nov-2024">
					check out the November 2024 challenge page
				</Link>
				.
			</p>

			<h3 className="mb-4">December is the time for fun!</h3>
			<p>
				<em>Let's make some space for the other parts of ourselves.</em>
			</p>
			<p>
				Devs are more than just the code we write. This challenge is all about
				embracing self-expression. Give back to yourself by indulging in
				something just for fun! Share the art, music, poetry, sports, games, or
				other hobbies that spark your joy. We spend so much time grinding away
				on understanding things in the tech space. Let's make some space for the
				other parts of ourselves! In this challenge, we encourage you to spend
				time working on things that aren't necessarily code-specific or using
				code to improve your other hobbies and outlets.
			</p>
			<p>
				Learn more about this challenge in{' '}
				<a href="https://dev.to/virtualcoffee/monthly-challenge-creative-community-challenge-273l">
					this blog post.
				</a>
			</p>
			<p>
				To view all of the details of this year's challenge,{' '}
				<Link href="/monthlychallenges/dec-2024">
					check out the December 2024 challenge page
				</Link>
				.
			</p>
			<p>And remember, we're always here to help. ❤️</p>

			<h3 className="mt-4">☕🪑 Coffee Table Events</h3>
			<ul>
				<li>Tech Interview Study Group (Mondays at 4:00 PM ET)</li>
				<li>
					Accountabilibuddies (Tuesdays at 7:00 PM ET | Thursdays at 9:00 AM ET)
				</li>
				<li>
					The Pack Hunt (Tandem Job Hunting) (Wednesdays at 10:00 AM ET |
					Wednesdays at 10:00 PM ET)
				</li>
				<li>
					Data Structures and Algorithms (DSA) Office Hours (Wednesdays at 4:00
					PM ET)
				</li>
				<li>
					Frontend Friday Folks fighting CSSBattle.dev (Fridays at 11:00 AM ET)
				</li>
				<li>Feelings Friday (Fridays at 8:00 PM ET)</li>
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
			<p>
				Check out our{' '}
				<a href="https://virtualcoffee.io/podcast">
					latest podcasts from season 10
				</a>
				!
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
				<Link href="/resources/virtual-coffee-handbook/get-involved/paths-to-leadership">
					some of the roles
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
					<a href="https://lo-victoria.com/the-ultimate-networking-guide-for-programmers">
						The Ultimate Networking Guide for Programmers — Victoria Lo
					</a>
				</li>
				<li>
					<a href="https://dev.to/nehamaity/how-i-spent-my-time-after-getting-laid-off-security-python-and-a-career-shift-3cpf">
						How I Spent My Time After Getting Laid Off — Neha Maity
					</a>
				</li>
				<li>
					<a href="https://dev.to/theoriginalbpc/2024-recap-why-accessibility-is-important-43n9">
						Why Accessibility Is Important — Sarah Dye
					</a>
				</li>
				<li>
					<a href="https://dev.to/david001/sophisticated-speech-to-text-47jm">
						Sophisticated Speed to Text — David Akim
					</a>
				</li>
				<li>
					<a href="https://dev.to/michaella23/lessons-growth-and-goodbyes-my-time-with-scrimba-bootcamp-1787">
						Lessons, Growth, and Goodbyes: My Time With Scrimba Bootcamp — Micha
						Rodriguez
					</a>
				</li>
			</ul>

			<div className="card my-5 border-primary">
				<div className="card-body">
					<h2 className="card-title text-primary mb-3">🏆 Member Wins</h2>
					<div className="card-text">
						<blockquote className="blockquote">
							<p className="mb-0">
								"Have to settle a few details, but I got approval from my
								manager to enroll in a class here at CMU next spring."
							</p>
							<footer className="blockquote-footer">Josh</footer>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">
								"Today I reached 600 Kata in Codewars and halfway to 4 kyu! The
								more 7 kyu difficulty problems I do, the more JavaScript
								concepts make sense."
							</p>
							<footer className="blockquote-footer">Aaron</footer>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">
								"My article got in top 7 must read DEV articles."
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
				<a href="https://dev.to/virtualcoffee/monthly-challenge-creative-community-challenge-273l">
					Monthly Challenge: Creative Community
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
