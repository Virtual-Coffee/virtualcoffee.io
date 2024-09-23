import Link from 'next/link';

export const handle = {
	listTitle: 'April 2021',
	meta: {
		title: 'Virtual Coffee Newsletter, April 2021',
		description:
			"What we're up to in April: celebrating a year of growth, friends, and Virtual Coffee 💝",
	},
	date: '2021-04-01',
};

export default function Issue() {
	return (
		<>
			<h2>Hey friends!</h2>

			<p className="lead">
				We made it a year 🎉 I never would've guessed that{' '}
				<a href="https://twitter.com/BekahHW/status/1245829083025428481?s=20">
					a tweet
				</a>{' '}
				inviting people to talk about the job search would turn into a year of
				100+ Virtual Coffees, 2 rounds of Lightning Talks, a Hacktoberfest
				event, brownbags, bookclubs, member-formed groups, a{' '}
				<a href="Postpartum Wellness App,">podcast</a>, this newsletter, an
				amazing community, and so much more.
			</p>

			<p className="lead">
				I didn't know if anyone would want to hang out for one virtual coffee,
				let alone more than a hundred.
			</p>

			<p className="lead">
				Thank you all for showing up. Thank you for being a wonderfully
				supportive community. I'm amazed by everyone here, and I'm so excited
				for what we have planned and to see what the next year of Virtual Coffee
				will bring 💖
			</p>

			<p className="lead">
				Hope to see you soon,
				<br />
				Bekah
			</p>

			<hr />

			<h2>💞 Community Kindness</h2>
			<p className="lead text-muted">
				Spotlighting some of the kindness happening in our community.
			</p>

			<ul>
				<li>
					This is exactly what makes VC special in my book - one member helping
					another, and calling on the group when it goes up a level of
					strangeness (as tech so often does). - Ray
				</li>
				<li>
					Just wanted to thank Marie for all her work in the tech study group
					channel and in the community - Lucia
				</li>
				<li>
					Andy bought two copies of De-Coding the Technical Interview Process
					for members of the community. Thanks Andy!
				</li>
			</ul>

			<hr />

			<h2 className="my-5">📆 What's happening at Virtual Coffee</h2>

			<h3 className="mb-3 font-italic">March Recap:</h3>
			<ul>
				<li>Monthly challenge &gt; Get Job Ready!</li>
				<li>New members: ~29 new members</li>
			</ul>

			<h3 className="mb-3 font-italic">April Happenings:</h3>

			<h4 className="mt-4">💡Monthly Challenge: Month of Kindness!</h4>
			<p>
				It's our VC-anniversary so we wanted to spend a month focusing on the
				most important aspect of Virtual Coffee: the kindness and gratitude we
				show each other on a daily basis. This month, let's let the people
				who've made a positive impact in our lives know it and support each
				other in whatever ways we can.
			</p>

			<h4 className="mt-4">🎙️ Podcasts</h4>
			<p>
				<em>Season Two drops the first week of April!</em>
			</p>
			<ul>
				<li>
					<a href="https://virtualcoffee.io/podcast/0108-kirk/">
						Kirk Shillingford: On Making Mistakes
					</a>
				</li>
				<li>
					<a href="https://virtualcoffee.io/podcast/0109-bekah-dan/">
						Dan and Bekah: Season One wrap up
					</a>
				</li>
			</ul>

			<h4 className="mt-4">🥪 Brownbags</h4>
			<ul>
				<li>
					April 2, 12:00am EDT &gt;{' '}
					<a href="https://meetingplace.io/virtual-coffee/events/5207">
						Debugging Front-End Javascript - Nick Taylor
					</a>
				</li>
				<li>
					April 9, 11:00pm EDT &gt;{' '}
					<a href="https://meetingplace.io/virtual-coffee/events/5268">
						Using a Person-centered Approach in Tech - Bekah Hawrot Weigel
					</a>
				</li>
				<li>
					April 16, 10:00pm EDT &gt;{' '}
					<a href="https://meetingplace.io/virtual-coffee/events/5152">
						Tell Your Story: A Guide To Public Speaking and Presentations - Andy
						Ennamorato
					</a>
				</li>
				<li>
					April 23, 12:00pm EDT &gt;{' '}
					<a href="https://meetingplace.io/virtual-coffee/events/5151">
						Patch Package: Fix Bugs in Packagers Before Their Release - Justin
						Noel
					</a>
				</li>
			</ul>

			<h2>Member Blog Post Highlights</h2>
			<p>
				<em>Some of our member posts we loved in April</em>
			</p>
			<ul>
				<li>
					<a href="https://dev.to/abbeyperini/toggle-dark-mode-in-react-28c9">
						Toggle Dark Mode in React{' '}
					</a>{' '}
					- Abbey Perini
				</li>
				<li>
					<a href="https://joshuatz.com/posts/2021/why-every-dev-should-care-about-docs/">
						Why Every Developer Should Care About Documentation{' '}
					</a>{' '}
					- Joshua Tzucker
				</li>
				<li>
					<a href="https://jshakarian.medium.com/chess-information-architecture-an-introduction-5f9476a4d6e2">
						Chess and Information Architecture: An Introduction{' '}
					</a>{' '}
					- Jessi Sahakarian
				</li>
				<li>
					<a href="https://dev.to/aurelieverrot/the-tale-of-the-k-combinator-and-the-alias-method-34nl">
						The tale of the K combinator and the alias method{' '}
					</a>{' '}
					- Aurelie Verrot
				</li>
				<li>
					<a href="https://dev.to/arctype/database-security-checklist-for-small-teams-2mhj">
						Database Security Checklist for Small Teams{' '}
					</a>{' '}
					- Kirk Shillingford
				</li>
			</ul>

			<div className="card my-5 border-primary">
				<div className="card-body">
					<h5 className="card-title text-primary font-italic">Slack Love</h5>
					<div className="card-text">
						<blockquote className="blockquote">
							<p className="mb-0">
								I did some gratitude journaling this morning, and I wanted to
								say how grateful I am that I'm a part of the VC community. It's
								so nice to see friendly faces every week and to talk about
								interesting topics!"
							</p>
							<footer className="blockquote-footer">Jonathan</footer>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">
								This group has been great for keeping my spirits up when I'm
								feeling down. Thanks to all of you for the well wish and
								encouragement when I've needed it."
							</p>
							<footer className="blockquote-footer">Christopher</footer>
						</blockquote>
					</div>
				</div>
			</div>

			<h2>What our members are up to</h2>
			<ul>
				<li>
					Drew dropped his dev-themed design shop,{' '}
					<a href="http://www.arraydev.shop/">ArrayDev</a>
				</li>
				<li>
					Sherif, Aurelie, and Meg secured top 5 in the WWCode Philadelphia
					Coding Tournament and Sherif won the whole thing!!
				</li>
				<li>Rahat launched the internal beta for his mental health startup!</li>
			</ul>

			<h3>Open Source Projects We Love!</h3>
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
					<a href="https://github.com/BekahHW/postpartum-wellness-app">
						Postpartum Wellness App
					</a>
					, a React Native project by BekahHW
				</li>
			</ul>
		</>
	);
}
