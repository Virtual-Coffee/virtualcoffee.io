import { json } from '@remix-run/node';
import { createMetaData } from '~/util/createMetaData.server';
import { Link, useLoaderData } from '@remix-run/react';
import { getChallengeData } from '~/data/monthlyChallenges/oct-2022';
import LeadText from '~/components/content/LeadText';

export const handle = {
	listTitle: 'October 2022: Hacktoberfest!',
	meta: {
		title: 'Monthly Theme & Challenge for October 2022: Hacktoberfest!',
		description:
			'October challenge -> Participate to Hacktoberfest! This month, our members will participate to the DigitalOcean Hacktoberfest by being maintainers, contributors, or mentors.',
	},
	date: '2022-10-01',
	hero: {
		heroHeader: '',
	},
};

export async function loader() {
	const { title, description } = handle.meta;

	const repos = await getChallengeData();

	return json({
		repos,
		meta: createMetaData({ title, description }),
	});
}

export function meta({ data: { meta } = {} } = {}) {
	return meta;
}

export default function Challenge() {
	const { repos } = useLoaderData();

	return (
		<>
			<div className="alert alert-success">
				This monthly challenge is complete. Congratulations! Please join us for
				the <Link to="/monthlychallenges">next challenge</Link>!
			</div>

			<h1>
				<small>Monthly Challenge for October 2022:</small> It's Hacktoberfest!
				Participate in open source, learn, and have fun!
			</h1>

			<LeadText>
				This month, we have three tracks: maintainers will provide issues
				labeled for Hacktoberfest, contributors will solve issues, and mentors
				will help contributors and maintainers be successful.
			</LeadText>

			<p className="mt-3">
				<strong>Challenge Team Leads & Facilitators:</strong> BekahHW & Dan Ott
			</p>

			<hr />

			<h2>Theme</h2>
			<p>The 2022 Hacktoberfest!</p>

			<h2>Challenge</h2>

			<strong>Maintainers</strong>
			<p>
				They provide issues labeled Hacktoberfest on their repository(ies),
				review the pull requests (PRs) for these issues, and validate and merge
				following the rules of the contest. They also answer the contributors'
				questions.
			</p>

			<strong>Contributors</strong>
			<p>
				They find issues labeled Hacktoberfest they want to solve. The goal of
				the contest is to have four (4) pull requests (PRs) validated during
				October.
			</p>

			<strong>Mentors</strong>
			<p>
				A mentor will be paired with a mentee (contributor or maintainer). They
				provide support either on Slack, during a 1:1, a pairing session, or
				whatever works best for the team!
			</p>

			<h2>How to Participate</h2>
			<h3>Before starting</h3>

			<ol>
				<li>
					<strong>Contributors</strong>: Make sure to sign up on the{' '}
					<a href="https://hacktoberfest.com/">
						Hacktoberfest official website
					</a>
					, contact your mentor if you request one, and check out issues on
					sites with the Hacktoberfest label.
					<br />
					If you've signed up for the VC Hacktoberfest Initiative, you can
					access your dashboard{' '}
					<a href="https://hacktoberfest.virtualcoffee.io/">here</a>.
				</li>

				<li>
					<strong>Maintainers</strong>: Make sure you include "Hacktoberfest" as
					a label in your project's topics section (found in "About" on your
					repository) or on the issues you want to be addressed during October.
					This is how you opt-in to Hacktoberfest.
				</li>
			</ol>

			<h3>Weekly check-ins</h3>
			<p>
				Let's start the week with an async check-in. What are your goals for
				Hacktoberfest for the week? What support do you need? Do you plan on
				spending time in the <code>#hacktoberfest-co-working-room</code>,
				talking to your mentor, and answering questions as a maintainer?
			</p>
			<p>
				Every Friday of the month, you come to our synchronous check-in, share
				your progress, ask questions, and find help and support. We'll post more
				information in the <code>#open-source</code> channel in Slack.
			</p>
			<p>
				Can't come to the check-in? No problem. We'll have an async check-in as
				well!
			</p>

			<h3>How do I share my progress?</h3>
			<p>
				Share your progress in the <code>#hacktoberfest</code> channel in Slack.
				We want to know when you get those pull requests (PRs) in so we can
				celebrate along with you! And if you need support, we'll be there to
				help you, too. While no other platform is imposed, it can be a good idea
				to also share on social media for more reach, but only if you are
				comfortable doing so. You can share on Twitter using — or not — the
				hashtag <code>#VCMonthlyChallenge</code>, a personal blog, a post on{' '}
				<a href="https://dev.to/">DEV.to</a>, you get the idea!
			</p>

			<p>
				Sharing every time some work is added is a good idea. Small progress is
				still progress. There is no need to write a detailed blog post. A
				140-character Tweet can be enough. For example, "
				<em>Today, I submitted my first PR for Hacktoberfest.</em>"
			</p>

			<h3>What if I need help?</h3>
			<p>
				You can ask a question in the <code>#help-and-pairing</code> channel in
				Slack, ask for ideas in the <code>#open-source</code> channel, or join
				the <code>#hacktoberfest-co-working-room</code>. Asking for help is part
				of the process!
			</p>

			<p>And remember, we're always here to help ❤️</p>

			<h3>Completing the Challenge!</h3>
			<p>
				Any kind of participation in Hacktoberfest counts as you complete the VC
				October challenge.
			</p>
			<p>
				Remember, VC is here to support you during Hacktoberfest but is not an
				official event partner. To get the Hacktoberfest swag, you need to have
				four (4) pull requests (PRs) accepted.
			</p>

			<h2>Virtual Coffee Approved Repositories!</h2>
			<ul className="list-unstyled">
				{repos.map((repo) => (
					<li key={repo.RepoUrl}>
						<h3>
							<a href={repo.RepoUrl}>{repo.RepoName}</a>
						</h3>
						<p>{repo.Description}</p>
						<p>
							<strong>Maintainer</strong>: {repo.Maintainer}
						</p>
					</li>
				))}
			</ul>

			<h2>Resources</h2>
			<ul>
				<li>
					<a href="https://www.nickyt.co/talks/getting-the-most-out-of-open-source-digitalocean-tech-talk/">
						Getting the Most Out of Open Source
					</a>
				</li>
				<li>
					<a href="https://www.nickyt.co/talks/words-matter--conventional-comments-virtual-coffee-lightning-talks/">
						Words Matter: Conventional Comments
					</a>
				</li>
				<li>
					<a href="https://www.freecodecamp.org/news/writing-good-commit-messages-a-practical-guide/">
						Writing Good Commit Messages, a Practical guide
					</a>
				</li>
				<li>
					<a href="https://dev.to/mishmanners/series/13860">
						GitHub like a Boss Series
					</a>
				</li>
				<li>
					<a href="https://www.youtube.com/watch?v=0mjJS1Y8wrI">
						Hacktoberfest Tutorial
					</a>
				</li>
				<li>
					<a href="https://virtualcoffee.io/podcast/chad-stewart-oss-and-techishiring">
						Podcast with Chad Stewart: OSS and #TechIsHiring
					</a>
				</li>
				<li>
					<a href="https://www.youtube.com/watch?v=A8iI2jlsqfs&t=64s">
						Hacktoberfest and OpenSauced
					</a>
				</li>
				<li>
					<a href="https://hot.opensauced.pizza/">OpenSauced</a>
				</li>
			</ul>
		</>
	);
}
