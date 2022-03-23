import { Link } from 'remix';

export const handle = {
	meta: {
		title: 'Virtual Coffee Newsletter, March 2022',
		description: 'Getting ready to roll into year three!',
	},
	date: '2022-03-01',
	listTitle: 'March 2022',
};

export const meta = () => {
	return handle.meta;
};

export default function Issue() {
	return (
		<>
			<h2>Hey friends!</h2>

			<p className="lead">
				February was all about pairing up together and March is going to be all
				about making audio and video content, prepping for our lightning talks,
				and strengthening our community!
			</p>

			<hr />

			<h2>💞 Community Kindness</h2>
			<p>
				<em>Spotlighting some of the kindness happening in our community.</em>
			</p>
			<blockquote className="blockquote">
				<p className="mb-0">
					"The virtual coffee meeting I joined on Tuesday was amazing, I am
					truly grateful to have found this community. I can’t wait to hang out
					more, learn from you and get to know you guys. Nice to meet you all!"
				</p>
				<footer className="blockquote-footer">Ayça</footer>
			</blockquote>
			<blockquote className="blockquote">
				<p className="mb-0">
					"I am grateful for 100Devs and Virtual Coffee. Meeting so many amazing
					people in tech."
				</p>
				<footer className="blockquote-footer">Jeremy</footer>
			</blockquote>

			<hr />

			<h2 className="my-5">📆 What's happening at Virtual Coffee</h2>

			<h3 className="font-italic">February Recap</h3>
			<p>
				Monthly challenge -&gt;
				<Link to="/monthlychallenges/feb-2022/">All About Pairing!</Link>
			</p>
			<p>
				We spent the month of February forming teams to share ideas and work on
				projects.
			</p>

			<h3 className="mb-3 font-italic">VC Phase Three</h3>
			<p>
				It’s almost been two years since the first Virtual Coffee happened.
				We’ve met so many new friends, learned and grew together, and formed
				into the welcoming community we have today.
			</p>
			<p>
				As we move into this third year of Virtual Coffee, the maintainers--with
				the help of a team of invested community members--have made the decision
				to pause new membership while we work on finding the best ways to
				support our existing community and define what the new year will look
				like for us all.
			</p>
			<p>
				We’re very excited to be going into another year of Virtual Coffee with
				you all, taking on new challenges, and making space for everyone here.
			</p>

			<h3 className="mb-3 font-italic">A new way to join our meetings</h3>
			<p>
				To make our internal events easier to discover and to standardize the
				process to join any Virtual Coffee event, you'll now check the
				announcements for a "Join Now" button before the event. You can also see
				our new and improved
				<Link to="/events">Virtual Coffee Events page</Link> to see what
				official Virtual Coffee and member-led events we have going on every
				week!
			</p>
			<p>
				<strong>
					**Please note that links from meetingplace will no longer work.
				</strong>
			</p>

			<h3 className="mb-3 font-italic">March Happenings</h3>
			<h4 className="mt-4">
				💡 Monthly Theme &amp; Challenge:
				<Link to="/monthlychallenges/mar-2022/">
					Month of Creating Audio/Visual content
				</Link>
				!
			</h4>
			<p>
				We all have something to share. And when we share with others, we both
				invite them to share with us and create a community of knowledge sharing
				and access to learning. This month, we'll focus on a different form of
				sharing: Audio/Visual!
			</p>
			<h4 className="mt-4">💡 Maintainer's Q&A — March 25th</h4>
			<p>
				One of our maintainer's will be hosting a zoom session where members of
				the community have the chance to ask questions, give feedback, and have
				a casual, thoughtful conversation about the state of the community.
			</p>
			<h4 className="mt-4">💡 Lightning Talks are back!</h4>
			<p>We're bringing back the lightning talks!!!</p>
			<p className="mb-0">Day/Time: April 8th</p>
			<p className="mb-0">Details: Several 7-10 minutes tech-related talks</p>
			<p className="mb-0">How: Livestreamed to the VC community</p>

			<h2>Member Blogpost Highlights</h2>
			<p>
				<em>
					Here's some of the awesome articles our members wrote to kick the year
					off!
				</em>
			</p>
			<ul>
				<li>
					<a href="https://taiwodevlab.hashnode.dev/debugging-with-vscodes-inbuilt-debugger-cl0e7kemg05ccm9nv1n9x9uf9">
						Debugging with VSCode's inbuilt Debugger - Taiwo Yusuf
					</a>
				</li>
				<li>
					<a href="https://dev.to/abbeyperini/weve-been-here-since-the-beginning-2nnp">
						We've Been Here Since the Beginning - Abbey Perini
					</a>
				</li>
				<li>
					<a href="https://vicvijayakumar.com/blog/the-art-of-writing-good-commit-messages">
						Zen and the art of writing good commit messages - Vic Vijayakumar
					</a>
				</li>
				<li>
					<a href="https://dev.to/raeplusplus/100devs-bootcamp-month-1-52hm">
						#100Devs Bootcamp - Raeshelle Rose
					</a>
				</li>
			</ul>

			<div className="card my-5 border-primary">
				<div className="card-body">
					<h5 className="card-title text-primary font-italic">Member Wins</h5>
					<div className="card-text">
						<blockquote className="blockquote">
							<p className="mb-0 font-italic">
								As always, shout-out to all our members celebrating new roles
								this month!
							</p>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">
								"Finished my first hackathon with the help of Andrea and Leo."
							</p>
							<footer className="blockquote-footer">Andrew</footer>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">
								"Win: got an award at a company awards ceremony!"
							</p>
							<footer className="blockquote-footer">Amy</footer>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">
								"Win: The environment setup guide I wrote for onboarding worked
								well. I was able to pair with a new dev and get their local
								environment working in a couple of hours."
							</p>
							<footer className="blockquote-footer">Brian</footer>
						</blockquote>
					</div>
				</div>
			</div>

			<h2>What our members are up to</h2>
			<ul>
				<li>
					Check out some of our resident streamers:
					<a href="https://www.twitch.tv/bekahhw">Bekah</a>,
					<a href="https://www.twitch.tv/nickytonline">Nick</a>,
					<a href="https://www.twitch.tv/jonathanyeong">Jono</a>,
					<a href="https://www.twitch.tv/arthurdoler">Arthur</a>, and
					<a href="https://www.twitch.tv/iandouglas736">Ian</a>.
				</li>
				<li>
					<a href="https://www.getrevue.co/profile/nickytonline/issues/yet-another-newsletter-lol-issue-31-1002343">
						Nick Taylor's newsletter
					</a>
					keeps you up to date with the hot topics in tech.
				</li>
				<li>
					Arthur Doler created
					<a href="https://www.youtube.com/watch?v=-XYK8ulQId0">
						an amazing talk about burnout
					</a>
					.
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
					<a href="https://github.com/AmyShackles/regex_parser">Regex Parser</a>
					, a regular expression parser project by Amy Shackles
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
