import { json } from '@remix-run/node';
import { Link } from '@remix-run/react';
import LeadText from '~/components/content/LeadText';
import { createMetaData } from '~/util/createMetaData.server';

export const handle = {
	listTitle: 'October 2023: Hacktoberfest!',
	meta: {
		title: 'Monthly Theme & Challenge for October 2023: Hacktoberfest!',
		description:
			'October challenge -> Participate to Hacktoberfest! This month, our members will participate to the DigitalOcean Hacktoberfest by being maintainers, contributors, or mentors.',
	},
	date: '2023-10-01',
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
				<small>Monthly Challenge for October 2023:</small> It's Hacktoberfest!
				Participate in open source, learn, and have fun!
			</h1>

			<LeadText>
				This month, we have three tracks: maintainers will provide issues
				labeled for Hacktoberfest, contributors will solve issues, and mentors
				will help contributors and maintainers be successful.
			</LeadText>

			<p className="mt-3">
				<strong>Challenge Team Leads & Facilitators:</strong> BekahHW, Dan Ott,
				Ayu Adiati, Dominic Duffin & Julia Seidman
			</p>

			<hr />

			<h2>Theme</h2>
			<p>The 2023 Hacktoberfest!</p>

			<h2>Challenge</h2>
			<h3>Maintainers</h3>
			<p>
				They provide the repository(ies) with "hacktoberfest" topic(s) and
				issues labeled "hacktoberfest" on their repository(ies). They will also
				answer the contributors' questions, review the pull requests (PRs), and
				validate and merge them following the contest rules.
			</p>

			<h3>Contributors</h3>
			<p>
				They find repository(ies) with "hacktoberfest" topic(s) and issues they
				want to solve. The contest's goal is to have four (4) pull requests
				(PRs) validated and merged during October.
			</p>

			<h3>Mentors</h3>
			<p>
				A mentor will be paired with a mentee (contributor or maintainer). They
				provide support through a 1:1, a pairing session, Slack, or whatever
				works best for the team!
			</p>

			<h2>How to Participate</h2>
			<h3>Before starting</h3>
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
					Check out repositories with the "hacktoberfest" topic and issues on
					GitHub with the "hacktoberfest" label.
				</li>
			</ul>

			<p>
				<strong>Maintainers</strong>
			</p>
			<p>
				Make sure you include "hacktoberfest" as a label in your project's
				topics section (found in the "About" section on your repository). That's
				how you opt-in to Hacktoberfest.
			</p>

			<h3>Weekly check-ins</h3>
			<p>
				Let's start the week with an async check-in. What are your goals for
				Hacktoberfest for the week? What support do you need? Do you plan on
				spending time in the <code>#hacktoberfest-co-working-room</code>,
				talking to your mentor, or answering questions as a maintainer?
			</p>
			<p>
				Every Friday of the month, we'll have a sync check-in. Join us, share
				your progress, ask questions, and find help and support. We'll post more
				information in the <code>#hacktoberfest</code> channel in Slack.
			</p>
			<p>
				Can't come to the sync check-in? No problem. We'll also have an async
				check-in in the <code>#hacktoberfest</code> channel on Slack.
			</p>

			<h3>How do I share my progress?</h3>
			<p>
				Share your progress in the <code>#hacktoberfest</code> channel in Slack
				so we can celebrate with you! And if you need support, we'll be there to
				help you, too.
			</p>
			<p>
				While no other platform is imposed, sharing on social media for more
				reach can be a good idea, but only if you are comfortable doing so. You
				can share on X (formerly Twitter) using — or not — the hashtag{' '}
				<code>#VCHI</code>, a personal blog, a post on{' '}
				<a href="https://dev.to/">DEV.to</a>, you get the idea!
			</p>
			<p>
				Sharing every time you add some work is a good idea. Small progress is
				still progress. There is no need to write a detailed blog post. A
				140-character post on X can be enough. For example, "
				<em>Today, I submitted my first PR for Hacktoberfest. #VCHI</em>"
			</p>

			<h3>What if I need help?</h3>
			<p>
				You can ask questions and ask for ideas and help in the{' '}
				<code>#hacktoberfest</code> channel in Slack or join the{' '}
				<code>#hacktoberfest-co-working-room</code>. Asking for help is part of
				the process!
			</p>

			<p>And remember, we're always here to help! 💙</p>

			<h3>Completing the Challenge!</h3>
			<p>
				To complete the challenge, you need to complete four meaningful
				contributions during October. It can be creating a PR, writing a good
				issue, creating content such as a blog post or video about contributing
				to a project, helping to answer questions or triaging issues, meeting
				with your mentee, and so on. Share your progress in the{' '}
				<code>#hacktoberfest</code> channel on Slack.
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
							Virtual Coffee
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
							Virtual Coffee
						</a>
					</h3>
					<p>Our very own podcast transcripts!</p>
					<p>
						<strong>Maintainer</strong>: Virtual Coffee Maintainers
					</p>
				</li>
				<li>
					<h3>
						<a href="https://github.com/freeCodeCamp/Developer_Quiz_Site">
							freeCodeCamp's Developer Quiz Site
						</a>
					</h3>
					<p>
						Developer Quiz Site is a site filled with over 1200+ questions on
						programming.
					</p>
					<p>
						<strong>Maintainer</strong>: freeCodeCamp
					</p>
				</li>
				<li>
					<h3>
						<a href="https://github.com/EddieHubCommunity/BioDrop">
							EddieHub Community's BioDrop
						</a>
					</h3>
					<p>
						A platform where people in tech can have a single hub to showcase
						their content to accelerate their careers.
					</p>
					<p>
						<strong>Maintainer</strong>: EddieHub Community
					</p>
				</li>
				<li>
					<h3>
						<a href="https://github.com/open-sauced/docs">OpenSauced's Docs</a>
					</h3>
					<p>The docs of OpenSauced.</p>
					<p>
						<strong>Maintainer</strong>: OpenSauced
					</p>
				</li>
				<li>
					<h3>
						<a href="https://github.com/open-sauced/intro/">
							OpenSauced's Intro to Open Source Course
						</a>
					</h3>
					<p>Intro to Open Source Course with OpenSauced.</p>
					<p>
						<strong>Maintainer</strong>: OpenSauced
					</p>
				</li>
				<li>
					<h3>
						<a href="https://github.com/open-sauced/guestbook">
							OpenSauced's Guestbook
						</a>
					</h3>
					<p>
						It is a place for people who have taken OpenSauced's Intro to Open
						Source course to take their first steps into contributing to open
						source.
					</p>
					<p>
						<strong>Maintainer</strong>: OpenSauced
					</p>
				</li>
				<li>
					<h3>
						<a href="https://github.com/open-sauced/pizza-verse">
							OppenSauced's Pizza Lovers Repository
						</a>
					</h3>
					<p>
						A collaborative project where you can come together and contribute
						pizza-related content. Whether you have a fantastic pizza recipe, an
						interesting fact, or want to share your opinions on the best pizza
						toppings, this repository is the perfect place to do it!
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
						<a href="https://github.com/hacktoberfesthowto/howto-blog">
							HOWTO blog
						</a>
					</h3>
					<p>
						Hugo blog template for Hacktoberfest HOWTO. The goal of this site is
						to be a collaborative guide to participating in open source,
						especially during October, when Hacktoberfest provides additional
						incentives to new developers.
					</p>
					<p>
						<strong>Maintainer</strong>: Hacktoberfest HOWTO
					</p>
				</li>
				<li>
					<h3>
						<a href="https://github.com/forem/forem">Forem</a>
					</h3>
					<p>
						The Forem codebase — the platform that powers{' '}
						<a href="https://dev.to/">dev.to</a>.
					</p>
					<p>
						<strong>Maintainer</strong>: Forem
					</p>
				</li>
				<li>
					<h3>
						<a href="https://github.com/Terieyenike/linktree">
							Django link-in-bio tool
						</a>
					</h3>
					<p>
						A link-in-bio tool like Linktree that allows you to create a webpage
						with all your links in one place.
					</p>
					<p>
						<strong>Maintainer</strong>: Teri Eyenike
					</p>
				</li>
				<li>
					<h3>
						<a href="https://github.com/cmcrawford2/memory-game">
							Classic Memory Game
						</a>
					</h3>
					<p>
						It is a simple, classic memory game based on the card game from the
						1960s.
					</p>
					<p>
						<strong>Maintainer</strong>: Cris Crawford
					</p>
				</li>
				<li>
					<h3>
						<a href="https://github.com/TarynMcMillan/Tiny-Troves-of-Dev-Wisdom">
							Tiny Troves of Dev Wisdom
						</a>
					</h3>
					<p>Tiny Troves of Dev Wisdom is a mini game made in Unity 2D.</p>
					<p>
						<strong>Maintainer</strong>: Taryn McMillan
					</p>
				</li>
				<li>
					<h3>
						<a href="https://github.com/tkshill/rpg-session/">
							Elm RPG Session
						</a>
					</h3>
					<p>
						Elm RPG Session is a sample session generator, table top role
						playing game (ttrpg) character builder, and dice roller built with
						Elm and Lamdera.
					</p>
					<p>
						<strong>Maintainer</strong>: Kirk Shillingford
					</p>
				</li>
				<li>
					<h3>
						<a href="https://github.com/novuhq/novu">Novu</a>
					</h3>
					<p>
						The open-source notification infrastructure for developers. Novu
						provides a unified API that makes it simple to send notifications
						through multiple channels, including In-App, Push, Email, SMS, and
						Chat.
					</p>
					<p>
						<strong>Maintainer</strong>: NovuHQ
					</p>
				</li>
				<li>
					<h3>
						<a href="https://github.com/strapi/strapi">Strapi</a>
					</h3>
					<p>
						Strapi is the leading open-source headless CMS, 100%
						JavaScript/TypeScript, flexible and fully customizable.
					</p>
					<p>
						<strong>Maintainer</strong>: Strapi
					</p>
				</li>
				<li>
					<h3>
						<a href="https://github.com/ToolJet/Tooljet">ToolJet</a>
					</h3>
					<p>
						ToolJet is an open-source low-code framework to build and deploy
						internal tools with minimal engineering effort. ToolJet's drag and
						drop frontend builder allows you to create complex, responsive
						frontends within minutes.
					</p>
					<p>
						<strong>Maintainer</strong>: ToolJet
					</p>
				</li>
			</ul>

			<h2>Resources</h2>
			<h3>Virtual Coffee Resources</h3>
			<ul>
				<li>
					<Link to="/resources/developer-resources/open-source">
						Open Source Resource
					</Link>
				</li>
				<li>
					<a href="https://www.youtube.com/playlist?list=PLh9uT23TA65hH8sfprU1XOvT4NBesokna">
						VC Hacktoberfest Initiative 2022 YouTube playlist
					</a>
				</li>
				<li>
					<Link to="/podcast">Season 9 of Virtual Coffee Podcast</Link>
				</li>
				<li>
					<Link to="/podcast/chad-stewart-oss-and-techishiring">
						Podcast with Chad Stewart: OSS and #TechIsHiring
					</Link>
				</li>
			</ul>

			<h3>Other Resources</h3>
			<ul>
				<li>
					<a href="https://intro.opensauced.pizza/#/">
						Intro to Open Source with OpenSauced
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
