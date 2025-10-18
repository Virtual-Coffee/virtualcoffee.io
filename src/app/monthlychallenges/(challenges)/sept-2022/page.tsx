import Link from 'next/link';
import LeadText from '@/components/content/LeadText';

const handle = {
	listTitle: 'September 2022: Preptember!',
	meta: {
		title: 'Monthly Theme & Challenge for September 2022: Preptember!',
		description:
			'September challenge -> Get ready for Hacktoberfest! This month, our member maintainers will clean up their repos, and our members getting ready to contribute will be writing good issues.',
	},
	date: '2022-09-01',
	hero: {
		heroHeader: '',
	},
};

export const metadata = handle.meta;

export default function Challenge() {
	return (
		<>
			<div className="alert alert-success">
				This monthly challenge is complete. Congratulations! Please join us for
				the <Link href="/monthlychallenges/oct-2022">next challenge</Link>!
			</div>

			<h1>
				<small>Monthly Challenge for September 2022:</small> Preptember! Get
				open source ready.
			</h1>

			<LeadText>
				This month, we have two tracks. Maintainers will be reviewing their open
				source repos with{' '}
				<Link href="/resources/developer-resources/open-source/maintainer-guide#repository-checklist">
					our checklist
				</Link>{' '}
				to make sure their projects are ready for Hacktoberfest contributions,
				and our contributors will be looking at their favorite repos, evaluating
				them based on the guide, and writing good issues as needed to fulfill
				the criteria.
			</LeadText>

			<p className="mt-3">
				<strong>Challenge Team Leads & Facilitators</strong>: BekahHW & Dan Ott
			</p>

			<hr />

			<h2>Theme</h2>
			<p>Get ready for open source!</p>

			<h2>Challenge</h2>
			<p>
				<strong>Maintainers</strong>: Evaluate your open source project and
				complete the checklist before the end of September.
			</p>
			<p>
				<strong>Contributors</strong>: Following the guide, evaluate an
				open-source project to VC-verify it as a good project to contribute to.
				If the repository doesn't meet our standards, create and submit good
				issues to suggest updates.
			</p>

			<h2>Maintainers</h2>
			<p>
				Preparing your open source project for contributions is one of the best
				ways to create a community of contributors that lasts beyond
				Hacktoberfest. Your repository should have a clear path for
				communication, a good explanation of how to run the project, and clear
				issues.{' '}
				<Link href="/resources/developer-resources/open-source/maintainer-guide">
					Our guide
				</Link>{' '}
				will help you prepare your project and be added to the list of Virtual
				Coffee endorsed projects for our Hacktoberfest Initiative.
			</p>

			<h2>Contributors</h2>
			<p>
				The first step in becoming a good contributor is navigating an open
				source repository and understanding the time and effort maintainers put
				into ensuring their projects are welcoming to contributors. As we move
				into Hacktoberfest season, we can support maintainers in their efforts
				to onboard new contributors. To complete this monthly challenge, find an
				open source repository you'd like to contribute to and evaluate it based
				on our{' '}
				<Link href="/resources/developer-resources/open-source/maintainer-guide#repository-checklist">
					repository checklist
				</Link>
				. If it doesn't meet our checklist requirements, add an issue or
				multiple issues, asking the maintainers to update the repository based
				on your feedback.
			</p>

			<h2>How to Participate</h2>

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
					If you are participating in this month's challenge as a contributor,
					consider these items as you look at some possible open-source
					repositories to contribute to.
				</li>
				<li>
					If you are participating as an open-source maintainer, use this
					checklist as a guide to get your repository ready for contributions.
				</li>
			</ul>

			<h3>Weekly check-ins</h3>
			<p>
				Are you making progress? Every Monday of the month, set your weekly
				goals and let's check-in on Fridays in Slack.
			</p>

			<p>
				<strong>Example Goals for Week One</strong>
			</p>
			<ol>
				<li>
					<strong>Maintainers</strong> — Review your README and CONTRIBUTING.md
					files.
				</li>
				<li>
					<strong>Contributors</strong> — Look through your favorite repos to
					see if there's an issue you could create.
				</li>
			</ol>

			<h3>How do I share my progress?</h3>
			<p>
				Share your progress in the <code>#monthly-challenge</code> channel in
				Slack. While no other platform is imposed, sharing on social media for
				more reach can be a good idea, but only if you are comfortable doing so.
				You can share on Twitter using — or not — the hashtag
				<code>#VCMonthlyChallenge</code>, a personal blog, a post on{' '}
				<a href="https://dev.to/">DEV.to</a>, you get the idea!
			</p>

			<p>
				Sharing every time some work is added is a good idea. Small progress is
				still progress. There is no need to write a detailed blog post. A
				140-characters Tweet can be enough. For example, "
				<em>
					Today, I updated my README to give instructions on how to run my
					project.
				</em>
				"
			</p>

			<h3>What if I need help?</h3>
			<p>
				You can ask questions in the <code>#help-and-pairing</code> channel in
				Slack, ask for ideas in the <code>#open-source channel</code>, or join
				the <code>#co-working-room</code>. Asking for help is part of the
				process!
			</p>
			<p>And remember, we're always here to help ❤️</p>

			<h3>Completing the challenge!</h3>
			<p>
				To complete this challenge, you need to post to our{' '}
				<a href="https://github.com/orgs/Virtual-Coffee/discussions/624">
					Hacktoberfest 2022 discussion
				</a>
				. There are two ways to complete this challenge:
			</p>
			<ol>
				<li>
					If the repository hasn't met the checklist requirements, post the
					repository and a link to the issue/issues you've added to prepare the
					repository for Hacktoberfest under the heading{' '}
					<code>## Needs Updated</code>.
				</li>
				<li>
					If the repository does meet the checklist requirements, post the
					repository in the{' '}
					<a href="https://github.com/Virtual-Coffee/virtualcoffee.io/discussions/624">
						discussion Hacktoberfest 2022 - Repositories we ❤️
					</a>
					. If you've verified they're participating in Hacktoberfest, add a
					note to your post, and any additional information you feel is helpful
					for contributors.
				</li>
			</ol>

			<h2>Resources</h2>
			<ul>
				<li>
					The issue guide is pinned in our Slack <code>#monthly-challenge</code>{' '}
					channel, and you can find our maintainers' checklist{' '}
					<Link href="/resources/developer-resources/open-source/maintainer-guide#repository-checklist">
						here
					</Link>{' '}
					as part of our Member Resources section on our site.
				</li>
				<li>
					<a href="https://github.com/tkshill/Template/wiki/A-Starter-Guide-to-Open-Source-Project-Maintenance">
						A Starter Guide to Open Source Project Maintenance
					</a>
				</li>
				<li>
					<a href="https://hacktoberfest.com/participation/">
						Hacktoberfest participation
					</a>
				</li>
			</ul>
		</>
	);
}
