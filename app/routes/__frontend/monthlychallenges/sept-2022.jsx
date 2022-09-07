import { json } from '@remix-run/node';
import { Link } from '@remix-run/react';
import LeadText from '~/components/content/LeadText';
import { createMetaData } from '~/util/createMetaData.server';

export const handle = {
	listTitle: 'September, 2022: Preptember!',
	meta: {
		title: 'Monthly Theme & Challenge for September, 2022: Preptember!',
		description:
			'September challenge -> Get ready for Hacktoberfest! This month, our member maintainers will cleanup their repos, and our members getting ready to contribute will be writing good issues.',
	},
	date: '2022-09-01',
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
				<small>Monthly Challenge for September, 2022:</small> Preptember! Get
				open source ready.
			</h1>

			<p className="lead">
				This month, we have two tracks. Maintainers will be reviewing their open
				source repos with{' '}
				<Link
					to={`/resources/open-source/maintainer-guide#repository-checklist`}
				>
					our checklist
				</Link>{' '}
				to make sure their projects are ready for Hacktoberfest contributions,
				and our contributors will be looking at their favorite repos, evaluating
				them based on the guide, and writing good issues as needed to fulfill
				the criteria.
			</p>

			<p>
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
				ways to create a community of contributors that last beyond
				Hacktoberfest. Your repository should have a clear path for
				communication, a good explanation of how to run the project, and clear
				issues.{' '}
				<Link
					to={`/resources/open-source/maintainer-guide#repository-checklist`}
				>
					Our guide
				</Link>{' '}
				will help you to not only prepare your project, but to be added to the
				list of Virtual Coffee endorsed projects for our Hacktoberfest
				Initiative.
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
				<Link
					to={`/resources/open-source/maintainer-guide#repository-checklist`}
				>
					repository checklist
				</Link>
				. If it doesn't meet our checklist requirements, add an issue or
				multiple issues asking the maintainers to update the repository based on
				your feedback.
			</p>

			<h2>How to Participate</h2>

			<LeadText>
				<p>
					Take a look at our{' '}
					<Link
						to={`/resources/open-source/maintainer-guide#repository-checklist`}
					>
						Repository Checklist
					</Link>
					. This guide contains all of the things we look for in a good
					open-source project.
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
				Are you making progress? Every Monday of the month, set your goals for
				the week and let's check-in on Fridays in slack.
			</p>

			<p>
				<strong>Example Goals for Week One</strong>
			</p>
			<ol>
				<li>
					<strong>Maintainers</strong> - Review your README and CONTRIBUTING.md
					files.
				</li>
				<li>
					<strong>Contributors</strong> - Look through your favorite repos to
					see if there's an issue you could create.
				</li>
			</ol>

			<h3>How do I share my progress?</h3>
			<p>
				Share your progress in the #monthly-challenge channel in Slack. While no
				other platform is imposed, it can be a good idea to also share on social
				media for more reach but only if you are comfortable to do so (Twitter
				using -or not- the hashtag #VCMonthlyChallenge, a personal blog, a post
				on <a href="https://dev.to/">DEV.to</a>, you get the idea).
			</p>

			<p>
				Sharing every time some work is added is a good idea, small progress is
				still progress. No need to write a detailed blog post: a 140 characters
				Tweet can be enough. For example:{' '}
				<i>
					Today I updated my README to give instructions on how to run my
					project.
				</i>
			</p>

			<h3>What if I need help?</h3>
			<p>
				You can ask a question in the #help-and-pairing VC channel, ask for
				ideas in the #open-source channel, or join the VC co-working room.
				Asking for help is part of the process!
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
					repository for Hacktoberfest under the heading ## Needs Updated.
				</li>
				<li>
					If the repository does meet the checklist requirements, post the
					repository in the{' '}
					<a href="https://github.com/Virtual-Coffee/virtualcoffee.io/discussions/624">
						discussion Hacktoberfest 2022 - Repositories we ❤️
					</a>
					. If you've verified they're participating in Hacktoberfest, add a
					note to your post and any additional information you feel is helpful
					for contributors.
				</li>
			</ol>

			<h2>Resources</h2>
			<ul>
				<li>
					The issue guide can be found pinned in our slack #monthly-challenge
					channel and{' '}
					<Link
						to={`/resources/open-source/maintainer-guide#repository-checklist`}
					>
						our maintainers checklist
					</Link>{' '}
					can be found as part of our Member Resources section on our site
				</li>
				<li>
					<a href="https://github.com/tkshill/Template/wiki/A-Starter-Guide-to-Open-Source-Project-Maintenance">
						A Starter Guide to Open Source Project Maintenance
					</a>
				</li>
				<li>
					<a href="https://hacktoberfest.digitalocean.com/faq/">
						Hacktoberfest FAQs
					</a>
				</li>
			</ul>
		</>
	);
}
