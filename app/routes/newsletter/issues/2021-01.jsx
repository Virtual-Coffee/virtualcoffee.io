import { Link } from 'remix';

export const handle = {
	listTitle: 'January 2021',
	meta: {
		title: 'Virtual Coffee Newsletter, January 2021',
		description: "What we've been up to and where we're going in January!",
	},
	date: '2021-01-01',
};

export const meta = () => {
	return handle.meta;
};

export default function Issue() {
	return (
		<>
			<h2>Hey friends!</h2>

			<p className="lead">
				It’s a brand new year, and Virtual Coffee is here for it. We’re dropping
				our podcast, starting this newsletter, and hosting tons of community
				events. We are so happy to have you all here with us 💖
			</p>

			<hr />

			<h2>💞 Community Kindness</h2>
			<p className="lead text-muted">
				Spotlighting some of the kindness happening in our community.
			</p>
			<ul>
				<li>
					One member offered to anonymously send two copies of James Clear’s
					Atomic Habits to two members.
				</li>
				<li>
					BekahHW wants to thank everyone for their support when her grandfather
					died. It made a hard time a little better.
				</li>
				<li>
					Courtney Landau spent four of her six pairing sessions helping another
					member with their project.
				</li>
			</ul>

			<hr />

			<h2 className="my-5">📆 What's happening at Virtual Coffee</h2>

			<h3 className="mb-3 font-italic">December Recap:</h3>
			<ul>
				<li>
					Check out how our monthly challenge -&gt;{' '}
					<a href="/monthlychallenges/dec-2020/">Pair up!</a> turned out
				</li>
				<li>
					<strong>New members:</strong> ~33 new members
				</li>
			</ul>

			<h3 className="mb-3 font-italic">January Happenings:</h3>
			<h4 className="mt-4">💡 Monthly Challenge: Month of Learning!</h4>
			<p>
				It's a new year and time for learning new things! During this month,
				we'll work on learning new dev-related things. You might deep-dive into
				one topic, start a small-group that focuses on community learning, focus
				on a new topic every week, or do a little bit of everything.
			</p>

			<h4 className="mt-4">🎙️ Podcast</h4>
			<p>
				<a href="/podcast">Check out the trailer for our new podcast!</a> New
				episodes will be dropping soon.
			</p>

			<h4 className="mt-4">🛠️ Workshop</h4>
			<ul>
				<li>
					January 11, 1:00pm EST, Amplify your Fullstack Development, @Rahat
					Chowdhury.{' '}
					<a href="https://us02web.zoom.us/meeting/register/tZModO6qpzgpE9Bxxfag1PC6qXcpXpvnzyhl">
						Registration required
					</a>
					.
				</li>
			</ul>

			<h4 className="mt-4">🥪 Brownbags</h4>
			<ul>
				<li>January 6, 9:00am EST &gt; git under the hood, @Rafi</li>
				<li>
					January 15, 12:00pm EST &gt; Cross Platforms Apps with SwiftUI
					@Cameron Bardell
				</li>
				<li>
					January 22, 11:00am EST Using Supabase in a React (Native) Project,
					@Justin Noel
				</li>
				<li>January 27, 12:00pm EST Interview Powerups, from @Gant</li>
			</ul>

			<h4 className="mt-4">📕 Bookclub</h4>
			<p>
				<a href="https://jamesclear.com/atomic-habits">
					<em>Atomic Habits</em> by James Clear
				</a>{' '}
				will be the reading/discussion book for January and first half of
				February. Organized by @Karen Dickenson
			</p>

			<p>
				<em>
					Mark your calendars: Lightning Talks are making a comeback on February
					26, and will be followed by a social hour.
				</em>
			</p>

			<hr />

			<h2>Member Blog Post Highlights</h2>

			<p>
				<em>Some of our member posts we loved in December</em>
			</p>

			<ul>
				<li>
					<a href="https://dev.to/cerchie/database-design-and-the-gdpr-463p">
						Database Design and the GDPR
					</a>
					, by Lucia Cerchie
				</li>
				<li>
					<a href="https://dev.to/adiatiayu/setting-up-width-of-images-in-css-3m38">
						Setting Up Width of Images In CSS
					</a>
					, by Ayu Adiati
				</li>
				<li>
					<a href="https://www.rahatcodes.com/posts/scope/">Scope</a>, by Rahat
					Chowdury
				</li>
			</ul>

			<div className="card my-5 border-primary">
				<div className="card-body">
					<h5 className="card-title text-primary font-italic">Slack Love</h5>
					<div className="card-text">
						<blockquote className="blockquote">
							<p className="mb-0">
								I just wanted to say that I'm very appreciative of these
								conversations this week (and every week!). It's a wonderful
								group we've got here, and I always look forward to the call and
								checking in on slack each morning.
							</p>
							<footer className="blockquote-footer">Tom Cudd</footer>
						</blockquote>
					</div>
				</div>
			</div>

			<h2>What our members are up to</h2>

			<ul>
				<li>
					Colleen Schnettler hosts an awesome podcast you should check out:{' '}
					<a href="https://podcasts.apple.com/us/podcast/software-social/id1525935926">
						Software Social
					</a>{' '}
					is a weekly 30-minute conversation between two founders: one just
					starting out, and one established. Join Colleen and Michele&#39;s
					conversation about what&rsquo;s going on in their businesses.
				</li>
				<li>
					Dominic Duffin co-organizes a weekly Twitter chat with Shannon Crabill
					on tech, art and design, every Sunday at 1:00pm EST. Twitter:{' '}
					<a href="https://twitter.com/ArtTechChat">@ArtTechChat </a>
					#ArtTechChat
				</li>
				<li>
					Nick Taylor does live coding pairing sessions on Twitch (Forem related
					stuff on the DEV stream and anything else on his own stream). He also
					talks with folks in the tech space on the DEV stream. You can find him
					on <a href="http://livecoding.ca ">livecoding.ca</a>.
				</li>
			</ul>

			<h3>Open Source Projects</h3>

			<ul>
				<li>
					<a href="https://github.com/Virtual-Coffee/virtualcoffee.io/issues">
						VirtualCoffee.io
					</a>
					, our Virtual Coffee community site - Dan Ott - 11ty
				</li>
				<li>
					<a href="https://github.com/drewclem/protege">Protege.dev</a>, remote
					jobs for junior developers - Drew Clements - React
				</li>
				<li>
					<a href="https://github.com/Rahat-ch/The_Sylar_Project">
						The Sylar Project
					</a>
					, a Mental Health Repository for easily finding local mental health
					resources - Rahat Chowdhury - React
				</li>
				<li>
					<a href="https://github.com/BekahHW/postpartum-wellness-app">
						Postpartum Wellness App
					</a>
					, an app to help moms monitor their well-being during the post-partum
					stage - BekahHW - React Native
				</li>
				<li>
					<a href="https://github.com/Rafi993/frontend-dev">frontend-dev</a>,
					Cli tool to setup developer tooling in your frontend repo - Rafi - JS
				</li>
				<li>
					<a href="https://github.com/tkshill/Quarto">Quarto</a>, An
					implementation of the Quarto boardgame - Kirk Shillingford - Elm
				</li>
			</ul>
		</>
	);
}
