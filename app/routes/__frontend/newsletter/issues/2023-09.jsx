import { Link } from '@remix-run/react';
import LeadText from '~/components/content/LeadText';

export const handle = {
	meta: {
		title: 'Virtual Coffee Newsletter, September 2023',
		description: 'Preptember begins! 💝',
	},
	date: '2023-09-01',
	listTitle: 'September 2023',
};

export const meta = () => {
	return handle.meta;
};

export default function Issue() {
	return (
		<>
			<h2>Hey fellow Open Source Contributors!</h2>
			<LeadText>
				August was healthy habits, but now we're back in the technical swing of
				things by getting ready for HACKTOBERFEST!
			</LeadText>

			<hr />

			<h2>💞 Kindness and Gratitude</h2>
			<p>
				<em>Spotlighting some of the kindness happening in our community.</em>
			</p>
			<blockquote className="blockquote">
				<p className="mb-0">
					"I'm grateful for a nice OSS chat and discussion with Dominic."
				</p>
				<footer className="blockquote-footer">Ayu</footer>
			</blockquote>
			<blockquote className="blockquote">
				<p className="mb-0">
					"Grateful to be part of the community, and looking forward to chatting
					with more of you!"
				</p>
				<footer className="blockquote-footer">Ren</footer>
			</blockquote>
			<blockquote className="blockquote">
				<p className="mb-0">
					"Grateful that this community exists, and Bekah invited me all those
					years ago."
				</p>
				<footer className="blockquote-footer">Kirk</footer>
			</blockquote>

			<hr />

			<h2 className="my-5">📆 What's happening at Virtual Coffee</h2>

			<h3 className="font-italic">August Recap</h3>
			<p>
				<strong>💡Monthly Theme & Challenge: Healthy Habits!</strong>
			</p>
			<p>
				August was all about getting back into the habits that keep us happy and
				healthy throughout the rest of the year. As a community we tried to
				refocus on the important daily/weekly/monthly activities that keep us
				centred.
			</p>

			<h3 className="font-italic">September is Preptember</h3>
			<p>
				<strong>
					💡Monthly Theme & Challenge: Prepping for Hacktoberfest!
				</strong>
			</p>
			<p>
				Every year, this community participates in{' '}
				<a href="https://hacktoberfest.com/">Hacktoberfest</a>, the yearly
				celebration of all things Open Source. In order to make the month as
				successful as possible, we used September to get ready as participants,
				open source maintainers, and mentors. All through the month we'll be
				getting ready, asking each other questions, reviewing each others
				codebases, and doing all the prep necessary to make Hacktoberfest a
				success!
			</p>
			<p>
				<strong>New this year</strong>: We have a repository for our members to
				practice open source, add themselves as Preptember participant, and to
				list repositories that pass our repository checklist to be recommended
				for Hacktoberfest. You can learn more{' '}
				<Link to="/monthlychallenges/sept-2023">here</Link>!
			</p>

			<h4 className="mt-4">🎙️Podcasts</h4>
			<p className="font-italic">Season 8 is out!</p>
			<ul>
				<li>
					<Link to="/podcast/rafi-exploring-side-projects-and-ai">
						Rafi — Exploring Side Projects and AI
					</Link>
				</li>
			</ul>

			<h4 className="mt-4">☕🪑 Coffee Table Events</h4>
			<ul>
				<li>Tech Interview Study Group (Mondays at 4:00 PM ET)</li>
				<li>
					Accountabilibuddies (Tuesdays at 7:00 PM ET | Thursdays at 9:00 AM ET
					| Every other Sundays at 1:00 PM ET)
				</li>
				<li>The Pack Hunt (Tandem Job Hunting) (Wednesdays at 2:00 PM ET)</li>
				<li>Feelings Friday (Fridays at 10:00 AM ET)</li>
				<li>
					Frontend Friday Folks fighting CSSBattle.dev (Fridays at 11:00 AM ET)
				</li>
				<li>
					Savvy Saturday Stylers Slaying CSSBattle.dev (Saturdays at 12:00 PM
					ET)
				</li>
			</ul>

			<h4 className="mt-4">☕ Official Virtual Coffee Events</h4>
			<ul>
				<li>
					Virtual Coffee (Tuesdays at 9:00 AM ET | Thursdays at 12:00 PM ET)
				</li>
				<li>
					Async Twitter Chat (Fridays — prompts tweeted out at 9:00 AM ET)
				</li>
			</ul>

			<p>
				Note: These are the currently scheduled times for these events at the
				time of this publication. Please check the official VC{' '}
				<code>#announcements</code> Slack channel or other noted channels for
				any updates and links to event rooms. For the full list of events, check
				out <Link to="/events">our events page</Link>.
			</p>

			<h3 className="mb-3 font-italic">Volunteering at VC</h3>
			<p>
				We're very excited to continue open membership with the support of our
				active volunteers! All our active volunteers have an invite to send out
				to someone interested in joining Virtual Coffee. If you're interested in
				joining the volunteer team, check out some the roles{' '}
				<Link to="/resources/virtual-coffee-handbook/get-involved/paths-to-leadership">
					here
				</Link>
				!
			</p>

			<hr />

			<h2>Member Content Highlights</h2>
			<p>
				<em>Some of our member contents we loved in August!</em>
			</p>
			<h3>Articles</h3>
			<ul>
				<li>
					<a href="https://dev.to/adiatiayu/open-source-and-git-glossary-mn2">
						Open Source and Git Glossary — Ayu Adiati
					</a>
				</li>
				<li>
					<a href="https://nbatipoff.com/canada-blew-out-france/">
						Canada Blew Out France 2023 FIBA World Cup — Alex Curtis-Slep
					</a>
				</li>
				<li>
					<a href="https://dev.to/abbeyperini/getting-started-in-a-new-codebase-e7b">
						Getting Started in a New Codebase — Abbey Perini
					</a>
				</li>
			</ul>
			<h3>Videos</h3>
			<ul>
				<li>
					<a href="https://www.youtube.com/watch?v=lxrhk1-kJys">
						Hadith tech with Nick Taylor
					</a>
				</li>
			</ul>

			<div className="card my-5 border-primary">
				<div className="card-body">
					<h5 className="card-title text-primary font-italic">Member Wins</h5>
					<div className="card-text">
						<blockquote className="blockquote">
							<p className="mb-0">"I PASSED MY DEMO CERT!"</p>
							<footer className="blockquote-footer">Marie</footer>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">
								"I am excited to announce that I will be full time with
								freeCodeCamp!"
							</p>
							<footer className="blockquote-footer">Jessica</footer>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">
								"Deployed a photo gallery and blog website!"
							</p>
							<footer className="blockquote-footer">Lauren</footer>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">
								Congratulations to Brian Rinaldi for CFE making the nominations
								for most welcoming Dev Community!
							</p>
						</blockquote>
					</div>
				</div>
			</div>

			<h2>What our members are up to</h2>
			<ul>
				<li>
					Chris J. does a{' '}
					<a href="https://dev.to/jarvisscript/series/19128">
						weekly post for goals of the week.
					</a>
				</li>
				<li>
					<a href="https://www.getrevue.co/profile/nickytonline/issues/yet-another-newsletter-lol-issue-31-1002343">
						Nick Taylor's newsletter
					</a>{' '}
					keeps you up to date with the hot topics in tech.
				</li>
				<li>
					Dominic Duffin co-hosts{' '}
					<a href="https://twitter.com/ArtTechChat">ArtTechChat on Twitter</a>{' '}
					every Sunday at 1:00 PM ET.
				</li>
				<li>
					Ray Deck is{' '}
					<a href="https://www.youtube.com/@techmesomethingcool">
						co-hosting a vid-pod about low code/no code solutions
					</a>{' '}
					on YouTube!
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
					<a href="https://github.com/open-sauced/intro">
						Intro to Open Source
					</a>{' '}
					— an open source course to support new contributors to open source
				</li>
				<li>
					<a href="https://jesscss.github.io/">JESS CSS</a> — a CSS
					pre-processor that compiles to JavaScript!
				</li>
			</ul>
		</>
	);
}
