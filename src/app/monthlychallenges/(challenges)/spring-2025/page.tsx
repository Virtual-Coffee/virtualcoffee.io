import { createMetaData } from '@/util/createMetaData.server';
import Link from 'next/link';
import LeadText from '@/components/content/LeadText';
import TextContainer from '@/components/content/TextContainer';

const handle = {
	listTitle:
		'Virtual Coffee Spring 2025 Quarter Challenge: From Idea to Stage 🎤',
	meta: {
		title: 'Spring 2025 Quarter Challenge: From Idea to Stage!',
		description:
			"Spring 2025 Quarter challenge -> Let's get ready for our first Virtual Coffee Community Conference!",
	},
	dates: ['2025-02-01', '2025-03-01', '2025-04-01'],
	hero: {
		heroHeader: '',
	},
};

export const metadata = handle.meta;

export default function Challenge() {
	return (
		<>
			<h1 className="mb-5">
				<small>Virtual Coffee Spring 2025 Quarter Challenge:</small> From Idea
				to Stage! 🎤
			</h1>

			<TextContainer background="light" showBackToTopLink={false}>
				<LeadText>
					<h2 className="pl-5 pr-3">Celebrating 5 Years of Community Growth</h2>
					<p className="px-5 mt-4">
						As Virtual Coffee celebrates its 5th anniversary, we're excited to
						launch our <strong>first-ever quarterly challenge</strong>! This
						special initiative embodies what makes our community unique:
						supporting developers at all stages, creating opportunities for
						growth, and fostering genuine connections.
					</p>
					<p className="px-5">
						Since our first coffee in April 2020, we've grown from a small group
						of developers meeting for virtual coffee to a thriving community
						that supports and elevates each other. This quarter, we're
						channeling that spirit into helping members step into speaking and
						community leadership roles.
					</p>
				</LeadText>
			</TextContainer>

			<hr />

			<h2 className="mb-3">Challenge Overview</h2>
			<p>
				Over the next three months, we'll work together to bring our internal
				conference to life, creating opportunities for both speakers and event
				organizers. Whether you dream of sharing your knowledge on stage or want
				to learn the ins and outs of running tech events, this challenge is for
				you!
			</p>

			<h2 className="mb-3">Talk Formats</h2>
			<p>
				We offer multiple formats to suit different speaking styles and content
				types:
			</p>

			<h3>Lightning Talks (7 minutes)</h3>
			<p>
				Perfect for focused, high-impact presentations on a specific topic.
				Great for first-time speakers or concentrated technical demonstrations.
			</p>

			<h3>30-Minute Talks</h3>
			<p>
				Ideal for deeper dives into technical topics, career journeys, or
				comprehensive tutorials. These talks allow time for detailed examples
				and thorough explanation.
			</p>

			<h3>Panel Discussions (30 minutes)</h3>
			<p>
				Join other community members to share different perspectives on a common
				theme. Great for those who prefer conversational formats and
				collaborative discussion.
			</p>

			<h3>Group Discussion Lead (30 minutes)</h3>
			<p>
				Similar to our coffee chat format, lead an interactive discussion on
				your chosen topic. Perfect for those who excel at facilitating
				conversations and building community engagement.
			</p>

			<h2 className="mb-3">How This Fits Into Virtual Coffee</h2>
			<p>This challenge embodies our core values:</p>
			<ul>
				<li>Supporting growth and mentorship at all levels</li>
				<li>Creating meaningful opportunities for learning and leadership</li>
				<li>Building a closer community through participation</li>
				<li>Meeting people where they are in their journey</li>
			</ul>

			<h2 className="mb-5">The Journey: Month by Month</h2>

			<h3>February: Finding Your Voice 📝</h3>
			<h4>Focus: Call for Proposals (CFPs)</h4>
			<ul>
				<li>Workshop your talk ideas with the community</li>
				<li>Learn how to write compelling CFPs</li>
				<li>Get feedback from experienced speakers</li>
				<li>Submit your proposal for our internal conference</li>
				<li>Explore which talk format best suits your topic and style</li>
			</ul>

			<h4>Resources & Support</h4>
			<ul>
				<li>CFP writing workshops</li>
				<li>Proposal review sessions</li>
				<li>Community feedback opportunities</li>
				<li>Access to experienced mentors</li>
				<li>Format selection guidance</li>
			</ul>

			<hr />

			<h3>March: Crafting Your Story 🎨</h3>
			<h4>Focus: Presentation Development</h4>
			<ul>
				<li>Learn slide design principles</li>
				<li>Develop your presentation</li>
				<li>Get feedback in a supportive environment</li>
				<li>Refine your message and delivery</li>
				<li>
					Practice format-specific skills (for example, facilitation for
					discussion leads, timing for lightning talks)
				</li>
			</ul>

			<h4>Resources & Support</h4>
			<ul>
				<li>Slide design workshops</li>
				<li>Private Slack channel for speaker support</li>
				<li>Feedback sessions with experienced presenters</li>
				<li>Q&A with conference organizers</li>
				<li>Format-specific mentoring</li>
			</ul>

			<hr />

			<h3>April: Bringing It All Together 🌟</h3>
			<h4>Focus: Technical Setup & Rehearsals</h4>
			<ul>
				<li>Perfect your delivery</li>
				<li>Master the technical setup</li>
				<li>Practice with your mentor</li>
				<li>Prepare for the big day!</li>
				<li>Format-specific rehearsals and timing practice</li>
			</ul>

			<h4>Resources & Support</h4>
			<ul>
				<li>One-on-one mentorship</li>
				<li>Technical setup assistance</li>
				<li>Rehearsal opportunities</li>
				<li>Final presentation review</li>
				<li>Format-specific technical guidance</li>
			</ul>

			<h2 className="mb-3">How to Participate</h2>
			<h3>For Aspiring Speakers</h3>
			<ol>
				<li>Join the challenge by submitting your CFP</li>
				<li>Choose your preferred talk format</li>
				<li>Attend relevant workshops and support sessions</li>
				<li>Connect with mentors and fellow speakers</li>
				<li>Give and receive feedback</li>
				<li>Prepare for your moment on stage!</li>
			</ol>

			<h3>For Event Organization Enthusiasts</h3>
			<ol>
				<li>Learn about conference organization</li>
				<li>Help review proposals and provide feedback</li>
				<li>Support speakers in their journey</li>
				<li>Gain hands-on event planning experience</li>
				<li>Be part of creating an unforgettable community event</li>
			</ol>

			<h2 className="mb-3">Community Support</h2>
			<p>Throughout this challenge, you'll have access to:</p>
			<ul>
				<li>Experienced speakers and organizers</li>
				<li>Dedicated Slack channels</li>
				<li>Regular feedback sessions</li>
				<li>One-on-one mentorship</li>
				<li>A supportive community cheering you on</li>
				<li>Format-specific guidance and resources</li>
			</ul>

			<h2 className="mb-3">Join Us!</h2>
			<p>
				Whether you're drafting your first CFP or helping others shine on stage,
				you're playing a crucial role in our community's growth. This challenge
				is about more than just speaking—it's about building confidence, sharing
				knowledge, and strengthening our community bonds.
			</p>

			<h3>Ready to Start?</h3>
			<ul>
				<li>
					<a href="">Sign up</a> for the challenge
				</li>
				<li>Join our dedicated Slack channel</li>
				<li>Attend our kickoff meeting</li>
				<li>Start your journey from idea to stage!</li>
			</ul>

			<hr />

			<p>
				<strong>Remember:</strong> Every expert was once a beginner. In Virtual
				Coffee, we believe that everyone has something valuable to share, and
				we're here to help you share it with confidence! 💝
			</p>
		</>
	);
}
