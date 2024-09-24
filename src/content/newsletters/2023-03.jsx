import Link from 'next/link';

export const handle = {
	meta: {
		title: 'Virtual Coffee Newsletter, March 2023',
		description: 'Public Speaking! 💝',
	},
	date: '2023-03-01',
	listTitle: 'March 2023',
};

export default function Issue() {
	return (
		<>
			<h2>Hey VC family!</h2>

			<p className="lead">
				Last month we focused on getting ready for the job hunt. Now it's time
				to speak up and share your interests. We're wrapping up the month with
				one of our favourite events of the year, Lightning Talks!
			</p>

			<hr />

			<h2>💞 Kindness and Gratitude</h2>
			<p>
				<em>Spotlighting some of the kindness happening in our community.</em>
			</p>
			<blockquote className="blockquote">
				<p className="mb-0">
					"I am grateful for my new job I started this week. I found it via Alex
					here at VC"
				</p>
				<footer className="blockquote-footer">Alex</footer>
			</blockquote>
			<blockquote className="blockquote">
				<p className="mb-0">
					"I’m grateful for Mark being in my breakout room yesterday and
					bringing up instruments and music."
				</p>
				<footer className="blockquote-footer">Bekah</footer>
			</blockquote>
			<blockquote className="blockquote">
				<p className="mb-0">
					"I'm grateful for being able to spend some nights at the coworking
					room (after ages) and be with friends. And I'm always grateful for my
					VC family."
				</p>
				<footer className="blockquote-footer">Ayu</footer>
			</blockquote>
			<blockquote className="blockquote">
				<p className="mb-0">
					"I'm grateful for Virtual Coffee! You are all rockstars!"
				</p>
				<footer className="blockquote-footer">Jessica</footer>
			</blockquote>

			<hr />

			<h2 className="my-5">📆 What's happening at Virtual Coffee</h2>

			<h3 className="font-italic">February Recap</h3>
			<p>
				Monthly challenge -&gt;{' '}
				<Link href="/monthlychallenges/feb-2023">
					Month of Job Readiness Challenge
				</Link>
				!
			</p>
			<p>
				Last month we got all things job ready by working on resumes, personal
				sites, elevator pitches. Shoutout to all our participants and oragnizers
				who made it all happen!
			</p>

			<h3 className="font-italic">March -&gt; Public Speaking!</h3>
			<p>
				<strong>It's time to speak up!</strong>
			</p>
			<p>
				Public speaking is consistency listed as one of people's biggest fears.
				Here at Virtual Coffee, we think one of the big steps to becoming
				comfortable speaking in public is having a supportive environment and
				doing tough things together! At the end of the month we'll be having our
				annual lightning talks and we're spending the entire month learning
				about how to share our stories and insights through speech.
			</p>
			<p>
				So if you've been interesting in practicing a talk, planning a talk, or
				just sharing some amazing stories, this is the time!
			</p>
			<p>
				Check out the #monthly-challenge channel in the Slack for more details!
			</p>

			<h4 className="mt-4">☕🪑 Coffee Table Events</h4>
			<ul>
				<li>Tech Interview Study Group (Mondays at 4:00 PM ET)</li>
				<li>
					Accountabilibuddies (Tuesdays at 7:00 PM ET, Thursdays at 9:00 AM ET,
					and every other Sundays at 1:00 PM ET)
				</li>
				<li>
					Indie-startup hackers (Every other Wednesday at 12:00 PM ET — see
					#indie-startup-hackers)
				</li>
				<li>
					Frontend Friday Folks fighting CSSBattle.dev (Fridays at 2:00 PM ET)
				</li>
			</ul>

			<h4 className="mt-4">☕ Official Virtual Coffee Events</h4>
			<ul>
				<li>
					Virtual Coffee (Tuesdays at 9:00 AM ET | Thursdays at 12:00 PM ET)
				</li>
				<li>
					TypeScript Tuesday (Tuesdays at 2:00 PM ET on{' '}
					<a href="https://www.twitch.tv/virtualcoffeeio">Twitch</a>)
				</li>
				<li>Async Twitter Chat (Friday, prompts tweeted out at 9:00 AM ET)</li>
			</ul>

			<p>
				Note: These are the currently scheduled times for these events at the
				time of this publication. Please check the official VC #announcements
				Slack channel, or other noted channels, for any updates and links to
				event rooms. For the full list of events, check out{' '}
				<Link href="/events">our events page</Link>.
			</p>

			<h3 className="mb-3 font-italic">Volunteering at VC</h3>
			<p>
				We're very excited to continue open membership with the support of our
				active volunteers! All our active volunteers have an invite to send out
				to someone interested in joining Virtual Coffee. If you're interested in
				joining the volunteer team, check out some the roles{' '}
				<Link href="/resources/virtual-coffee/get-involved/paths-to-leadership">
					here
				</Link>
				!
			</p>

			<hr />

			<h2>Member Highlights</h2>

			<h3>Blogposts</h3>
			<p>
				<em>Here are some of the awesome content our members produced!</em>
			</p>
			<ul>
				<li>
					<a href="https://yyt.dev/blog/apps/how-to-choose-an-ecommerce-platform">
						How to choose an eCommerce platform? — Dominic Duffin
					</a>
				</li>
				<li>
					<a href="https://dev.to/thegrumpyenby/i-hardcoded-my-portfolio-website-810-would-make-this-mistake-again-k5d">
						I Hardcoded My Portfolio Website — 8/10 Would Make This Mistake
						Again! — Kai Katschthaler
					</a>
				</li>
				<li>
					<a href="https://www.youtube.com/watch?v=sU7-SfukPT8">
						Audience vs Community — Bekah Hawrot Weigel
					</a>
				</li>
				<li>
					<a href="https://dev.to/abbeyperini/from-research-to-writing-reference-material-2ao9">
						From Research to Writing Reference Material — Abbey Perini
					</a>
				</li>
				<li>
					<a href="https://blog.spinthemoose.com/2023/02/05/terraform-plugin-framework-optional-attributes-with-defaults/">
						Terraform Plugin Framework: Optional Attributes with Defaults —
						David Alpert
					</a>
				</li>
			</ul>

			<div className="card my-5 border-primary">
				<div className="card-body">
					<h5 className="card-title text-primary font-italic">Member Wins</h5>
					<div className="card-text">
						<blockquote className="blockquote">
							<p className="mb-0">
								"Done my first talk in a while, yay! good way to get back into
								it all."
							</p>
							<footer className="blockquote-footer">Brett</footer>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">
								"Finally managed to get NgRx properly integrated into my
								project. Took forever but now it works."
							</p>
							<footer className="blockquote-footer">Finn</footer>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">
								"The freeCodeCamp blog post on our Bad Website Club learning
								project is finally live and I am beyond elated."
							</p>
							<footer className="blockquote-footer">Ramón</footer>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">
								"Only 3.5 months into my new job and my boss already wants to
								officially make me the tech lead on the team. I've unofficially
								had that role on many teams in the past, but it's nice to be
								getting it officially for the first time."
							</p>
							<footer className="blockquote-footer">Brian</footer>
						</blockquote>
					</div>
				</div>
			</div>

			<h2>What our members are up to</h2>
			<h3>🎤 The Virtual Coffee Podcast (Season Seven)</h3>
			<ul>
				<li>
					<Link href="/podcast/jörn-bernhardt-becoming-a-founder">
						Jörn Bernhardt — Becoming a Founder
					</Link>
				</li>
				<li>
					<Link href="/podcast/joe-karow-career-transitions-and-the-adhd-experience">
						Joe Karow — Career Transitions and the ADHD Experience
					</Link>
				</li>
				<li>
					<Link href="/podcast/kai-katschthaler-technical-writing-neurodiverse-learning">
						Kai Katschthaler — Technical Writing & Neurodiverse Learning
					</Link>
				</li>
				<li>
					<Link href="/podcast/aishwarya-mali-a-journey-into-open-source">
						Aishwarya Mali — A Journey into Open Source
					</Link>
				</li>
				<li>
					<Link href="/podcast/rebecca-key-from-phd-to-frontend">
						Rebecca Key — From PhD to Frontend
					</Link>
				</li>
			</ul>

			<h3>📺 Ongoing Content</h3>
			<p>
				Check out some of our resident streamers:{' '}
				<a href="https://www.twitch.tv/bekahhw">Bekah</a>,{' '}
				<a href="https://www.twitch.tv/nickytonline">Nick</a>,{' '}
				<a href="https://www.twitch.tv/hobojohn6">Andrew Harper</a>,{' '}
				<a href="https://www.twitch.tv/arthurdoler">Arthur</a>, and{' '}
				<a href="https://www.twitch.tv/iandouglas736">Ian</a>.
			</p>
			<ul>
				<li>
					<a href="https://www.nickyt.co/news">Nick Taylor's newsletter</a>{' '}
					keeps you up to date with the hot topics in tech.
				</li>
				<li>
					Newsletter alert!{' '}
					<a href="https://vic.substack.com/p/issue-1-code-as-gardening-the-rise">
						{' '}
						Code as Gardening: The Rise of AI — Vic Vijayakumar
					</a>
				</li>
				<li>
					<a href="https://www.getrevue.co/profile/luciacerchie">
						Lucia Cerchie's newsletter
					</a>{' '}
					is a breath of fresh air in the tech space.
				</li>
				<li>
					Dominic Duffin co-hosts{' '}
					<a href="https://twitter.com/ArtTechChat">ArtTechChat on Twitter</a>{' '}
					every Sunday at 1:00 PM ET.
				</li>
			</ul>

			<h3>Open Source Projects</h3>
			<ul>
				<li>
					<a href="https://github.com/Virtual-Coffee/virtualcoffee.io/issues">
						VirtualCoffee.io
					</a>{' '}
					— a Remix Web App for our community created by Dan Ott
				</li>
				<li>
					<a href="https://github.com/AmyShackles/regex_parser">Regex Parser</a>{' '}
					— a regular expression parser project by Amy Shackles
				</li>
				<li>
					<a href="https://github.com/drone/drone">DRONE</a> — a Continuous
					Delivery system built on container technology
				</li>
				<li>
					<a href="https://jesscss.github.io/">JESS CSS</a> — a CSS
					pre-processor that compiles to JavaScript!
				</li>
				<li>
					<a href="https://github.com/BekahHW/postpartum-wellness-app">
						Postpartum Wellness App
					</a>{' '}
					— a React Native App by Bekah HW
				</li>
			</ul>
		</>
	);
}
