import LeadText from '@/components/content/LeadText';
import Link from 'next/link';

const handle = {
	listTitle: 'Fall 2025: Preptember & Hacktoberfest!',
	meta: {
		title: 'Bi-Monthly Challenge for Fall 2025: Preptember & Hacktoberfest!',
		description:
			'Fall bi-month challenge -> Get ready for and participate in Hacktoberfest! September: prep and confidence building. October: contribute to open source.',
	},
	dates: ['2025-09-01', '2025-10-01'],
	hero: {
		heroHeader: '',
	},
};

export const metadata = handle.meta;

export default function Challenge() {
	return (
		<>
			<h1>
				<small>Bi-Monthly Challenge for Fall 2025:</small> Preptember &
				Hacktoberfest!
			</h1>

			<LeadText>
				This two-month challenge combines preparation and participation in open
				source.
				<p>
					<strong>September (Preptember)</strong>: Focus on helping maintainers
					polish their repositories and contributors gain confidence with our
					structured 4-week approach using our{' '}
					<Link href="/resources/developer-resources/open-source/maintainer-guide#repository-checklist">
						repository checklist
					</Link>{' '}
					and building skills through guided practice.
					<br />
					<strong>October (Hacktoberfest)</strong>: Put your preparation into
					action by contributing to open source projects during the official
					Hacktoberfest event.
				</p>
			</LeadText>

			<LeadText>
				We have a{' '}
				<a href="https://github.com/Virtual-Coffee/vc-preptember">
					Virtual Coffee Preptember repository
				</a>{' '}
				for you to add yourself as a Preptember participant and to list
				repositories that pass our repository checklist to be recommended for
				Hacktoberfest!
			</LeadText>

			<h2>Theme</h2>
			<p>
				<strong>September</strong>: Prep + Confidence Building - Get ready for
				open source!
			</p>
			<p>
				<strong>October</strong>: Hacktoberfest - Participate in open source,
				learn, and have fun!
			</p>

			<h2>Challenge</h2>
			<h3>September: Preptember</h3>
			<p>
				<strong>Goal</strong>: Help maintainers polish repos and contributors
				gain confidence through a structured 4-week approach.
			</p>

			<h3>October: Hacktoberfest</h3>
			<p>
				<strong>Goal</strong>: Complete four meaningful contributions during
				October. We have two tracks:
			</p>
			<ul>
				<li>
					<strong>Maintainers</strong>: Provide repositories with "
					<code>hacktoberfest</code>" topics and issues labeled "
					<code>hacktoberfest</code>"
				</li>
				<li>
					<strong>Contributors</strong>: Find repositories and solve issues to
					achieve four approved pull requests
				</li>
			</ul>

			<h2>Community Issue</h2>
			<p>
				<strong>Preptember Accountability Issue</strong> → members comment
				weekly with their wins + GIFs to celebrate progress and keep each other
				motivated.
			</p>

			<h2>Maintainers</h2>
			<p>
				Preparing your open-source project for contributions is one of the best
				ways to create a community of contributors that lasts beyond
				Hacktoberfest. Your repository should have a clear path for
				communication, a good explanation of how to run the project, and
				well-written issues.{' '}
				<Link href="/resources/developer-resources/open-source/maintainer-guide">
					Our guide
				</Link>{' '}
				will help you prepare your project to be added to the list of Virtual
				Coffee-endorsed projects for our Hacktoberfest Initiative.
			</p>

			<h2>Contributors</h2>
			<p>
				The first step in becoming a good contributor is navigating an
				open-source repository and understanding the time and effort maintainers
				put into ensuring their projects are welcoming to contributors. As we
				move into Hacktoberfest season, we can support maintainers in their
				efforts to onboard new contributors. To complete this monthly challenge,
				find an open-source repository you'd like to contribute to and evaluate
				it based on our{' '}
				<Link href="/resources/developer-resources/open-source/maintainer-guide#repository-checklist">
					repository checklist
				</Link>
				. If it doesn't meet our checklist requirements, add an issue or
				multiple issues, asking the maintainers to update the repository based
				on your feedback.
			</p>

			<h2>How to Participate</h2>

			<h3>September: Preptember Participation</h3>
			<LeadText>
				<p>
					Please take a look at our{' '}
					<Link href="/resources/developer-resources/open-source/maintainer-guide#repository-checklist">
						Repository Checklist
					</Link>
					. This guide contains everything we look for in a good open-source
					project.
				</p>
			</LeadText>
			<ul>
				<li>
					If you are new to open source, we have a{' '}
					<a href="https://github.com/Virtual-Coffee/vc-preptember">
						Virtual Coffee Preptember repository
					</a>{' '}
					for you to practice open source by adding yourself as Preptember
					participant.
				</li>
				<li>
					If you are participating in this month's challenge as a contributor,
					consider the items in our{' '}
					<Link href="/resources/developer-resources/open-source/maintainer-guide">
						repository checklist
					</Link>{' '}
					as you look at some possible open-source repositories to contribute
					to. If the repositories pass the checklist, add them to the
					repositories list in the{' '}
					<a href="https://github.com/Virtual-Coffee/vc-preptember">
						Virtual Coffee Preptember repository
					</a>
					.
				</li>
				<li>
					If you are participating as an open-source maintainer, use{' '}
					<Link href="/resources/developer-resources/open-source/maintainer-guide">
						our checklist
					</Link>{' '}
					as a guide to get your repository ready for contributions. Then add
					your project repository to the repository list in the{' '}
					<a href="https://github.com/Virtual-Coffee/vc-preptember">
						Virtual Coffee Preptember repository
					</a>
					.
				</li>
			</ul>

			<h3>Weekly Schedule</h3>

			<h4>Week 1: Repo Health Check</h4>
			<p>
				<strong>Focus</strong>: Use the maintainer checklist to review repos
				(README, LICENSE, CONTRIBUTING, issue/PR templates).
			</p>
			<ul>
				<li>
					Maintainers and contributors will review repositories using our
					checklist
				</li>
				<li>Members will share 1 thing they fixed or improved</li>
			</ul>

			<h4>Week 2: Good First Issues</h4>
			<p>
				<strong>Focus</strong>: Create/label beginner-friendly issues in VC or
				personal repos.
			</p>
			<ul>
				<li>Maintainers create and label beginner-friendly issues</li>
				<li>
					Contributors practice finding and commenting on approachable issues
				</li>
			</ul>

			<h4>Week 3: Docs & Guides</h4>
			<p>
				<strong>Focus</strong>: Add or update CONTRIBUTING.md, onboarding notes,
				or a setup guide.
			</p>
			<ul>
				<li>
					Emphasis on non-code contributions (typos, screenshots,
					clarifications)
				</li>
				<li>Improve documentation and contribution guidelines</li>
			</ul>

			<h4>Week 4: Promote your Project!</h4>
			<ul>
				<li>
					Maintainers share their projects in our{' '}
					<a href="https://github.com/Virtual-Coffee/vc-preptember">
						Virtual Coffee Preptember repository
					</a>{' '}
					(there will be a 2025 issue)
				</li>
				<li>Share a pitch, video, etc. in #hacktoberfest in Slack</li>
			</ul>

			<h3>Synchronous check-ins</h3>
			<p>
				Synchronous check-ins will begin the second Monday in September. You can
				find more info at <Link href="/events">virtualcoffee.io/events</Link>.
			</p>

			<h3>Weekly check-ins</h3>
			<p>
				Are you making progress? Let's check in on Mondays and Fridays in Slack.
			</p>
			<p>
				<strong>Example Goals for Week One</strong>
			</p>
			<ol>
				<li>
					<strong>Maintainers</strong> — Review your <code>README.md</code> and{' '}
					<code>CONTRIBUTING.md</code> files.
				</li>
				<li>
					<strong>Contributors</strong> — Look through your favorite repos to
					see if there's an issue you could create.
				</li>
			</ol>

			<h3>Completing the challenge!</h3>
			<p>
				To complete this challenge, post to our{' '}
				<a href="https://github.com/Virtual-Coffee/vc-preptember">
					Virtual Coffee Preptember repository
				</a>
				. There are two ways to complete this challenge:
			</p>
			<ol>
				<li>Add yourself as Preptember participant.</li>
				<li>
					Add repositories to the repositories list.
					<ul>
						<li>
							If the repository does meet{' '}
							<Link href="/resources/developer-resources/open-source/maintainer-guide#repository-checklist">
								the checklist
							</Link>{' '}
							requirements, post the repository in the{' '}
							<a href="https://github.com/Virtual-Coffee/vc-preptember">
								Virtual Coffee Preptember repository
							</a>
							.
						</li>
						<li>
							If the repository hasn't met the checklist requirements, post the
							repository and a link to the issue/issues you've added to prepare
							the repository for Hacktoberfest in the{' '}
							<code>#monthly-challenge</code> channel in Slack.
						</li>
					</ul>
				</li>
			</ol>

			<hr />

			<h2>October: Hacktoberfest Participation</h2>
			<p>
				After preparing in September, it's time to participate in the official
				Hacktoberfest! You can access your dashboard{' '}
				<a href="https://hacktoberfest.virtualcoffee.io/dashboard">here</a> if
				you've signed up for the VC Hacktoberfest Initiative.
			</p>

			<h3>Before Starting Hacktoberfest</h3>
			<p>
				<strong>Contributors</strong>
			</p>
			<ul>
				<li>
					Sign up on the{' '}
					<a href="https://hacktoberfest.com/">
						Hacktoberfest official website
					</a>
					.
				</li>
				<li>
					Check out repositories with the "<code>hacktoberfest</code>" topic and
					issues on GitHub with the "<code>hacktoberfest</code>" label.
				</li>
			</ul>

			<p>
				<strong>Maintainers</strong>
			</p>
			<p>
				Make sure you include "<code>hacktoberfest</code>" as a label in your
				project's topics section (found in the "About" section on your
				repository) or on the issues you want to opt-in to the event. That's how
				you opt-in to Hacktoberfest.
			</p>
			<p>
				<a href="https://hacktoberfest.com/participation#maintainers">
					Check out all of the Hacktoberfest guidelines on the official website
				</a>
				.
			</p>

			<h3>October Weekly Check-ins</h3>
			<p>
				Let's start the week with a check-in. You can find the check-ins in the{' '}
				<code>#monthly-challenge</code> channel in Slack. What are your goals
				for Hacktoberfest for the week? What support do you need? Do you plan on
				spending time in the <code>#co-working-room</code>, talking to a mentee,
				or answering questions in Slack as a maintainer?
			</p>

			<h3>Completing Hacktoberfest</h3>
			<p>
				To complete the Hacktoberfest challenge, you need to complete four
				meaningful contributions during October.
			</p>
			<p>
				Remember, VC is here to support you during Hacktoberfest but is not an
				official event partner. To complete the official Hacktoberfest, you must
				have four (4) pull requests (PRs) accepted.
			</p>

			<h3>Virtual Coffee Approved Repositories for Hacktoberfest</h3>
			<p>
				Check back in October for our curated list of Virtual Coffee approved
				repositories that will be ready for Hacktoberfest contributions!
			</p>

			<h3>Share Your Progress!</h3>
			<p>
				Share your progress in the <code>#monthly-challenge</code> channel in
				Slack. While no other platform is imposed, sharing on social media for
				more reach can be a good idea, but only if you are comfortable doing so.
				You can share on social media, in a personal blog, in a post on{' '}
				<a href="https://dev.to/">DEV.to</a>, you get the idea!
			</p>
			<p>
				Sharing every time some work is added is a good idea. Small progress is
				still progress. There is no need to write a detailed blog post. A social
				media post can be enough. For example, "
				<em>
					Today, I updated my README to give instructions on how to run my
					project.
				</em>
				"
			</p>

			<h3>What if I need help?</h3>
			<p>
				You can ask questions in the <code>#help-and-pairing</code> channel in
				Slack, ask for ideas in the <code>#open-source</code> channel, or join
				the <code>#co-working-room</code>. Asking for help is part of the
				process!
			</p>
			<p>And remember, we're always here to help. ❤️</p>

			<h2>Resources</h2>
			<h3>Virtual Coffee Resources</h3>
			<ul>
				<li>
					<Link href="/resources/developer-resources/open-source/maintainer-guide#repository-checklist">
						Virtual Coffee's repository checklist
					</Link>
				</li>
				<li>
					<a href="https://github.com/tkshill/Template/wiki/A-Starter-Guide-to-Open-Source-Project-Maintenance">
						A Starter Guide to Open Source Project Maintenance
					</a>
				</li>
				<li>
					<Link href="/resources/developer-resources/open-source">
						Open Source Resources
					</Link>
				</li>
			</ul>

			<h3>Other Resources</h3>
			<ul>
				<li>
					<a href="https://www.freecodecamp.org/news/git-and-github-workflow-for-open-source/">
						How to Contribute to Open-Source Projects – Git & GitHub Workflow
						for Beginners
					</a>
				</li>
				<li>
					<a href="https://www.freecodecamp.org/news/writing-good-commit-messages-a-practical-guide/">
						Writing Good Commit Messages, a Practical Guide
					</a>
				</li>
				<li>
					<a href="https://www.freecodecamp.org/news/how-to-contribute-to-open-source/">
						How to Contribute to Open Source Projects – Non-Technical Things You
						Should Know
					</a>
				</li>
			</ul>

			<h2>Recommended Courses</h2>
			<ul>
				<li>
					<a href="https://opensauced.pizza/learn/intro-to-oss">
						Intro to Open Source Course with OSS-Communities
					</a>
				</li>
				<li>
					<a href="https://opensauced.pizza/learn/becoming-a-maintainer">
						Becoming a Maintainer Course with OSS-Communities
					</a>
				</li>
			</ul>
		</>
	);
}
