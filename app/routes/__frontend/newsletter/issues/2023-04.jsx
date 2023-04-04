import { Link } from '@remix-run/react';

export const handle = {
	meta: {
		title: 'Virtual Coffee Newsletter, April 2023',
		description: "We're going into our 4th year! 💝",
	},
	date: '2023-04-01',
	listTitle: 'April 2023',
};

export const meta = () => {
	return handle.meta;
};

export default function Issue() {
	return (
		<>
			<h2>Hey friends!</h2>
			<p className="lead">
				March was a great month for our lightning talks, and now we're
				incredibly happy to be sharing what makes our community special as we
				move into the fourth year of Virtual Coffee.
			</p>

			<hr />

			<h2>💞 Kindness and Gratitude</h2>
			<p>
				<em>Spotlighting some of the kindness happening in our community.</em>
			</p>
			<blockquote className="blockquote">
				<p className="mb-0">
					"Grateful for VC lightning talks especially applications with chat gpt
					as a developer with prompt engineering skills [from] Matt McInnis,
					feelings friday session, VC pomodoro flow club sessions to get me and
					keep me in the state of flow at work, and my vyvanse + caffeine pill
					to wake me up this morning."
				</p>
				<footer className="blockquote-footer">Ethan</footer>
			</blockquote>
			<blockquote className="blockquote">
				<p className="mb-0">"Grateful for all of you and your trust in me."</p>
				<footer className="blockquote-footer">Julia</footer>
			</blockquote>
			<blockquote className="blockquote">
				<p className="mb-0">
					"Grateful for VC and for my wife and cats and all kinds of stuff, like
					the idea of pants."
				</p>
				<footer className="blockquote-footer">Mark</footer>
			</blockquote>
			<blockquote className="blockquote">
				<p className="mb-0">
					"I’m grateful for finally feeling a bit better again, even though this
					overall health situation is still super annoying and energy-consuming.
					I’m also super happy that I’ve finally joined the VC volunteer team,
					as that was one of my goals for 2023."
				</p>
				<footer className="blockquote-footer">Kai</footer>
			</blockquote>

			<hr />

			<h2 className="my-5">📆 What's happening at Virtual Coffee</h2>

			<h3 className="font-italic">March Recap</h3>
			<p>Monthly challenge -&gt; Public Speaking!</p>
			<p>
				We were super excited to have so many great lightning talks last week.
				We had 11 members share topics from AI to career development and more.
				You can check out all of the talks on our{' '}
				<a href="https://www.youtube.com/playlist?list=PLh9uT23TA65jtVEGgWo-DNVAcq7PnDV2r">
					YouTube playlist
				</a>
				.
			</p>

			<h3 className="font-italic">April Happenings</h3>
			<p>
				<strong>💡Monthly Theme & Challenge</strong>: Month of Community
				Kindness!
			</p>
			<p>
				As we work hard to make sure this community continues to be the special
				and close-knit group it has been, this challenge encourages our members
				to celebrate one of the things that continually makes this community so
				special: Kindness. Some of the ways we see this include: practicing
				gratitude, reaching out to support other members, mentoring, helping,
				giving honest and constructive feedback, and continuing to make Virtual
				Coffee a safe and supportive space.
			</p>

			<h4 className="mt-4">🎙️ Podcasts</h4>
			<p className="font-italic">
				We successfully finished season 7 of the podcast!
			</p>
			<ul>
				<li>
					<Link to="/podcast/rebecca-key-from-phd-to-frontend">
						Rebecca Key — From PhD to Frontend
					</Link>
				</li>
				<li>
					<Link to="/podcast/arthur-doler-the-human-side-of-tech">
						Arthur Doler — The Human Side of Tech
					</Link>
				</li>
				<li>
					<Link to="/podcast/dominic-duffin-finding-value-in-challenging-ourselves">
						Dominic Duffin — Finding value in challenging ourselves
					</Link>
				</li>
				<li>
					<Link to="/podcast/ramón-huidobro-thoughtful-learning">
						Ramón Huidobro — Thoughtful Learning
					</Link>
				</li>
				<li>
					<Link to="/podcast/season-seven-finale-live-with-nick-taylor">
						Season Seven Finale — Live with Nick Taylor
					</Link>
				</li>
			</ul>

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
				<Link to="/events">our events page</Link>.
			</p>

			<h3 className="mb-3 font-italic">Volunteering at VC</h3>
			<p>
				We're very excited to continue open membership with the support of our
				active volunteers! All our active volunteers have an invite to send out
				to someone interested in joining Virtual Coffee. If you're interested in
				joining the volunteer team, check out some the roles{' '}
				<Link to="/resources/virtual-coffee/get-involved/paths-to-leadership">
					here
				</Link>
				!
			</p>

			<hr />

			<h2>Member Blogpost Highlights</h2>
			<p>
				<em>Some of our member posts we loved in March!</em>
			</p>
			<ul>
				<li>
					<a href="https://dev.to/virtualcoffee/questions-to-ask-in-an-interview-2g0e">
						Questions to ask in an interview — Bekah Hawrot Weigel
					</a>
				</li>
				<li>
					<a href="https://dev.to/shiftyp/backbone-for-react-devs-the-song-remains-the-same-5hi2">
						Backbone for React Devs: The Song Remains the Same — Ryan Kahn
					</a>
				</li>
				<li>
					<a href="https://blog.joshuakgoldberg.com/seven-reasons-why-conversational-ai-is-dangerous/">
						Seven Reasons Why Conversational AI is Dangerous — Josh Goldberg
					</a>
				</li>
				<li>
					<a href="https://hackernoon.com/top-apache-kafkar-interview-questions-for-juniors-in-2023">
						Top Apache Kafka® Interview Questions for Juniors In 2023 — Lucia
						Cerchie
					</a>
				</li>
			</ul>

			<div className="card my-5 border-primary">
				<div className="card-body">
					<h5 className="card-title text-primary font-italic">Member Wins</h5>
					<div className="card-text">
						<blockquote className="blockquote">
							<p className="mb-0">
								"I finally bought my ticket and hotel for Render ATL!"
							</p>
							<footer className="blockquote-footer">Jessica W.</footer>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">
								"Just got selected to speak at THAT Conference in July."
							</p>
							<footer className="blockquote-footer">Brian M.</footer>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">"Joined the KnoCommerce team!!!"</p>
							<footer className="blockquote-footer">Emmett</footer>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">"Got an offer letter!!!!"</p>
							<footer className="blockquote-footer">Q</footer>
						</blockquote>
					</div>
				</div>
			</div>

			<h2>What our members are up to</h2>
			<ul>
				<li>
					Chris J. does a{' '}
					<a href="https://dev.to/jarvisscript/what-are-your-goals-for-the-week-3kc0">
						weekly post for goals of the week.
					</a>
				</li>
				<li>
					Ayu shared her journey into tech and the Power of Communities on the{' '}
					<a href="https://open.spotify.com/episode/6YazPGDQp6vYh8SXy4m1Pn?si=gGURPxOHRN-AX2F7vlX1QA&nd=1">
						Women Who Code podcast
					</a>
					.
				</li>
				<li>
					<a href="https://www.getrevue.co/profile/nickytonline/issues/yet-another-newsletter-lol-issue-31-1002343">
						Nick Taylor's newsletter
					</a>{' '}
					keeps you up to date with the hot topics in tech.
				</li>
				<li>
					Newsletter alert!{' '}
					<a href="https://vic.substack.com/p/issue-1-code-as-gardening-the-rise">
						{' '}
						Code as Gardening: The Rise of AI — Vic Vijayakumar
					</a>
					.
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
