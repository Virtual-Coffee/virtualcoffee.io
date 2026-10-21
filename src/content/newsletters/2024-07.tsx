import Link from 'next/link';
import LeadText from '@/components/content/LeadText';
import { resourceHref } from '@/util/resourceHref';

export const handle = {
	meta: {
		title: 'Virtual Coffee Newsletter, July 2024',
		description: 'Welcoming Community! 💝',
	},
	date: '2024-07-01',
	listTitle: 'July 2024',
};

export default function Issue() {
	return (
		<>
			<h2>Hey Friends!</h2>
			<LeadText>
				<p>
					We’re starting up the Welcome train yet again with a month all about
					welcoming New community members, making space for them, and sharing
					everything this community has to offer!
				</p>
			</LeadText>

			<hr />

			<h2>💞 Kindness and Gratitude</h2>
			<p>
				<em>Spotlighting some of the kindness happening in our community.</em>
			</p>
			<blockquote className="blockquote">
				<p className="mb-0">
					"I’m grateful for Jason for having me on the Tech Commute. It was the
					highlight of my week!"
				</p>
				<footer className="blockquote-footer">Bekah</footer>
			</blockquote>
			<blockquote className="blockquote">
				<p className="mb-0">
					"Thank you very much Andrea! I’m truly grateful for the invitation to
					be here!"
				</p>
				<footer className="blockquote-footer">Marina</footer>
			</blockquote>
			<blockquote className="blockquote">
				<p className="mb-0">
					"Grateful to Chad for the wise and encouraging words. It really
					brought me some peace."
				</p>
				<footer className="blockquote-footer">Kirk</footer>
			</blockquote>

			<hr />

			<h2 className="my-5">💡 What's happening at Virtual Coffee</h2>
			<h3 className="mb-4">June Recap: Mid-Year Check in!</h3>
			<p>
				We spent the month taking a step back, assessing where we were at, what
				our goals were and how to make strides to the future! Success is rarely
				linear, and sometime’s there’s value in taking a beat to make sure your
				current path is aligned with who you are, and where you want to be.
			</p>

			<h3 className="mb-4">July Challenge: Welcoming Community!</h3>
			<p>
				This challenge allows you to invite a friend to join our community.
				However, simply inviting someone is not enough! We encourage you to
				warmly welcome and support our new friends and demonstrate what Virtual
				Coffee is truly all about - a welcoming and supportive community!
			</p>
			<p>
				Learn more about this challenge in{' '}
				<a href="https://dev.to/virtualcoffee/monthly-challenge-welcoming-community-4d44">
					this blog post.
				</a>
			</p>
			<p>
				To view all of the details of this year's challenge,{' '}
				<Link href="/monthlychallenges/july-2024">
					check out the July 2024 challenge page
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
				<Link
					href={resourceHref(
						'/resources/virtual-coffee-handbook/get-involved/paths-to-leadership',
					)}
				>
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
					<a href="https://dev.to/cmcrawford2/learning-how-to-make-an-oliver-68m">
						Learning how to make an OLIVER — Cris Crawford
					</a>
				</li>
				<li>
					<a href="https://jonathanyeong.com/advice-for-effective-developers/">
						Advice for Effective Developers — Jonathan Yeong
					</a>
				</li>
				<li>
					<a href="https://approxhuman.substack.com/p/choosing-the-editor-for-the-next">
						Choosing the editor for the next decade — Rafi
					</a>
				</li>
			</ul>

			<h3>Videos</h3>
			<ul>
				<li>
					<a href="https://www.youtube.com/watch?v=IUTURgxpBUU">
						Tabs vs Spaces? Merge vs Rebase? Let’s settle it with
						confluent-kafka-javascript — Lucia Cerchie
					</a>
				</li>
				<li>
					<a href="https://www.youtube.com/watch?v=eR6kBYn5rbY">
						Dedicated IP on Digital Ocean’s App Platform — Chris DeMars
					</a>
				</li>
			</ul>

			<div className="card my-5 border-primary">
				<div className="card-body">
					<h2 className="card-title text-primary mb-3">🏆 Member Wins</h2>
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
				<a href="https://dev.to/virtualcoffee/monthly-challenge-welcoming-community-4d44">
					Monthly Challenge: Welcoming Community!
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
