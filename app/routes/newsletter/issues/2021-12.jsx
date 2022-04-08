import { Link } from 'remix';

export const handle = {
	listTitle: 'December 2021',
	meta: {
		title: 'Virtual Coffee Newsletter, December 2021',
		description: "We're getting creative this month!",
	},
	date: '2021-12-01',
};

export const meta = () => {
	return handle.meta;
};

export default function Issue() {
	return (
		<>
			<h2>Hey friends!</h2>

			<p className="lead">
				We had an AMAZING November and we're set to end the year in the spirit
				of support and celebration of our full selves.
			</p>

			<hr />

			<h2>💞 Community Kindness</h2>
			<p>
				<em>Spotlighting some of the kindness happening in our community.</em>
			</p>
			<blockquote className="blockquote">
				<p className="mb-0">
					"I'm grateful for all the advice I get from VC members. I have a
					standing meeting that conflicts with my normal Thursday meeting so I
					can't attend as much, but the community is always available and has
					helped me so much this year as I figured out what I wanted to do next
					in my career."
				</p>
				<footer className="blockquote-footer">William</footer>
			</blockquote>
			<blockquote className="blockquote">
				<p className="mb-0">
					"(Grateful for) All of you! I took a couple of days off this week for
					my birthday and b/c elementary schools were closed for parent/teacher
					conferences, and it made me feel so good to see all the birthday
					wishes when I logged on this morning! So many friends!"
				</p>
				<footer className="blockquote-footer">Julia</footer>
			</blockquote>
			<blockquote className="blockquote">
				<p className="mb-0">
					"I'm grateful for this community of wonderful people and your open
					hearts."
				</p>
				<footer className="blockquote-footer">David</footer>
			</blockquote>

			<hr />

			<h2 className="my-5">📆 What's happening at Virtual Coffee</h2>

			<h3 className="font-italic">November Recap</h3>
			<ul className="mb-5">
				<li>
					Monthly challenge -&gt;{' '}
					<a href="https://virtualcoffee.io/monthlychallenges/nov-2021/">
						Month of Writing
					</a>
					<p>
						Virtual Coffee took part in the NaNoWriMo (National November Writing
						Month) event and had a blast. Last year we tried for 50k words and
						got about 38k. This year we over 30 participants submit 136 articles
						and contribute
						<strong>over 125k words</strong>! See the full list of participants
						and articles{' '}
						<a href="https://virtualcoffee.io/monthlychallenges/nov-2021/">
							here
						</a>
						.
					</p>
				</li>
				<li>New members: 38 new members</li>
			</ul>

			<h3 className="mb-3 font-italic">December Happenings</h3>

			<h4 className="mt-4">
				💡 Monthly Theme &amp; Challenge:{' '}
				<a href="https://virtualcoffee.io/monthlychallenges/dec-2021/">
					Creative community challenge
				</a>
				!
			</h4>
			<p>
				Devs are more than just the code we write. This month is all about
				embracing self-expression. Give back to yourself by indulging in
				something just for fun. Share the art, music, poetry, sports, games, or
				any other hobbies that spark joy for you. We spend so much time grinding
				away on understanding things in the tech space. Let's make some space
				for the other parts of ourselves.
			</p>

			<h4 className="mt-4">🎙️ Podcasts</h4>
			<p>
				<em>Season 4 of the podcast is here!</em>
			</p>
			<ul>
				<li>
					<a href="https://virtualcoffee.io/podcast/0405-suze-shardlow/">
						Suze Shardlow - Creating welcoming spaces in dev communities
					</a>
				</li>
				<li>
					<a href="https://virtualcoffee.io/podcast/0406-bryan-healey/">
						Bryan Healey - The Entrepreneurial Journey of a Startup Founder
					</a>
				</li>
				<li>
					<a href="https://virtualcoffee.io/podcast/0407-jessica-wilkins/">
						Jessica Wilkins - Growing your tech career through writing
					</a>
				</li>
				<li>
					<a href="https://virtualcoffee.io/podcast/0408-maeling-murphy/">
						Maeling Murphy - Transitioning to tech, and taking notes along the
						way
					</a>
				</li>
			</ul>

			<h4 className="mt-4">🥪 Member Events</h4>
			<p>
				<em>These are members-only events that last for 45 - 90 minutes.</em>
			</p>
			<ul>
				<li>
					Dec 10, 12:00pm EST:{' '}
					<a href="https://meetingplace.io/virtual-coffee/events/8350">
						Lunch & Learn: How To Optimize Your Resume For Both A Hiring Manager
						And An ATS w/ Abbey Perini and Jennifer Konikowski
					</a>
				</li>
				<li>
					Dec 17, 12:00pm EST:{' '}
					<a href="https://meetingplace.io/virtual-coffee/events/8483">
						Lunch & Learn: String Theory w/ Meg Gutshall
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
					Some of our member posts we loved in November. Honestly, there were so
					many great ones you should really check out the{' '}
					<a href="https://virtualcoffee.io/monthlychallenges/nov-2021/">
						full list
					</a>
					.
				</em>
			</p>
			<ul>
				<li>
					<a href="https://dev.to/matthewdean/simplicity-as-a-feature-14be">
						Simplicity as a Feature - Matthew Dean
					</a>
				</li>
				<li>
					<a href="https://dev.to/codergirl1991/how-i-got-over-my-fear-of-asking-questions-as-a-new-junior-developer-1m86">
						How I got over my fear of asking questions as a new junior developer
						- Jessica Wilkins
					</a>
				</li>
				<li>
					<a href="https://dev.to/lsparlin/hacktoberfest-and-hello-3igf">
						Hacktoberfest and Hello - Lewis Sparlin
					</a>
				</li>
				<li>
					<a href="https://dev.to/aurelieverrot/be-a-happy-coder-jjf">
						Be a Happy Coder - Aurelie Verrot
					</a>
				</li>
				<li>
					<a href="https://justinnoel.dev/2021/11/12/americas-veteran-suicide-crisis/">
						America's Veteran Suicide Crisis - Justin Noel
					</a>
				</li>
				<li>
					<a href="https://www.jenkens.dev/blog/how-i-built-my-digital-garden/">
						How I built my digital garden - Jen Kennedy
					</a>
				</li>
				<li>
					<a href="https://taiwodevlab.hashnode.dev/building-an-address-book-dapp-part-1-ckwgcml6h0d8nxts1dklvfl1d">
						Building An Address Book dApp. - Yusuf Taiwo
					</a>
				</li>
			</ul>

			<div className="card my-5 border-primary">
				<div className="card-body">
					<h5 className="card-title text-primary font-italic">Member Wins</h5>
					<div className="card-text">
						<blockquote className="blockquote">
							<p className="mb-0">
								"I have a demo for the database project I've been working on
								since June. From knowing NOTHING other than primitive React ...
								I managed to put my friend's data into postgres on AWS, write a
								bunch of node/express endpoints, and call them from a React App
								Component."
							</p>
							<footer className="blockquote-footer">Cris C.</footer>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">
								"The recording of my public tech talk(been some time that I have
								presented), where I was a co-presenter, is up{' '}
								<a href="https://hasura.io/enterprisegraphql/improving-quality-of-life-for-aussie-farmers/">
									here
								</a>
								."
							</p>
							<footer className="blockquote-footer">Jags</footer>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">
								"I've finally finished this simple{' '}
								<a href="https://lelouch-manager.web.app/signin">blog-app</a>{' '}
								after a long struggle with firebase v9 and redux. it's still a
								lot of stuff to add, especially the styling part, but the main
								functionality is there."
							</p>
							<footer className="blockquote-footer">Reda B.</footer>
						</blockquote>
					</div>
				</div>
			</div>

			<h2>What our members are up to</h2>
			<ul>
				<li>Shoutout to all our members starting new roles this month.</li>
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
