import { json } from '@remix-run/node';
import { Link } from '@remix-run/react';
import LeadText from '~/components/content/LeadText';
import { createMetaData } from '~/util/createMetaData.server';

export const handle = {
	listTitle: 'September 2023: Preptember!',
	meta: {
		title: 'Monthly Theme & Challenge for September 2023: Preptember!',
		description:
			'September challenge -> Get ready for Hacktoberfest! This month, our member maintainers will clean up their repos, and our members getting ready to contribute will be writing good issues.',
	},
	date: '2023-09-01',
	hero: {
		heroHeader: '',
	},
};

export async function loader() {
	const { title, description } = handle.meta;
	return json({
		meta: createMetaData({ title, description }),
	});
}

export function meta({ data: { meta } = {} } = {}) {
	return meta;
}

export default function Challenge() {
	return (
		<>
			<h1>
				<small>Monthly Challenge for September 2023:</small> Preptember! Get
				open source ready.
			</h1>

			<LeadText>
				This month, we have two tracks. Maintainers will review their
				open-source repos with our{' '}
				<Link to="/resources/developer-resources/open-source/maintainer-guide#repository-checklist">
					repository checklist
				</Link>{' '}
				to ensure their projects are ready for Hacktoberfest contributions.
				Contributors will look at their favorite repos, evaluate them based on
				the guide, and write good issues to fulfill the criteria.
			</LeadText>

			<br />

			<LeadText>
				New for this year, we also have a{' '}
				<a href="https://github.com/Virtual-Coffee/vc-preptember">
					Virtual Coffee Preptember repository
				</a>{' '}
				for you to add yourself as Preptember participant and to list
				repositories that pass our repository checklist to be recommended for
				Hacktoberfest!
			</LeadText>

			<p className="mt-3">
				<strong>Challenge Team Leads & Facilitators</strong>: BekahHW, Dan Ott,
				Ayu Adiati & Dominic Duffin
			</p>
			<hr />
			<h2>Theme</h2>
			<p>Get ready for open source!</p>
			<h2>Challenge</h2>
			<p>
				<strong>Maintainers</strong>:
			</p>
			<ul>
				<li>
					Evaluate your open-source project and complete{' '}
					<Link to="/resources/developer-resources/open-source/maintainer-guide">
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
			<p>
				<strong>Contributors</strong>:
			</p>
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

			<h2>Maintainers</h2>
			<p>
				Preparing your open-source project for contributions is one of the best
				ways to create a community of contributors that lasts beyond
				Hacktoberfest. Your repository should have a clear path for
				communication, a good explanation of how to run the project, and clear
				issues.{' '}
				<Link to="/resources/developer-resources/open-source/maintainer-guide">
					Our guide
				</Link>{' '}
				will help you prepare your project and be added to the list of Virtual
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
				<Link to="/resources/developer-resources/open-source/maintainer-guide#repository-checklist">
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
					<Link to="/resources/developer-resources/open-source/maintainer-guide#repository-checklist">
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
					<Link to="/resources/developer-resources/open-source/maintainer-guide">
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
					<Link to="/resources/developer-resources/open-source/maintainer-guide">
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
			<h3>Weekly check-ins</h3>
			<p>
				Are you making progress? Set your weekly goals every Monday during
				September, and let's check in on Fridays in Slack.
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
			<h3>How do I share my progress?</h3>
			<p>
				Share your progress in the <code>#monthly-challenge</code> channel in
				Slack. While no other platform is imposed, sharing on social media for
				more reach can be a good idea, but only if you are comfortable doing so.
				You can share on Twitter using — or not — the hashtag{' '}
				<code>#VCMonthlyChallenge</code>, a personal blog, a post on{' '}
				<a href="https://dev.to/">DEV.to</a>, you get the idea!
			</p>
			<p>
				Sharing every time some work is added is a good idea. Small progress is
				still progress. There is no need to write a detailed blog post. A
				140-character Tweet can be enough. For example, "
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
			<p>And remember, we're always here to help ❤️</p>
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
							<Link to="/resources/developer-resources/open-source/maintainer-guide#repository-checklist">
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
			<h2>Resources</h2>
			<ul>
				<li>
					<Link to="/resources/developer-resources/open-source/maintainer-guide#repository-checklist">
						Virtual Coffee's repository checklist
					</Link>
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
