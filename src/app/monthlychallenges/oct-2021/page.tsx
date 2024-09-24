import Link from 'next/link';
import LeadText from '@/components/content/LeadText';
import { createMetaData } from '@/util/createMetaData.server';

export const handle = {
	listTitle: 'October 2021: Hacktoberfest!',
	meta: {
		title: 'Monthly Theme & Challenge for October 2021: Hacktoberfest!',
		description:
			'October challenge -> Participate to Hacktoberfest! This month, our members will participate to the DigitalOcean Hacktoberfest by being maintainers, contributors, or mentors.',
	},
	date: '2021-10-01',
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

export const meta = handle.meta;

export default function Challenge() {
	return (
		<>
			<div className="alert alert-success">
				This monthly challenge is complete. Congratulations! Please join us for
				the <Link href="/monthlychallenges">next challenge</Link>!
			</div>

			<h1>
				<small>Monthly Challenge for October 2021:</small> It's Hacktoberfest!
				Participate in open source, learn, and have fun!
			</h1>

			<LeadText>
				This month, we have three tracks: maintainers will provide issues
				labeled for Hacktoberfest, contributors will solve issues, and mentors
				will help contributors and maintainers be successful.
			</LeadText>

			<p className="mt-3">
				<strong>Challenge Team Leads & Facilitators:</strong> Aurelie Verrot &
				Andrew Bush
			</p>

			<hr />

			<h2>Theme</h2>
			<p>The 2021 Hacktoberfest!</p>

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
					<strong>Mentors</strong>: Make sure you include "Hacktoberfest" as a
					label in your project's topics section (found in "About" on your
					repository). This is how you opt-in to Hacktoberfest.
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
				Share your progress in the <code>#open-source</code> channel in Slack.
				We want to know when you get those pull requests (PRs) in so we can
				celebrate with you! And if you need support, we'll be there to help you,
				too. While no other platform is imposed, sharing on social media for
				more reach can be a good idea, but only if you are comfortable doing so.
				You can share on Twitter using — or not — the hashtag
				<code>#VCMonthlyChallenge</code>, a personal blog, a post on{' '}
				<a href="https://dev.to/">DEV.to</a>, you get the idea!
			</p>

			<p>
				Sharing every time some work is added is a good idea. Small progress is
				still progress. There is no need to write a detailed blog post. A
				140-characters Tweet can be enough. For example, "
				<em>Today, I submitted my first PR for Hacktoberfest.</em>"
			</p>

			<h3>What if I need help?</h3>
			<p>
				You can ask questions in the <code>#help-and-pairing</code> channel in
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
						<a href="https://github.com/stepzen-samples/stepzen-nuxt">
							Stepzen Nuxt
						</a>
					</h3>
					<p>
						<strong>Maintainer</strong>: Lucia Cerchie
					</p>
				</li>
				<li>
					<h3>
						<a href="https://github.com/drone/drone">Drone</a>
					</h3>
					<p>Drone is a Container-Native, Continuous Delivery Platform</p>
					<p>
						<strong>Maintainer</strong>: Marie Antons
					</p>
				</li>
				<li>
					<h3>
						<a href="https://github.com/drone/docs">Drone Docs</a>
					</h3>
					<p>Documentation for the Drone Continuous Integration project</p>
					<p>
						<strong>Maintainer</strong>: Marie Antons
					</p>
				</li>
				<li>
					<h3>
						<a href="https://github.com/dominicduffin1/python-turtle-art-canvas">
							Python Turtle Art Canvas
						</a>
					</h3>
					<p>
						The aim of this project is to create a collaborative piece of
						creative coding using Python Turtle Graphics.
					</p>
					<p>
						<strong>Maintainer</strong>: Dominic Duffin
					</p>
				</li>
				<li>
					<h3>
						<a href="https://github.com/stepzen-samples/stepzen-spacex-graphql">
							Stepzen SpaceX GraphQL
						</a>
					</h3>
					<p>
						This repository is a React app with a StepZen SpaceX endpoint
						consumed using Apollo. It currently displays data from the SpaceX
						API.
					</p>
					<p>
						<strong>Maintainer</strong>: Lucia Cerchie
					</p>
				</li>
				<li>
					<h3>
						<a href="https://github.com/tkshill/Quarto">Quarto</a>
					</h3>
					<p>
						An implementation of the Quarto boardgame using Elm and Netlify. An
						exploration of game development, OSS, build automation,
						accessiblity, and machine learning.
					</p>
					<p>
						<strong>Maintainer</strong>: Kirk Shillingford
					</p>
				</li>

				<li>
					<h3>
						<a href="https://github.com/bacloud14/Classified-ads-48">
							Classified Ads 48
						</a>
					</h3>
					<p>
						A lightweight classified-ads web-app with maps. NodeJS + Leaflet 🗺️
						+ MongoDB 💽. Utilizes a lot of wisely picked vanilla JS libraries
					</p>
					<p>
						<strong>Maintainer</strong>: Abderrahim Ben
					</p>
				</li>
				<li>
					<h3>
						<a href="https://github.com/bacloud14/WeatherVenue">
							Weather Venue
						</a>
					</h3>
					<p>
						WeatherVenue is a weather website using Google Maps and
						Openweathermap APIs. It lets people find the best places to visit in
						their entourage; Easily finding warmer winter vacations or cool
						summer escapes.
					</p>
					<p>
						<strong>Maintainer</strong>: Abderrahim Ben
					</p>
				</li>
				<li>
					<h3>
						<a href="https://github.com/forem/forem">Forem</a>
					</h3>
					<p>Forem is open-source software for building communities.</p>
					<p>
						<strong>Maintainer</strong>: Nick Taylor
					</p>
				</li>
				<li>
					<h3>
						<a href="https://github.com/avneesh0612/voyagger">Voyagger</a>
					</h3>
					<p>
						A hassle-free delivery service. These tough times have made us all
						aware of the importance of our loved ones. Through this app, users
						can bring a smile to their family and friends' faces by sending them
						their favorite delicacies, medicines, or a simple heartfelt gift.
					</p>
					<p>
						<strong>Maintainer</strong>: Abderrahim Ben
					</p>
				</li>
				<li>
					<h3>
						<a href="https://github.com/open-sauced/open-sauced">OpenSauced</a>
					</h3>
					<p>
						OpenSauced provides structured onboarding for new contributors to
						open source. This structure provides a way to track your next
						contributions by leveraging a unique dashboard built on top of the
						GitHub GraphQL API.
					</p>
				</li>

				<li>
					<h3>
						<a href="https://github.com/BekahHW/postpartum-wellness-app">
							Postpartum Wellness App
						</a>
					</h3>
					<p>
						A React Native app to help moms monitor their well-being during the
						post-partum stage.
					</p>
					<p>
						<strong>Maintainer</strong>: BekahHW
					</p>
				</li>
				<li>
					<h3>
						<a href="https://github.com/jesscss/jess">Jess</a>
					</h3>
					<p>
						Jess is a CSS pre-processor like Less and Sass. In fact, Jess
						started as a rewrite of Less from the ground up but evolved into
						something much more powerful and dynamic.
					</p>
					<p>
						<strong>Maintainer</strong>: Matthew Dean
					</p>
				</li>
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
			</ul>
		</>
	);
}
