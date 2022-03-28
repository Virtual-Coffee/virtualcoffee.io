export const handle = {
	listTitle: 'October, 2021: HacktoberFest!',
	meta: {
		title: 'Monthly Theme & Challenge for October, 2021: HacktoberFest!',
		description:
			'October challenge -> Participate to Hacktoberfest! This month, our members will participate to the DigitalOcean HacktoberFest by being maintainers, contributors, or mentors.',
	},
	date: '2021-10-01',
	hero: {
		heroHeader: '',
	},
};

export const meta = () => {
	return handle.meta;
};

export default function Challenge() {
	return (
		<>
			<div className="alert alert-success">
				This monthly challenge is complete. Congratulations! Please join us for
				the <a href="/monthlychallenges/">next challenge</a>!
			</div>

			<h1>
				Monthly Challenge for October 2021:
				<small>
					It's Hacktoberfest! Participate in open source, learn, and have fun!
				</small>
			</h1>

			<p className="lead">
				This month we have three tracks: maintainers will provide issues labeled
				for Hacktoberfest, contributors will solve issues, and mentors will help
				contributors and maintainers be successful.
			</p>

			<p>
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
				review the PRs for these issues, and validate and merge following the
				rules of the contest. They also answer the contributors' questions.
			</p>

			<strong>Contributors</strong>
			<p>
				They find issues labeled Hacktoberfest they want to solve. The goal of
				the contest is to have 4 PRs validated during the month of October.
			</p>

			<strong>Mentors</strong>
			<p>
				They will be paired with a mentee (contributor or maintainer). They
				provide support either on Slack, during a 1:1, a pairing session, or
				whatever works best for the team!
			</p>

			<h2>How to Participate</h2>
			<h4>Before starting</h4>
			<ol>
				<li>
					<strong>Contributors</strong>: Make sure to sign up on the{' '}
					<a href="https://hacktoberfest.digitalocean.com/">
						Hacktoberfest official website
					</a>
					, get in contact with your mentor if you requested one, and check out
					issues on sites with the Hacktoberfest label.
					<br />
					If you've signed up to the VC Hacktoberfest Initiative, you can access
					to your dashboard{' '}
					<a href="https://hacktoberfest.virtualcoffee.io/">here</a>.
				</li>

				<li>
					<strong>Mentors</strong>: Make sure you include "Hacktoberfest" as a
					label in your project's topics section (found in "About" on your
					repository). This is how you opt-in to Hacktoberfest.
				</li>
			</ol>

			<h4>Weekly check-ins</h4>
			<p>
				Let's start the week with an async check-in. What are your goals for
				Hacktoberfest for the week? What support do you need? Do you plan on
				spending time in the Hacktoberfest co-working room, talking to your
				mentor, answering questions as a maintainer?
			</p>
			<p>
				Every Friday of the month, you come to our synchronous check-in, share
				your progress, ask questions, and find help and support. We'll post more
				information in the #open-source Slack channel.
			</p>
			<p>
				Can't come to the check-in? No problem. We'll have an async check-in as
				well!
			</p>

			<h4>How do I share my progress?</h4>
			<p>
				Share your progress in the #open-source channel in Slack. We want to
				know when you get those Pull Requests (PRs) in so we can celebrate along
				with you! And if you need support, we'll be there to help you too. While
				no other platform is imposed, it can be a good idea to also share on
				social media for more reach but only if you are comfortable doing so.
				You can share on Twitter using -or not- the hashtag #VCMonthlyChallenge,
				a personal blog, a post on <a href="https://dev.to/">DEV.to</a>, you get
				the idea!
			</p>

			<p>
				Sharing every time some work is added is a good idea, small progress is
				still progress. No need to write a detailed blog post; a 140 character
				Tweet can be enough. For example:{' '}
				<i>Today I submitted my first PR for Hacktoberfest.</i>
			</p>

			<h4>What if I need help?</h4>
			<p>
				You can ask a question in the #help-and-pairing VC channel, ask for
				ideas in the #open-source channel, or join the Hacktoberfest VC
				co-working room. Asking for help is part of the process!
			</p>

			<p>And remember, we're always here to help ❤️</p>

			<h4>Completing the Challenge!</h4>
			<p>
				Any kind of participation in Hacktoberfest counts as you completing the
				VC October challenge.
			</p>
			<p>
				Remember, VC is here to support you during Hacktoberfest but is not an
				official partner of the event. To get the Hacktoberfest swag, you need
				to have four (4) pull requests accepted.
			</p>

			<h2>Virtual Coffee Approved Repositories!</h2>
			<ul style="list-style-type: none">
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
						exploration of game development, oss, build automation,
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
						Openweathermap APIs. It lets people find best places to visit in
						their entourage; Easily finding warmer winter vacation or cool
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
					<p>Forem is open source software for building communities</p>
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
						aware of the importance of our loved ones and through this app,
						users can bring a smile to their family and friends' faces by
						sending them their favorite delicacy, medicines, or a simple
						heartfelt gift.
					</p>
					<p>
						<strong>Maintainer</strong>: Abderrahim Ben
					</p>
				</li>
				<li>
					<h3>
						<a href="https://github.com/open-sauced/open-sauced">Open Sauced</a>
					</h3>
					<p>
						Open Sauced provides structured onboarding for new contributors to
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
						started as a re-write of Less from the ground-up, but evolved into
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
					<a href="https://www.iamdeveloper.com/pages/talks/#heading-getting-the-most-out-of-open-source">
						Getting the Most Out of Open Source
					</a>
				</li>
				<li>
					<a href="https://www.iamdeveloper.com/pages/talks/#heading-words-matter:-conventional-comments">
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
