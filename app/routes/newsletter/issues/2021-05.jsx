import { Link } from 'remix';

export const handle = {
	listTitle: 'May 2021',
	meta: {
		title: 'Virtual Coffee Newsletter, May 2021',
		description:
			"What we're up to in May: celebrating feedback and moving forward!",
	},
	date: '2021-05-01',
};

export const meta = () => {
	return handle.meta;
};

export default function Issue() {
	return (
		<>
			<h2>Hey friends!</h2>

			<p className="lead">
				April was a blast and May is looking just as exciting. There are so many
				great things happening in the community and we can't wait to share them
				with you!
			</p>

			<hr />

			<h2>💞 Community Kindness</h2>
			<p className="lead text-muted">
				Spotlighting some of the kindness happening in our community.
			</p>

			<ul>
				<li>
					Just wanna say a HUGGGGEEE thank you to Mike for helping me on Sunday
					prep for my upcoming dev portfolio talk tomorrow. Even though public
					speaking makes my legs shake, his enthusiasm and amazing feedback
					really made me feel like I can actually do the thing!!! If only the
					whole audience was full of Mikes!!! - Annie
				</li>
				<li>
					Thankful for Dan Ott making the new co-working room - opens up new
					possibilities of what VC can do for its community. - Ray
				</li>
				<li>
					A big shout out to Aurelie, Mike, Marie, Courtney, and everyone in the
					#tech-interview-study-group for energy they bring to the group,
					yesterday was my first meeting and came out with a big bag of good
					tips and learning notes. You all are awesome And Julia for bringing a
					special guest - Vanessa
				</li>
			</ul>

			<hr />

			<h2 className="my-5">📆 What's happening at Virtual Coffee</h2>

			<h3 className="mb-3 font-italic">April Recap:</h3>
			<ul>
				<li>Monthly challenge &gt; Month of Kindness!</li>
				<li>New members: ~22 new members</li>
			</ul>

			<h3 className="mb-3 font-italic">May Happenings:</h3>

			<h4 className="mt-4">💡Monthly Challenge: Month of Feedback!</h4>
			<p>
				We know that being a developer is more than writing code, so this month
				we're working on providing each other with honest and empathetic
				feedback. For the month of May, we're asking members to both ask for
				feedback and to give feedback to others. It could be on a blog post, an
				idea, a coding project, a talk, or whatever you could use feedback on.
				And to go along with our monthly theme, we're also collecting resources
				on how to give good feedback.
			</p>

			<h4 className="mt-4">🎙️ Podcasts</h4>
			<p>
				<em>Season Two is officially here!</em>
			</p>
			<ul>
				<li>
					<a href="https://virtualcoffee.io/podcast/0201-gant/">
						Gant Laborde: Finding your Voice
					</a>
				</li>
				<li>
					<a href="https://virtualcoffee.io/podcast/0202-lucia/">
						Lucia Cerchie: Mom life and finding your confidence
					</a>
				</li>
				<li>
					<a href="https://virtualcoffee.io/podcast/0203-glen/">
						Glen McCallum: From IC to Engineering Manager, and the lessons
						learned along the way
					</a>
				</li>
				<li>
					<a href="https://virtualcoffee.io/podcast/0204-debra-kaye/">
						Debra-Kaye Elliott: The Self-Taught Developer Journey
					</a>
				</li>
			</ul>

			<h4 className="mt-4">🥪 Brownbags</h4>
			<ul>
				<li>
					May 7, 12:00am EDT &gt;{' '}
					<a href="https://meetingplace.io/virtual-coffee/events/5276">
						Brownbag Session: Chess & Usability with Jessi Shakarian
					</a>
				</li>
				<li>
					May 10, 12:00pm EDT &gt;{' '}
					<a href="https://meetingplace.io/virtual-coffee/events/5892">
						Brownbag Session: How to Promote Yourself to Potential Employers
						with Abbey Perini
					</a>
				</li>
				<li>
					May 21, 12:00pm EDT &gt;{' '}
					<a href="https://meetingplace.io/virtual-coffee/events/5890">
						Brownbag: Raise your Voice with Meryl Dominguez
					</a>
				</li>
			</ul>

			<h2>Member Blog Post Highlights</h2>
			<p>
				<em>Some of our member posts we loved in May</em>
			</p>
			<ul>
				<li>
					<a href="https://toddl.dev/posts/dont-ever-give-up/">Don't Give Up</a>{' '}
					- Todd Libby
				</li>
				<li>
					<a href="https://dev.to/abbeyperini/breaking-into-tech-tips-from-a-former-recruiting-admin-ona">
						Breaking Into Tech - Tips from a Former Recruiting Admin
					</a>{' '}
					- Abbey Perini
				</li>
				<li>
					<a href="https://shift.infinite.red/the-remote-work-starter-kit-desk-stuff-edition-6b841b8c745">
						The Remote Work Starter Kit: Desktop Edition
					</a>{' '}
					- Gant Laborde
				</li>
				<li>
					<a href="https://vicvijayakumar.com/blog/the-most-interesting-bug-ever">
						The Most Interesting Bug Ever
					</a>{' '}
					- Vic Vijayakumar
				</li>
				<li>
					<a href="https://dev.to/clgolden/there-s-a-new-vs-code-sass-compiler-in-town-4ij8">
						There's a new VScode SASS compiler in town
					</a>{' '}
					- Christine Golden
				</li>
			</ul>

			<div className="card my-5 border-primary">
				<div className="card-body">
					<h5 className="card-title text-primary font-italic">Slack Love</h5>
					<div className="card-text">
						<blockquote className="blockquote">
							<p className="mb-0">
								Thank you to everyone for their support and encouragement. VC
								has been so instrumental in my 2021 journey and I am very
								thankful for everyone."
							</p>
							<footer className="blockquote-footer">Seth</footer>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">
								Grateful for VC. This community keeps me going, you have no idea
								💙."
							</p>
							<footer className="blockquote-footer">Debra-Kaye</footer>
						</blockquote>
						<blockquote className="blockquote">
							<p className="mb-0">
								Grateful, always, for this awesome community and the support of
								people like @ray Deck, @tom Cudd and @ryan Lynch who take the
								time to help me understand things that feel like they’re way
								over my head."
							</p>
							<footer className="blockquote-footer">Julia S.</footer>
						</blockquote>
					</div>
				</div>
			</div>

			<h2>What our members are up to</h2>
			<ul>
				<li>
					It's no coincidence that 5/6 CodeNewbie Community spotlights are
					Virtual Coffee members! Congratulations to Ayu on being the latest{' '}
					<a href="https://community.codenewbie.org/codenewbiestaff/series/13">
						spotlight
					</a>
					!
				</li>
				<li>
					Katherine Peterson wrote a <a href="https://readme.so/">cool tool</a>{' '}
					to help with Readmes!
				</li>
				<li>
					Also,{' '}
					<a href="https://twitter.com/MissyElliott/status/1386707191617527812">
						this happened
					</a>
					;)
				</li>
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
