import { Link } from 'remix';

export const handle = {
	listTitle: 'February 2021',
	meta: {
		title: 'Virtual Coffee Newsletter, February 2021',
		description: "What we've been up to and where we're going in February!",
	},
	date: '2021-02-01',
};

export const meta = () => {
	return handle.meta;
};

export default function Issue() {
	return (
		<>
			<h2>Hey friends!</h2>

			<p className="lead">
				January was a pivotal month for Virtual Coffee. Not only did we launch
				our newsletter and podcast, but we saw record growth and made lots of
				plans for the future, so we hope you stay tuned 💖
			</p>

			<hr />

			<h2>💞 Community Kindness</h2>
			<p className="lead text-muted">
				Spotlighting some of the kindness happening in our community.
			</p>
			<ul>
				<li>
					Lucia wants to thank Justin Noel for his generous React tutoring and
					Bogdan for showing her around upgrading Heroku via the command line!
				</li>
				<li>
					We want to thank our friends for all their hard work: Lucia Cerchie
					for offering to document Virtual Coffee processes, Marie Antons for
					organizing the tech-interview-study-group channel, and Mike Rogers and
					Dominic Duffin for organizing the game night channel.
				</li>
				<li>
					Shout out to Kevin Truong for doing a mock interview session to help
					Chad practice and provide feedback.
				</li>
			</ul>

			<hr />

			<h2 className="my-5">📆 What's happening at Virtual Coffee</h2>

			<h3 className="mb-3 font-italic">January Recap:</h3>
			<ul>
				<li>We wrapped up our month of learning</li>
				<li>
					<strong>New members:</strong> 30+ new members
				</li>
				<li>
					Had over 300 downloads of our <a href="/podcast/">podcast</a>
				</li>
			</ul>

			<h3 className="mb-3 font-italic">February Happenings:</h3>
			<h4 className="mt-4">💡 Monthly Challenge: Month of Sharing!</h4>
			<p>
				Our challenge this month focuses on sharing your knowledge, expertise,
				and creative endeavors through audio and video content. We're
				encouraging all our members to participate in our brownbag and lightning
				talk events as well as sharing podcasts, and youtube channels.
			</p>

			<h4 className="mt-4">🎙️ Podcast</h4>
			<ul>
				<li>
					<a href="/podcast/0101-nickyt/">
						Nick Taylor: Open Source, Live Streaming, and Structured YOLO
					</a>
				</li>
				<li>
					<a href="/podcast/0102-marieantons/">
						Marie Antons: From Chef to Tech
					</a>
				</li>
				<li>
					<a href="/podcast/0103-tori-crawford/">
						Tori Crawford: Interviewing -- If it's broke, fix it
					</a>
				</li>
			</ul>
			<h4 className="mt-4">🥪 Brownbags</h4>
			<p>
				Brownbags are members-only events and the link will be dropped in the
				#announcements channel in slack prior to the event.
			</p>
			<ul>
				<li>
					February 2, 12:00pm EST &gt; Graphs & Networks, Trees & Heaps, Part 1,
					@Dominic Duffin
				</li>
				<li>
					February 5, 12:30pm EST &gt; Algorithms & Problem Solving with Graphs
					& Trees, Part 2, @Dominic Duffin
				</li>
				<li>
					February 10, 12:00pm EST &gt; Contrasting Accessibility with Color
					Contrast, @Todd
				</li>
				<li>
					February 15, 12:00pm EST &gt; How to Build a WordPress Theme, @Andy
					Stitt
				</li>
				<li>
					February 17, 1:00pm EST &gt; Pair Programming: Starting with Virtual
					Coffee, @Lucia Cercie
				</li>
			</ul>

			<h4 className="mt-4">⚡ Lightning Talks</h4>
			<p>February 26, Times TBA</p>

			<h4 className="mt-4">📕 Bookclub</h4>
			<p>Organized by @Karen Dickenson</p>
			<ul>
				<li>
					February 24, 12:00pm EST, Atomic Habits by James Clear will wrap up
					reading/discussion
				</li>
				<li>
					Up Next: Radical Candor by Kim Scott (being kind and clear in
					communicating)
				</li>
			</ul>
			<hr />

			<h2>Member Blog Post Highlights</h2>

			<p>
				<em>Some of our member posts we loved in December</em>
			</p>

			<ul>
				<li>
					<a href="https://vicvijayakumar.com/blog/when-recursion-is-too-slow-fibonacci">
						Database Design and the GDPR
					</a>
					, by Vic Vijayakumar
				</li>
				<li>
					<a href="https://dev.to/andystitt829/choose-your-own-adventure-to-break-into-web-development-5643">
						Choose your own adventure to break into web development
					</a>
					, by Andy Stitt
				</li>
				<li>
					<a href="https://dev.to/eclecticcoding/rails-image-helper-22mc">
						Rails Image Helper
					</a>
					, by Chuck Smith
				</li>
			</ul>

			<div className="card my-5 border-primary">
				<div className="card-body">
					<h5 className="card-title text-primary font-italic">Slack Love</h5>
					<div className="card-text">
						<blockquote className="blockquote">
							<p className="mb-0">
								I’m listening to the VC podcast and getting such warm fuzzies!
								I’m so glad to have found this place, much love to all of you!
								💖
							</p>
							<footer className="blockquote-footer">Courtney L.</footer>
						</blockquote>
						<blockquote className="blockquote">
							<h5 className="card-title text-primary font-italic">
								Friday Gratitude
							</h5>
							<p className="mb-0">
								This community. I feel like I'm 10x the person I was since I
								joined, 100% because this group is so supportive.
							</p>
							<footer className="blockquote-footer">Mike R.</footer>
						</blockquote>
					</div>
				</div>
			</div>

			<h2>What our members are up to</h2>

			<ul>
				<li>
					Mike Rogers was recently featured on the{' '}
					<a href="https://www.codewithjason.com/rails-with-jason-podcast/mike-rogers/">
						“Rails With Jason” podcast
					</a>
				</li>
				<li>
					Todd Libby launched his podcast{' '}
					<a href="https://www.youtube.com/watch?v=ada-9KYpv3w&feature=youtu.be">
						Front End Nerdery
					</a>
					, Episode 1 is with the “Godfather of web standards”, Jeffrey Zeldman
				</li>
				<li>
					Nick Taylor and Dan Ott are pairing up for a live-stream, on February
					3rd, at 1:00pm EST. You can check it out{' '}
					<a href="http://twitch.tv/thepracticaldev">here</a>.
				</li>
			</ul>

			<h3>Open Source Projects We Love!</h3>

			<ul>
				<li>
					<a href="https://github.com/Virtual-Coffee/virtualcoffee.io/issues">
						VirtualCoffee.io
					</a>
					, our Virtual Coffee community site - Dan Ott - 11ty
				</li>
				<li>
					<a href="https://github.com/marktnoonan/transcription">
						FreeLiveTranscript
					</a>
					, Live Transcription based on Speech Recognition API - Mark Noonan -
					JavaScript
				</li>
			</ul>
		</>
	);
}
