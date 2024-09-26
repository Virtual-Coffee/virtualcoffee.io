import Link from 'next/link';
import LeadText from '@/components/content/LeadText';
import { createMetaData } from '@/util/createMetaData.server';

const handle = {
	listTitle: 'September 2021: Preptember!',
	meta: {
		title: 'Monthly Theme & Challenge for September 2021: Preptember!',
		description:
			'September challenge -> Get ready for Hacktoberfest! This month, our member maintainers will clean up their repos, and our members getting ready to contribute will be writing good issues.',
	},
	date: '2021-09-01',
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
				the <Link href="/monthlychallenges/oct-2021">next challenge</Link>!
			</div>

			<h1>
				<small>Monthly Challenge for September 2021:</small> Preptember! Get
				open source ready.
			</h1>

			<LeadText>
				This month, we have two tracks. Our member maintainers will be reviewing
				their open source repos with{' '}
				<Link href="/resources/developer-resources/open-source/maintainer-guide#repository-checklist">
					our checklist
				</Link>{' '}
				to make sure their projects are ready for Hacktoberfest contributions,
				and our member contributors will be looking at their favorite repos and
				writing good issues as needed.
			</LeadText>

			<p className="mt-3">
				<strong>Challenge Team Leads & Facilitators</strong>: Aurelie Verrot &
				Andrew Bush
			</p>

			<hr />

			<h2>Theme</h2>
			<p>Get open source ready!</p>

			<h2>Challenge</h2>
			<p>
				<strong>Maintainers</strong>: Evaluate your open source project and
				complete the checklist before the end of September.
			</p>
			<p>
				<strong>Contributors</strong>: Following the guide, create and submit a
				good issue to one of your favorite open source repos.
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
				The first step in becoming a good contributor is being able to navigate
				an open source repository and understand the time and effort maintainers
				put in to making sure their projects are welcoming to contributors.
				Writing an issue ensures that you have an understanding of the
				communication process, you've done the work to make sure that the same
				issue doesn't exist, and you've clearly described the need for the issue
				and have provided any information or screenshots necessary to help
				others to understand how to navigate the issue. Remember, you don't have
				to have a solution. You just need to be able to explain the issue
				clearly.
			</p>

			<h2>How to Participate</h2>

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
				Slack, ask for ideas in the <code>#open-source</code> channel, or join
				the
				<code>#co-working-room</code>. Asking for help is part of the process!
			</p>
			<p>And remember, we're always here to help ❤️</p>

			<h3>Completing the Challenge!</h3>
			<p>
				Once you've completed the challenge, post a link to your issue in Slack
				or your open source repository{' '}
				<a href="https://github.com/Virtual-Coffee/virtualcoffee.io/discussions/321">
					in our discussion
				</a>
				.
			</p>

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
