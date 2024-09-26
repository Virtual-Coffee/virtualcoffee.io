import { createMetaData } from '@/util/createMetaData.server';

const handle = {
	listTitle: 'March, 2022: Creating Audio/Visual content',
	meta: {
		title:
			'Monthly Theme & Challenge for March, 2022: Creating Audio/Visual content',
		description:
			'March challenge -> Break out your cameras and your microphones. This month we are working on AV content',
	},
	date: '2022-03-01',
	hero: {
		heroHeader: '',
	},
};

export const metadata = handle.meta;

export default function Challenge() {
	return (
		<>
			<h1>
				<small>Monthly Challenge for March, 2022:</small> Show your work!
				Creating Audio/Visual content
			</h1>

			<p className="lead">
				We all have something to share. And when we share with others, we both
				invite them to share with us and create a community of knowledge sharing
				and access to learning. This month, we'll focus on a different form of
				sharing: Audio/Visual
			</p>

			<p className="lead">
				We don't expect a fancy production, but we want you to challenge
				yourself to share what you learned. You might create a YouTube video, do
				a livestream, share on a podcast, or create a TikTok.
			</p>

			<hr />

			<h2>Theme</h2>
			<p>Show your work! Creating Audio/Visual content</p>

			<h2>Goals</h2>
			<ul>
				<li>To present your knowledge and showcase your understanding</li>
				<li>To explore video and audio mediums for sharing knowledge</li>
				<li>To highlight your achievements</li>
				<li>To promote growth through sharing</li>
			</ul>

			<h3>Who can participate?</h3>
			<p>
				Virtual Coffee's goal is to support all developers, no matter where they
				are in their coding journey. We encourage all members to participate.
				This challenge can be done alone or in a group.
			</p>

			<h3>How it works</h3>
			<ul>
				<li>
					We're asking members to submit lunch-and-learns, youtube videos,
					podcasts, or some other form of audio or video content they created
					that explores a coding-related concept--there's no length requirement.
				</li>
				<li>
					We'll have a day of lightning talks where folks can showcase their
					talents and abilities.
				</li>
				<li>
					We encourage to post ideas, questions, and even fears in the
					#content-creation channel in Slack. The goal is to learn and grow
					together!
				</li>
				<li>
					Keep in mind that we know sharing can be hard, but it also provides a
					ton of value by:
					<ul>
						<li>Solidifying ideas.</li>
						<li>Allowing you to be a resource for others.</li>
						<li>
							Inviting personal growth through conversations sparked by your
							sharing.
						</li>
						<li>Demonstrating your ability to talk through a concept.</li>
					</ul>
				</li>
			</ul>
			<p>
				We'll wrap up our challenge with lightning talks and have a space for
				members to submit their own AV content on our site.
			</p>

			<h3>Creating Audio Visual Content Resources</h3>
			<strong>Screen Recording Tools</strong>
			<ul>
				<li>
					<a href="https://obsproject.com/">Open Broadcaster Software</a>
				</li>
				<li>
					<a href="https://www.loom.com/">Loom</a>
				</li>
				<li>
					<a href="https://www.telestream.net/screenflow/overview.htm">
						Screenflow
					</a>
				</li>
			</ul>
			<strong>Podcasting Tools</strong>
			<ul>
				<li>
					<a href="https://zencastr.com/">Zencastr</a>
				</li>
			</ul>
			<strong>Video/Audio editing Tools</strong>
			<ul>
				<li>
					<a href="https://kdenlive.org/en/">kdenlive</a>
				</li>
				<li>
					<a href="https://miro.com/">Miro</a>
				</li>
				<li>
					<a href="https://github.com/ExistentialAudio/BlackHole">BlackHole</a>
				</li>
				<li>
					<a href="https://rogueamoeba.com/audiohijack/">Audio Hijack</a>
				</li>
				<li>
					<a href="https://www.descript.com/">Descript</a>
				</li>
			</ul>
			<strong>YouTube Video Shooting Channels</strong>
			<ul>
				<li>
					<a href="https://www.youtube.com/user/petermckinnon24">
						Peter McKinnon
					</a>
				</li>
				<li>
					<a href="https://www.youtube.com/user/indymogul/">Indy Mogul</a>
				</li>
				<li>
					<a href="https://www.youtube.com/user/filmriot">Film Riot</a>
				</li>
			</ul>
			<p>
				If you'd like to recommend a resource for creating AV content, you can
				add them to{' '}
				<a href="https://github.com/Virtual-Coffee/virtualcoffee.io/discussions/526">
					this discussion
				</a>
				or make a Pull Request on the monthly challenge page.
			</p>

			<h3>What if I need help?</h3>
			<p>
				You can ask a question in the #help-and-pairing VC channel, get 1:1 help
				during Office Hours (you can find the doc for office hours at the top of
				the #help-and-pairing channel.), join the VC co-working room, or ask at
				a coffee! Asking for help is part of the process.
			</p>

			<p>And remember, we're always here to help ❤️</p>
		</>
	);
}
