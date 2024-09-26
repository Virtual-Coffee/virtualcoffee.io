import { Link } from '@remix-run/react';
import LeadText from '~/components/content/LeadText';

export const handle = {
	meta: {
		title: 'Virtual Coffee Newsletter, September 2024',
		description: 'Preptember! Getting geared up for all things Open Source. 💝',
	},
	date: '2024-09-01',
	listTitle: 'September 2024',
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
					After a month of sharing some amazing outdoor and pet adventures,
					we’re finally to get into the best season of the year, Open Source
					season. September is Preptember, where we get ready for all things
					Hacktoberfest in October!
				</p>
			</LeadText>

			<hr />

			<h2>💞 Kindness and Gratitude</h2>
			<p>
				<em>Spotlighting some of the kindness happening in our community.</em>
			</p>
			<blockquote className="blockquote">
				<p className="mb-0">
					"I big thank you to our monthly challenge leads, Ayu and Dominic, for
					this new photography monthly challenge."
				</p>
				<footer className="blockquote-footer">Bekah</footer>
			</blockquote>
			<blockquote className="blockquote">
				<p className="mb-0">
					"Thank you so much to Michael, Brian, Alex, and Ray for your help with
					troubleshooting my issue!"
				</p>
				<footer className="blockquote-footer">Meg</footer>
			</blockquote>
			<blockquote className="blockquote">
				<p className="mb-0">"I'm incredibly thankful for this group."</p>
				<footer className="blockquote-footer">Alexander</footer>
			</blockquote>

			<hr />

			<h2 className="my-5">💡 What's happening at Virtual Coffee</h2>
			<h3 className="mb-4">August Recap: Photography Challenge!</h3>
			<p>
				The August challenge asked the community to get outside! Go out into the
				world, have some great moments and then bring them back to share with
				the community. We’re more than our times behind the desk and we wanted
				to see all the cool things our members get up to. We asked everyone to
				share those moments of joy and fun and happiness with each other, and
				turn the space into a place of inspiration, wonderment, and beauty.
			</p>
			<p>
				Also, pets! We asked the community to flood our challenge channels with
				pics of their lovely pets and boy did they deliver! It was absolutely
				lovely and probably a much needed fun time for the team.
			</p>
			<p>
				Learn more about this challenge in{' '}
				<em>
					<a href="https://dev.to/virtualcoffee/monthly-challenge-photography-4g18">
						this blog post
					</a>
				</em>
				.
			</p>

			<h3 className="mb-4">
				September Challenge: Preptember! Getting ready for Open Source!
			</h3>
			<p>
				Get ready for Hacktoberfest! This month, our member maintainers will
				clean up their repos, and our members getting ready to contribute will
				be writing good issues. We’ve made resources for Maintainers and
				Contributors so everyone has a clear path and avenue to success!
			</p>
			<h4>Maintainers:</h4>
			<ul>
				<li>
					Evaluate your open-source project and complete{' '}
					<Link to="/resources/developer-resources/open-source/maintainer-guide#repository-checklist">
						the checklist
					</Link>{' '}
					before the end of September.
				</li>
				<li>
					List your open-source project in our{' '}
					<a href="https://github.com/Virtual-Coffee/vc-preptember">
						Virtual Coffee Preptember repository
					</a>{' '}
					after it passes our repository checklist.
				</li>
			</ul>
			<h4>Contributors:</h4>
			<ul>
				<li>
					Add yourself as a Preptember participant in our{' '}
					<a href="https://github.com/Virtual-Coffee/vc-preptember">
						Virtual Coffee Preptember repository
					</a>
					.
				</li>
				<li>
					Following{' '}
					<Link to="/resources/developer-resources/open-source/maintainer-guide">
						the guide
					</Link>
					, evaluate an open-source project to VC-verify it as a good project to
					contribute to. If the repository doesn't meet our standards, create
					and submit good issues to suggest updates.
				</li>
				<li>
					List the repository in our{' '}
					<a href="https://github.com/Virtual-Coffee/vc-preptember">
						Virtual Coffee Preptember repository
					</a>{' '}
					after it passes our repository checklist.
				</li>
			</ul>
			<p>
				Learn more about this challenge in{' '}
				<a href="https://dev.to/virtualcoffee/preptember-preparing-for-a-successful-hacktoberfest-5baa">
					this blog post.
				</a>
			</p>
			<p>
				To view all of the details of this year's challenge,{' '}
				<Link to="/monthlychallenges/sept-2024">
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
					<a href="https://opensauced.pizza/blog/effective-open-source-contribution-guide">
						Unlocking Open Source Success: The Art of Effective Open Source
						Contribution — Bekah Hawrot Weigel
					</a>
				</li>
				<li>
					<a href="https://www.linkedin.com/posts/satoshi-89bb58a8_200-students-in-lessons-learned-from-metas-activity-7226247907639746560-RUpH">
						Experiences in the Meta Production Engineer pre-internship program —
						Satoshi Shirosaka
					</a>
				</li>
			</ul>

			<h3>Videos</h3>
			<ul>
				<li>
					<a href="https://www.youtube.com/shorts/aEjzGmGq4vE">
						Advanced Paste in PowerToys is About to Change Your Productivity
						Forever — Michael Jolley
					</a>
				</li>
				<li>
					<a href="https://www.youtube.com/watch?v=XesdKt4J6Zc">
						Understanding and Implementing a Conditional Random Field in Python
						— Eddie Banner
					</a>
				</li>
			</ul>

			<div className="card my-5 border-primary">
				<div className="card-body">
					<h2 className="card-title text-primary mb-3">🏆 Member Wins</h2>
					<div className="card-text">
						<blockquote className="blockquote">
							<p className="mb-0">
								"Glad to share that my article about sharing data between
								components in Angular got included in the featured section in
								Hashnode."
							</p>
							<footer className="blockquote-footer">Naz</footer>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">
								"Finally made myself sit down and create a rough draft of my
								talk at Elixir Conf in a couple of weeks."
							</p>
							<footer className="blockquote-footer">Brian</footer>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">
								"Finished a demo shown at BlackHat in Vegas last week!"
							</p>
							<footer className="blockquote-footer">Klesta</footer>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">
								"Here's a win I've been striving for for a while: I just
								received my 50th 5-star review for Twelfth Night DJ."
							</p>
							<footer className="blockquote-footer">Rolando</footer>
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
				<a href="https://dev.to/virtualcoffee/preptember-preparing-for-a-successful-hacktoberfest-5baa">
					Preptember: Preparing for a Successful Hacktoberfest
				</a>{' '}
				— Bekah Hawrot Weigel
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
