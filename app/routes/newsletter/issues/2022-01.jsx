import { Link } from '@remix-run/react';

export const handle = {
	listTitle: 'January 2022',
	meta: {
		title: 'Virtual Coffee Newsletter, January 2022',
		description: 'Happy New Year Virtual Coffee family!',
	},
	date: '2022-01-01',
};

export const meta = () => {
	return handle.meta;
};

export default function Issue() {
	return (
		<>
			<h2>Hey friends!</h2>

			<p className="lead">
				We had a ton of fun in December doing some non coding activities
				(especially fiber arts) but now we're ready to start learning again!
			</p>

			<hr />

			<h2>💞 Community Kindness</h2>
			<p>
				<em>Spotlighting some of the kindness happening in our community.</em>
			</p>
			<blockquote className="blockquote">
				<p className="mb-0">
					"So grateful for this community. I know I have been a lot less active
					in slack since I changed jobs but I really appreciate those who have
					checked in on me, and for remembering me when I do manage to pop on to
					a coffee! also grateful for a job that allows for work life balance
					and the health of my family and myself."
				</p>
				<footer className="blockquote-footer">Courtney</footer>
			</blockquote>
			<blockquote className="blockquote">
				<p className="mb-0">
					"I'm super grateful to have found this community! You are all the
					best!"
				</p>
				<footer className="blockquote-footer">Shelley</footer>
			</blockquote>
			<blockquote className="blockquote">
				<p className="mb-0">
					"I'm grateful for this community, the friendships that have deepened
					here, the support I've received. For my family, having quality time to
					spend with them, and for having what I need to take care of them."
				</p>
				<footer className="blockquote-footer">Bekah</footer>
			</blockquote>

			<hr />

			<h2 className="my-5">📆 What's happening at Virtual Coffee</h2>

			<h3 className="font-italic">December Recap</h3>
			<ul className="mb-5">
				<li>
					Monthly challenge -&gt;{' '}
					<a href="https://virtualcoffee.io/monthlychallenges/dec-2021/">
						Creative Community
					</a>
					<p>
						We spent the month of December embracing our non-technical sides,
						showing off all the other fun activities in our lives outside of
						technology.
					</p>
				</li>
				<li>New members: 25 new members</li>
			</ul>

			<h3 className="mb-3 font-italic">January Happenings</h3>

			<h4 className="mt-4">
				💡 Monthly Theme &amp; Challenge:{' '}
				<a href="https://virtualcoffee.io/monthlychallenges/jan-2022/">
					Month of Learning!{' '}
				</a>
				!
			</h4>
			<p>
				During this month, we'll work on learning new dev-related things. You
				might deep-dive into one topic, start a small-group that focuses on
				community learning, focus on a new topic every week, or do a little bit
				of everything.
			</p>

			<h4 className="mt-4">🎙️ Podcasts</h4>
			<p>
				<em>Season 4 of the podcast wrapped up!</em>
			</p>
			<ul>
				<li>
					<a href="https://virtualcoffee.io/podcast/0409-season-four-wrapup/">
						Season 4 Wrap Up - Reviewing the year and celebrating our community
					</a>
				</li>
			</ul>

			<h4 className="mt-4">🥪 Member Events</h4>
			<p>
				<em>These are members-only events that last for 45 - 90 minutes.</em>
			</p>
			<ul>
				<li>
					Jan 7, 09:00am EST:{' '}
					<a href="https://meetingplace.io/virtual-coffee/events/8522">
						Lunch & Learn: The Collab Lab: Project Collaboration Program - Ayu
						Adiati, Andrea Martz, Fatima Olasunkanmi-ojo, Jennifer Toops
					</a>
				</li>
			</ul>

			<p>
				** Link for the Lunch & Learns can be found in slack about 15 minutes
				before the event and the descriptions can be found at{' '}
				<a href="https://virtualcoffee.io/events/">virtualcoffee.io/events</a>
			</p>

			<h2>Member Blogpost Highlights</h2>
			<p>
				<em>
					This month, we decided to do a highlight reel of some of the posts
					we've loved over the year!
				</em>
			</p>
			<ul>
				<li>
					January —{' '}
					<a href="https://dev.to/andystitt829/choose-your-own-adventure-to-break-into-web-development-5643">
						Choose your own adventure to break into web development — Andy Stitt
					</a>
				</li>
				<li>
					February —{' '}
					<a href="https://dev.to/saramccombs/tigew-mysql-views-4ei5">
						TIGEW: MySQL Views — Sara McCombs
					</a>
				</li>
				<li>
					March —{' '}
					<a href="https://joshuatz.com/posts/2021/why-every-dev-should-care-about-docs/">
						Why Every Developer Should Care About Documentation — Joshua Tzucker
					</a>
				</li>
				<li>
					April —{' '}
					<a href="https://toddl.dev/posts/dont-ever-give-up/">
						Don't Ever Give Up — Todd Libby
					</a>
				</li>
				<li>
					May —{' '}
					<a href="https://uxdesign.cc/systems-thinking-chess-when-the-iceberg-model-has-64-squares-652c3f70ccf">
						Systems thinking & chess: When the iceberg model has 64 squares -
						Jessi Sharkarian
					</a>
				</li>
				<li>
					June —{' '}
					<a href="https://dev.to/rafi993/optimizing-pull-request-for-developer-happiness-1gj2">
						Optimizing pull request for developer happiness — Mohamed Rafi
					</a>
				</li>
				<li>
					July —{' '}
					<a href="https://css-tricks.com/a-step-by-step-process-for-turning-designs-into-code/">
						A Step-By-Step Process for Turning Designs Into Code — Mark Noonan
					</a>
				</li>
				<li>
					August —{' '}
					<a href="https://www.jenniferkonikowski.com/blog/2021/8/26/why-we-should-stop-talking-about-imposter-syndrome-in-tech">
						Why We Should Stop Talking About Imposter Syndrome In Tech —
						Jennifer Konikowski
					</a>
				</li>
				<li>
					September —{' '}
					<a href="https://dev.to/abbeyperini/8-things-i-ve-learned-working-in-a-legacy-codebase-4h6c">
						8 Things I've Learned Working in a Legacy Codebase — Abbey Perini
					</a>
				</li>
				<li>
					October —{' '}
					<a href="https://www.jenkens.dev/blog/retiring-a-side-project/">
						Retiring your side projects — Jen Kennedy
					</a>
				</li>
				<li>
					November —{' '}
					<a href="https://taiwodevlab.hashnode.dev/building-an-address-book-dapp-part-1-ckwgcml6h0d8nxts1dklvfl1d">
						Building An Address Book dApp. — Taiwo Hassan Yusuf
					</a>
				</li>
				<li>
					December —{' '}
					<a href="https://dev.to/cerchie/my-family-solves-a-code-challenge-14ea">
						My family solves a code challenge 🎁 — Lucia Cerchie
					</a>
				</li>
			</ul>

			<div className="card my-5 border-primary">
				<div className="card-body">
					<h5 className="card-title text-primary font-italic">Member Wins</h5>
					<div className="card-text">
						<blockquote className="blockquote">
							<p className="mb-0">
								As always, shout-out to all our members celebrating new roles
								this month!
							</p>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">
								"Win: FINALLY finished refactoring the testing rig at work so
								that it instantiates the part of the application my team owns
								properly."
							</p>
							<footer className="blockquote-footer">Amy</footer>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">
								"I was accepted to a scholarship program to improve my skills!"
							</p>
							<footer className="blockquote-footer">Chris</footer>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">
								"Really excited I've released my first blog post today."
							</p>
							<footer className="blockquote-footer">Daniel</footer>
						</blockquote>
					</div>
				</div>
			</div>

			<h2>What our members are up to</h2>
			<ul>
				<li>
					Check out some of our resident streamers:{' '}
					<a href="https://www.twitch.tv/bekahhw">Bekah</a>,{' '}
					<a href="https://www.twitch.tv/nickytonline">Nick</a>,{' '}
					<a href="https://www.twitch.tv/jonathanyeong">Jono</a>,{' '}
					<a href="https://www.twitch.tv/arthurdoler">Arthur</a>, and{' '}
					<a href="https://www.twitch.tv/iandouglas736">Ian</a>
				</li>
			</ul>

			<h3>Open Source Projects</h3>
			<ul>
				<li>
					<a href="https://github.com/Virtual-Coffee/virtualcoffee.io/issues">
						VirtualCoffee.io
					</a>
					, an 11ty Web App for our community created by Dan Ott
				</li>
				<li>
					<a href="https://protege.dev/">Protege.dev</a>, a React Web App to
					help junior devs find remote jobs by Drew Clements
				</li>
				<li>
					<a href="https://github.com/drone/drone">DRONE</a> - a Continuous
					Delivery system built on container technology
				</li>
				<li>
					<a href="https://jesscss.github.io/">JESS CSS</a> - a CSS
					pre-processor that compiles to Javascript!
				</li>
			</ul>
		</>
	);
}
