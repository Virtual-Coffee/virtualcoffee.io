import { createMetaData } from '@/util/createMetaData.server';

export const handle = {
	listTitle: 'June, 2022: Giving meaningful and empathetic feedback',
	meta: {
		title:
			'Monthly Theme & Challenge for June, 2022: Giving meaningful and empathetic feedback',
		description: `June Challenge -> Being a developer is more than writing code, so this month let's work on providing each other with honest and empathetic feedback.`,
	},
	date: '2022-06-01',
	hero: {
		heroHeader: '',
	},
};

export const metadata = handle.meta;

export default function Challenge() {
	return (
		<>
			<h1>
				<small>Monthly Challenge for June, 2022:</small> Feedback
			</h1>

			<p className="lead">
				We're challenging you to both give and accept feedback from others.
			</p>
			<hr />

			<h2>Theme</h2>
			<p>Giving Meaningful and Empathetic Feedback</p>

			<h2>Goal</h2>
			<p>Provide feedback four times</p>

			<h3>Who can participate?</h3>
			<p>
				Virtual Coffee's goal is to support all developers, no matter where they
				are in their coding journey. We encourage all members to participate.
			</p>

			<h3>Let's work together!</h3>
			<p>
				When we care about our community members, we can offer empathetic
				responses that are honest and allow them to grow and to fix a problem.
				Sometimes these conversations are hard. But sometimes we need hard
				conversations to help us grow. Let's approach each other with kindness
				and honesty, and allow this kind of feedback to be a regular part of our
				process.
			</p>

			<h3>How it works</h3>
			<p>
				For this month's challenge we both need people asking for feedback and
				people giving feedback! If you need feedback on content or code, please
				post in the #monthly-challenge channel. It could be on a blog post, an
				idea, a coding project/PR, a talk, an interview, or whatever you could
				use feedback on.
			</p>

			<h4>Places where you can give feedback:</h4>
			<ul>
				<li>Accountabilibuddies Group</li>
				<li>VC-Toastmasters Group</li>
				<li>#help-and-pairing channel</li>
				<li>#co-working-room channel</li>
			</ul>
			<p>
				We’ll do async check-ins every week. Once you've hit 4 feedback
				sessions, reply to the check in with ✅
			</p>

			<h3>Resources & Events</h3>
			<ul>
				<li>
					Accountabilibuddies: Every Tuesday 7PM-9PM ET, and every Thursday
					9AM-11:30AM ET ET
				</li>
				<li>VC-toastmasters: June 6th 12pm ET and June 20th 12pm ET </li>
				<li>
					<a href="https://iamdeveloper.com/posts/how-i-review-pull-requests-44nl/">
						Nick Taylor: How I Review Pull Requests
					</a>
				</li>
				<li>
					<a href="https://www.amazon.com/Kim-Scott-Insights-for-Entrepreneurs/b?ie=UTF8&node=17395104011&ref=soussoa_ks_auth_insights&ld=SOUSSOA-KS-Auth-Insights">
						Kim Scott: How to give useful feedback
					</a>
				</li>
				<li>
					<a href="https://www.youtube.com/watch?v=YLBDkz0TwLM">
						Radical Candor in 6 Minutes with Kim Scott
					</a>
				</li>
				<li>
					<a href="https://youtu.be/f-Tcr0T9Tyw">
						Kim Scott: How to be a kick-ass boss
					</a>
				</li>
				<li>
					<a href="https://hbr.org/2017/10/how-to-give-feedback-people-can-actually-use">
						How to Give Feedback People Can Actually Use
					</a>
				</li>
				<li>
					<a href="https://simpleleadership.io/april-wensel/">
						Compassionate Coding and Diversity with April Wensel
					</a>
				</li>
			</ul>
		</>
	);
}
