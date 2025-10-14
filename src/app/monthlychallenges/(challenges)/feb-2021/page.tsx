import Link from 'next/link';

const handle = {
	listTitle: 'February, 2021: Show your work! Creating Audio Visual content',
	meta: {
		title:
			'Monthly Theme & Challenge for February, 2021: Show your work! Creating Audio Visual content',
		description:
			'Feb challenge -> Break out your cameras and your microphones. This month we are working on AV content',
	},
	date: '2021-02-01',
	hero: {
		heroHeader: '',
	},
};

export const metadata = handle.meta;

export default function Challenge() {
	return (
		<>
			<div className="alert alert-success">
				This monthly challenge is complete. Congratulations! Please join us for
				the <Link href="/monthlychallenges/">next challenge</Link>!
			</div>

			<h1>
				<small>Monthly Challenge for February, 2021:</small> Show your work!
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
				a livestream, share on a podcast, or create a TicTok.
			</p>

			<hr />

			<h2>Theme</h2>
			<p>Show your work! Creating Audio/Visual content challenge</p>
			<h2>Duration</h2>
			<ul>
				<li>Entire month of February</li>
			</ul>
			<h2>Goals</h2>
			<ul>
				<li>To present your knowledge and showcase your understanding</li>
				<li>To explore video and audio mediums for sharing knowledge</li>
				<li>To highlight your achievements</li>
				<li>To promote growth through sharing</li>
			</ul>
			<h2>How it works</h2>
			<ul>
				<li>
					For the month of February we're asking members to submit brownbags,
					youtube videos, podcasts, or some other form of audio or video content
					you created that explores a coding-related concept--there's no length
					requirement
				</li>
				<li>
					Each week, we'll do a slack check-in to brainstorm, support, and learn
					from our experiences.
				</li>
				<li>
					We encourage you to post your ideas, questions, and even your fears in
					slack. We're all learning and growing together!
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
				<li>
					On February 26th, we'll wrap up our challenge with lightning talks and
					have a space for members to sumbit their own AV content on our site.
				</li>
				<li>And remember, we're always here to help ❤️</li>
			</ul>
		</>
	);
}
