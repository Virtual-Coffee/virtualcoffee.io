import Link from 'next/link';
import LeadText from '@/components/content/LeadText';

export const handle = {
	meta: {
		title: 'Virtual Coffee Newsletter, November 2024',
		description:
			"It's time to swap talking to the compiler to talking to people. Writing month is here! 💝",
	},
	date: '2024-11-01',
	listTitle: 'November 2024',
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
					We’re ready to write! Last month we went all in on Hacktoberfest and
					open-sourced our{' '}
					<a href="https://github.com/Virtual-Coffee/VC-Community-Docs">
						VC Community Docs
					</a>
					! Community members came together to maintain, contribute, and mentor
					to and for each other, all aligned on the goals of open-source
					empowerment and building community.
				</p>
				<p>
					And now we want to take some time as we approach the year’s end to
					write some thoughts. Our learning, our aspirations, our takeaways, our
					lessons. We believe that everyone has a story to tell and an audience
					that needs to hear that story.
				</p>
			</LeadText>

			<hr />

			<h2>💞 Kindness and Gratitude</h2>
			<p>
				<em>Spotlighting some of the kindness happening in our community.</em>
			</p>
			<blockquote className="blockquote">
				<p className="mb-0">
					"I’m very grateful to Brian for continuing the gratitude posts."
				</p>
				<footer className="blockquote-footer">Bekah</footer>
			</blockquote>
			<blockquote className="blockquote">
				<p className="mb-0">
					"Thanks everyone for all the birthday wishes, it makes me very
					grateful that I get to share my birthday with my vc versary here with
					all of you."
				</p>
				<footer className="blockquote-footer">Rad</footer>
			</blockquote>
			<blockquote className="blockquote">
				<p className="mb-0">
					"I believe I spotted Shelley in the chat at online talk for work
					today, thank you for coming!!!"
				</p>
				<footer className="blockquote-footer">Mark</footer>
			</blockquote>

			<hr />

			<h2 className="my-5">💡 What's happening at Virtual Coffee</h2>
			<h3 className="mb-4">October Recap: Hacktoberfest!</h3>
			<p>
				Every year since 2020, we’ve tried to get involved in some way with the
				Hacktoberfest initiative. Virtual Coffee aligns with the spirit and
				ethos of open source and tries every year to be an accessible avenue to
				learning, supporting, and tending to open-source projects. Shoutout to
				all the folks who participated in another successful Hacktoberfest!
			</p>

			<h3 className="mb-4">November is the time to write: 50k words!</h3>
			<p>
				This month, we're working together to blog 50,000 words! Based off the{' '}
				<a href="https://nanowrimo.org/">
					NaNoWriMo (National Novel Writing Month) Challenge
				</a>
				, we'll be doing the tech and non-tech take on writing and working
				together towards the goal while posting on our own blogs.
			</p>
			<p>Get those blog posts up!</p>

			<h4 className="my-4">How to Participate</h4>
			<p>
				Once you've written and published your content,{' '}
				<a href="https://airtable.com/app10kd5ewHiLTjxn/shrgRjUFpNjLN1V12">
					add your entry to our VC NaNoWriMo entry form
				</a>
				!
			</p>

			<h4 className="my-4">
				What kind of content counts towards the challenge?
			</h4>
			<p>
				Any tech-related or non-tech blog posts, articles, or novels published
				in November! For tech-related posts, feel free to include code samples
				in your word count totals (if it's a word and you wrote it, we'll count
				it 😊).
			</p>
			<p>
				While we love good documentation here at Virtual Coffee,{' '}
				<code>README</code> docs or anything else you would typically consider
				documentation, don't count for this challenge.
			</p>

			<h4 className="my-4">What if I'm not confident about my writing?</h4>
			<p>
				We all start somewhere. The more you practice, the better you'll get. We
				have volunteers willing to proofread and give you feedback on your
				writing. Just put a link to your draft in the{' '}
				<code>#monthly-challenge</code> or <code>#content-creation</code>{' '}
				channel and ask for the help you need.
			</p>

			<h4 className="my-4">What if I don't know what to write about?</h4>
			<p>
				We've got you covered with extensive topic lists in{' '}
				<a href="https://github.com/orgs/Virtual-Coffee/discussions/711">
					this discussion
				</a>{' '}
				and{' '}
				<a href="https://github.com/orgs/Virtual-Coffee/discussions/458">
					this discussion
				</a>
				.
			</p>
			<p className="mt-4">
				Find more resources, and see past challenges on our{' '}
				<Link href="/monthlychallenges">monthly challenge page</Link>. Learn
				more about this challenge in{' '}
				<a href="https://dev.to/virtualcoffee/monthly-challenge-blogging-challenge-35o4">
					this blog post.
				</a>
			</p>
			<p>
				To view all of the details of this year's challenge,{' '}
				<Link href="/monthlychallenges/nov-2024">
					check out the November 2024 challenge page
				</Link>
				.
			</p>
			<p>And remember, we're always here to help ❤️</p>

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
					<a href="https://virtualcoffee.io/podcast/building-relationships-in-open-source">
						Building Relationships in Open Source
					</a>
				</li>
				<li>
					<a href="https://virtualcoffee.io/podcast/climbing-the-contributor-ladder">
						Climbing the Contributor Ladder
					</a>
				</li>
				<li>
					<a href="https://virtualcoffee.io/podcast/open-sourcing-a-private-repo">
						Open Sourcing a Private Repo
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
					<a href="https://dev.to/alexcurtisslep/css-masonry-catness-2nhj">
						CSS Masonry Catness — Alex Curtis-Slep
					</a>
				</li>
				<li>
					<a href="https://dev.to/nerajno/11-things-learnt-from-being-on-board-from-11-months-7d2">
						11 in 11: Concepts Learnt or Relearnt from Zero Day — Nerando
						Johnson
					</a>
				</li>
			</ul>

			<h3>Videos</h3>
			<ul>
				<li>
					<a href="https://www.youtube.com/watch?v=hSotPlaVxjg">
						Slots, Slots, Slots, Everybody! — Abbey Perini
					</a>
				</li>
			</ul>

			<div className="card my-5 border-primary">
				<div className="card-body">
					<h2 className="card-title text-primary mb-3">🏆 Member Wins</h2>
					<div className="card-text">
						<blockquote className="blockquote">
							<p className="mb-0">
								"Not a work win, but... Big news—I made it to the final round of
								the NPO Concerto Competition!"
							</p>
							<footer className="blockquote-footer">Lex</footer>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">
								"Got a PR merged today, which took me several weeks of working
								through!"
							</p>
							<footer className="blockquote-footer">Eddie</footer>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">
								"I merged a big-for-me PR yesterday, the intersection points of
								two splines."
							</p>
							<footer className="blockquote-footer">Cris</footer>
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
				<a href="https://dev.to/virtualcoffee/monthly-challenge-blogging-challenge-35o4">
					Monthly Challenge: 50,000 Word Blogging Challenge
				</a>{' '}
				— Chris Jarvis
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
