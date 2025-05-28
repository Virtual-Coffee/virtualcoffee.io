import { createMetaData } from '@/util/createMetaData.server';
import Link from 'next/link';

const handle = {
	listTitle: 'Bi-Month Challenge: Get Job Ready!',
	meta: {
		title: 'Bi-Month Challenge: Get Job Ready!',
		description:
			'Bi-Month Challenge -> Get job ready! Resumes, Cover Letters, and Elevator Pitch',
	},
	dates: ['2025-06-01', '2025-07-01'],
	hero: {
		heroHeader: '',
	},
};

export const metadata = handle.meta;

export default function Challenge() {
	return (
		<>
			<h1>
				<small>Bi-Month Challenge:</small> Get Job Ready!
			</h1>

			<p className="lead mt-3">
				There's never a bad time to update your job application materials. Over
				the next two months, we're here to support you!
			</p>
			<p className="lead">
				We'll work on creating, revising, or updating your job packet materials
				and that elevator pitch that might get you in the door. We'll also
				encourage and support you in networking and preparing for interviews.
			</p>

			<hr />

			<h2 className="mb-3">Challenge Overview</h2>
			<p>
				Over the next two months, we'll guide and support you through every
				essential step in getting you job-ready. This includes defining your
				goals, creating a compelling elevator pitch, refreshing your resume,
				building your personal brand, and developing a strong portfolio. We'll
				also encourage you to network effectively, apply for job openings,
				prepare for interviews, and confidently negotiate and make decisions
				about your next opportunity, all while prioritizing your well-being.
			</p>

			<h2 className="mb-3">The Journey: How It Works</h2>
			<h3 className="mb-3">Challenge Highlights</h3>
			<p>
				You can take a glimpse of what we'll do during the challenge, listed
				below, in no particular order:
			</p>

			<ul>
				<li className="mb-2">
					<strong>Goal Setting:</strong> Outline your job goals and share them
					with us. Select a personalized career track—whether you're seeking
					your first job, making a career change, or returning to the
					workforce—to tailor your journey.
				</li>
				<li className="mb-2">
					<strong>Elevator Pitch:</strong> Write a clear and engaging
					introduction that highlights your skills and aspirations. Practice
					your pitch until you feel comfortable, then, optionally, record a
					one-minute video for community feedback.
				</li>
				<li className="mb-2">
					<strong>Resume Refresh:</strong> Update your resume and ask for
					community feedback.
				</li>
				<li className="mb-2">
					<strong>Personal Brand:</strong> Improve your professional online
					presence by updating your LinkedIn and GitHub profile and your
					personal website. This would also be a perfect time to update your
					headshot to refine your professional image.
				</li>
				<li className="mb-2">
					<strong>Portfolio or Projects:</strong> Develop or update your
					professional portfolio or showcase impactful projects. Share it and
					engage in asynchronous feedback to receive constructive input and
					refine your work.
				</li>
				<li className="mb-2">
					<strong>Networking:</strong> Expand your professional connections by
					reaching out to former colleagues and the community, engaging with
					your network on LinkedIn or other platforms, and participating in
					industry meetups and events.
				</li>
				<li className="mb-2">
					<strong>Apply with Intention:</strong> Take a strategic approach to
					job applications by sharing relevant job posts, learning tips for
					tailoring your resume, and tracking your applications with tools like{' '}
					<a href="https://www.notion.com/">Notion</a>,{' '}
					<a href="https://obsidian.md/">Obsidian</a>,{' '}
					<a href="https://workspace.google.com/products/sheets/">
						Google Sheets
					</a>
					, etc., to maximize your success.
				</li>
				<li className="mb-2">
					<strong>Interview Prep:</strong> Prepare for interviews by
					participating in technical and behavioral mock interview sessions,
					engaging in asynchronous discussions, and practicing responses.
				</li>
				<li className="mb-2">
					<strong>Take a Break:</strong> Focus on your mental well-being by
					conducting regular check-ins and exploring effective strategies for
					preventing burnout, ensuring a healthy job search journey.
				</li>
				<li className="mb-2">
					<strong>Negotiate & Decide:</strong> Share negotiation resources and
					experience to make career decisions.
				</li>
			</ul>

			<hr />

			<p>
				<strong>Notes:</strong> For schedules and announcements, check out the{' '}
				<code>#monthly-challenge</code> and <code>#vc-events</code> channels on
				Slack.
			</p>

			<hr />

			<h3 className="mb-3">
				What if I need help and want to hold myself accountable?
			</h3>
			<h4 className="mb-3">Coffee Table Groups</h4>
			<p>
				We have various{' '}
				<Link href="/resources/virtual-coffee-handbook/guides-to-virtual-coffee/coffee-table-groups">
					Coffee Table Groups
				</Link>{' '}
				you can join to hold yourself accountable and support you!
			</p>
			<p>
				Check the <code>#announcement</code> channel on Slack for the schedule
				of each Coffee Table Group and <code>#vc-events</code> channel to join
				the event.
			</p>
			<h4 className="mb-3">Slack</h4>
			<ul>
				<li>
					We encourage you to post your ideas, questions, and progress in the{' '}
					<code>#monthly-challenge</code> channel in Slack.
				</li>
				<li>
					We'll conduct both synchronous and asynchronous weekly check-ins to
					track your progress and provide support.
				</li>
			</ul>
			<p>Remember, we're always here to help. ❤️</p>

			<h2 className="mb-3">Who Can Participate?</h2>
			<p>
				We encourage all members to participate. If you're a job-seeker, this
				challenge is for you!
			</p>
			<p>
				If you're not currently looking for a job, we encourage you to support
				the community by sharing job postings and resources related to job
				searching and interviews in the <code>#job-hunt</code> channel on Slack.
			</p>

			<h2 className="mb-3">Interested in Volunteering?</h2>
			<p>Depending on your availability, you can support us by:</p>
			<ul>
				<li>
					Reviewing resumes, social profiles, and elevator pitches and giving
					feedback
				</li>
				<li>
					Answering questions from members and giving feedback related to job
					searching on Slack
				</li>
				<li>Running mock technical interviews based on your expertise</li>
				<li>
					Giving Lunch & Learn related to job search. For example, "How to
					tailor your resume", "How to use X tool to track job applications",
					etc.
				</li>
			</ul>
			<p>
				Please let our Monthly Challenge Team Leads, Ayu and Dominic, know if
				you'd like to help, or our Lunch & Learn Coordinator, Shelley, if you'd
				like to give a Lunch & Learn session. Your help is greatly appreciated!
				❤️
			</p>
		</>
	);
}
