import Link from 'next/link';
import LeadText from '@/components/content/LeadText';

const handle = {
	listTitle: 'October 2024: Hacktoberfest!',
	meta: {
		title: 'Monthly Theme & Challenge for October 2024: Hacktoberfest!',
		description:
			'October challenge -> Participate to Hacktoberfest! This month, our members will participate to the Hacktoberfest sponsored by DigitalOcean by being maintainers, contributors, or mentors.',
	},
	date: '2024-10-01',
	hero: {
		heroHeader: '',
	},
};

export const metadata = handle.meta;

export default function Challenge() {
	return (
		<>
			<h1>
				<small>Monthly Challenge for October 2024:</small> It's Hacktoberfest!
				Participate in open source, learn, and have fun!
			</h1>

			<LeadText>
				This month, we have three tracks: maintainers will provide issues
				labeled for Hacktoberfest, contributors will solve issues, and mentors
				will help contributors and maintainers be successful.
			</LeadText>

			<hr />

			<h2>Theme</h2>
			<p>The 2024 Hacktoberfest!</p>

			<h2>Challenge</h2>
			<h3>Maintainers</h3>
			<p>
				They provide the repositories with "<code>hacktoberfest</code>" topic(s)
				and issues labeled "<code>hacktoberfest</code>" on their repositories.
				They will also answer the contributors' questions, review the pull
				requests (PRs), and validate and merge them following the contest rules.
			</p>

			<h3>Contributors</h3>
			<p>
				They find repositories with "<code>hacktoberfest</code>" topic(s) and
				issues they want to solve. The contest's goal is to have four (4) pull
				requests (PRs) approved during October.
			</p>

			<h3>Mentors</h3>
			<p>
				A mentor will be paired with a mentee (contributor or maintainer). They
				provide support through a 1:1, a pairing session, Slack, or whatever
				works best for the team!
			</p>

			<h2>How to Participate</h2>
			<h3>Before Starting</h3>
			<p>
				You can access your dashboard{' '}
				<a href="https://hacktoberfest.virtualcoffee.io/dashboard">here</a> if
				you've signed up for the VC Hacktoberfest Initiative.
			</p>

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
				<li>Contact your mentor if you request one.</li>
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
				repository). That's how you opt-in to Hacktoberfest.
			</p>
			<p>
				<a href="https://hacktoberfest.com/participation#maintainers">
					Check out all of the Hacktoberfest guidelines on the official website
				</a>
				.
			</p>

			<h3>Weekly Check-ins</h3>
			<p>
				Let's start the week with an async check-in. You can find the check-ins
				in the <code>#hacktoberfest</code> channel in Slack. What are your goals
				for Hacktoberfest for the week? What support do you need? Do you plan on
				spending time in the <code>#co-working-room</code>, talking to your
				mentor, or answering questions in Slack as a maintainer?
			</p>

			<h3>Share Progress</h3>
			<p>
				Share your progress in the <code>#hacktoberfest</code> channel in Slack
				so we can celebrate with you! And if you need support, we'll be there to
				help you, too.
			</p>
			<p>
				While no other platform is imposed, sharing on social media for more
				reach can be a good idea, but only if you are comfortable doing so. You
				can share on X (formerly Twitter) using—or not—the hashtag{' '}
				<code>#VCHI</code>, a personal blog, a post on{' '}
				<a href="https://dev.to/">DEV.to</a>, you get the idea!
			</p>
			<p>
				Sharing every time you add some work is a good idea. Small progress is
				still progress. There is no need to write a detailed blog post. A
				140-character post on X can be enough. For example,{' '}
				<a href="https://twitter.com/intent/tweet?text=Today,%20I%20submitted%20my%20first%20PR%20for%20Hacktoberfest!%20&url=https://github.com/Virtual-Coffee/virtualcoffee.io/pull/1230&hashtags=VCHI">
					<q>Today, I submitted my first PR for Hacktoberfest. #VCHI</q>
				</a>
			</p>

			<h3>Do You Need Help?</h3>
			<p>
				You can ask questions and ask for ideas and help in the{' '}
				<code>#hacktoberfest</code>, <code>#open-source</code>, or{' '}
				<code>#help-and-pairing</code> channel in Slack. Asking for help is part
				of the process!
			</p>

			<p>And remember, we're always here to help! 💙</p>

			<h3>Completing the Challenge!</h3>
			<p>
				To complete the challenge, you need to complete four meaningful
				contributions during October. It can be creating a PR, writing a good
				issue, creating content such as a blog post or video about contributing
				to a project, helping to answer questions or triaging issues, meeting
				with your mentee, and so on. Share your progress in the{' '}
				<code>#hacktoberfest</code> channel in Slack.
			</p>
			<p>
				Remember, VC is here to support you during Hacktoberfest but is not an
				official event partner. To complete the Hacktoberfest, you must have
				four (4) pull requests (PRs) accepted.
			</p>

			<h2>Virtual Coffee Approved Repositories!</h2>
			<ul style={{ listStyleType: 'none' }}>
				<li>
					<h3>
						<a href="https://github.com/Virtual-Coffee/virtualcoffee.io">
							Virtual Coffee's website
						</a>
					</h3>
					<p>Our very own site!</p>
					<p>
						<strong>Maintainer</strong>: Virtual Coffee Maintainers
					</p>
				</li>
				<li>
					<h3>
						<a href="https://github.com/Virtual-Coffee/podcast-transcripts">
							Virtual Coffee Podcast
						</a>
					</h3>
					<p>Our very own podcast transcripts!</p>
					<p>
						<strong>Maintainer</strong>: Virtual Coffee Maintainers
					</p>
				</li>
				<li>
					<h3>
						<a href="https://github.com/freeCodeCamp/freeCodeCamp/issues/56170">
							freeCodeCamp
						</a>
					</h3>
					<p>A list of issues on freeCodeCamp for Hacktoberfest 2024.</p>
					<p>
						<strong>Maintainer</strong>: freeCodeCamp
					</p>
				</li>
				<li>
					<h3>
						<a href="https://github.com/open-sauced/intro/">
							OpenSauced's Open Source Education Path
						</a>
					</h3>
					<p>
						Intro to Open Source and Becoming a Maintainer courses with
						OpenSauced.
					</p>
					<p>
						<strong>Maintainer</strong>: OpenSauced
					</p>
				</li>
				<li>
					<h3>
						<a href="https://github.com/open-sauced/pizza-verse">
							OpenSauced's Pizza (and food from all around the world) Lovers
							Repository
						</a>
					</h3>
					<p>
						A collaborative project where you can come together and contribute
						pizza-related and food from all over the world content. Whether you
						have a fantastic pizza recipe, an interesting fact about pizza, or
						want to share a favorite traditional food from your country to the
						world, this repository is the perfect place to do it!
					</p>
					<p>
						<strong>Maintainer</strong>: OpenSauced
					</p>
				</li>
				<li>
					<h3>
						<a href="https://github.com/dominicduffin1/python-turtle-art-canvas">
							Python Turtle Art Canvas
						</a>
					</h3>
					<p>
						This project aims to create a collaborative piece of creative coding
						using Python Turtle Graphics.
					</p>
					<p>
						<strong>Maintainer</strong>: Dominic Duffin
					</p>
				</li>
				<li>
					<h3>
						<a href="https://github.com/rupali-codes/LinksHub">LinksHub</a>
					</h3>
					<p>
						LinksHub is a hub of links for developers by developers. They've
						gathered a collection of all the best and most useful resources,
						both free and paid, to aid in the development journey.
					</p>
					<p>
						<strong>Maintainer</strong>: Rupali Haldiya
					</p>
				</li>
				<li>
					<h3>
						<a href="https://github.com/Codecademy/docs">Codecademy's Docs</a>
					</h3>
					<p>
						Documentation for popular programming languages and frameworks.
						Built by the community. Maintained by Codecademy.
					</p>
					<p>
						<strong>Maintainer</strong>: Codecademy
					</p>
				</li>
			</ul>

			<h2>Resources</h2>
			<h3>Virtual Coffee Resources</h3>
			<ul>
				<li>
					<Link href="/resources/developer-resources/open-source">
						Open Source Resources
					</Link>
				</li>
				<li>
					<a href="https://www.youtube.com/watch?v=KoVX3kGMn3c">
						Intro to Open Source Workshop - Bekah Hawrot Weigel & Ayu Adiati -
						Lunch & Learn
					</a>
				</li>
				<li>
					<a href="https://www.youtube.com/watch?v=a-wrAFiBqFI">
						Becoming an Open Source Maintainer Workshop - Bekah Hawrot Weigel &
						Ayu Adiati - Lunch & Learn
					</a>
				</li>
				<li>
					<a href="https://youtu.be/A7qZwaqBC00?si=h7N_BDbeibRdiSbV">
						How to Discover Open Source Projects that Align with Your Needs and
						Goals - Jessica Wilkins - Lunch & Learn
					</a>
				</li>
				<li>
					<a href="https://youtu.be/b2d84LhlW6Q?si=8fl-BrU_F61uQBtz">
						How to best prepare as a maintainer for Hacktoberfest - Jessica
						Wilkins - Lunch & Learn
					</a>
				</li>
				<li>
					<a href="https://www.youtube.com/playlist?list=PLh9uT23TA65hH8sfprU1XOvT4NBesokna">
						VC Hacktoberfest Initiative 2022 YouTube playlist
					</a>
				</li>
			</ul>

			<h3>Other Resources</h3>
			<ul>
				<li>
					<a href="https://opensauced.pizza/learn/#/">
						Open Source Education with OpenSauced
					</a>
				</li>
				<li>
					<a href="https://www.nickyt.co/talks/getting-the-most-out-of-open-source-digitalocean-tech-talk/">
						Getting the Most Out of Open Source
					</a>
				</li>
				<li>
					<a href="https://www.freecodecamp.org/news/git-and-github-workflow-for-open-source/">
						How to Contribute to Open-Source Projects – Git & GitHub Workflow
						for Beginners
					</a>
				</li>
				<li>
					<a href="https://www.nickyt.co/talks/words-matter--conventional-comments-virtual-coffee-lightning-talks/">
						Words Matter: Conventional Comments
					</a>
				</li>
				<li>
					<a href="https://www.freecodecamp.org/news/writing-good-commit-messages-a-practical-guide/">
						Writing Good Commit Messages, a Practical Guide
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
					<a href="https://www.freecodecamp.org/news/how-to-contribute-to-open-source/">
						How to Contribute to Open Source Projects – Non-Technical Things You
						Should Know
					</a>
				</li>
			</ul>
		</>
	);
}
