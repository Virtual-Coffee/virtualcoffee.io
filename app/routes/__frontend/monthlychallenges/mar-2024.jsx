import { json } from '@remix-run/node';
import { createMetaData } from '~/util/createMetaData.server';
import { Link } from '@remix-run/react';

export const handle = {
	listTitle:
		'March, 2024: Get job ready! Resumes, Cover Letters, and Elevator Pitch',
	meta: {
		title:
			'Monthly Challenge for March 2024: Get job ready! Resumes, Cover Letters, and Elevator Pitch',
		description:
			'March challenge -> There is never a bad time to work on job application materials and your elevator pitch',
	},
	date: '2024-03-01',
	hero: {
		heroHeader: '',
	},
};

export async function loader() {
	const { title, description } = handle.meta;
	return json({
		meta: createMetaData({ title, description }),
	});
}

export function meta({ data: { meta } = {} } = {}) {
	return meta;
}

export default function Challenge() {
	return (
		<>
			<h1>
				<small className="text-muted">Monthly Challenge for March 2024:</small>{' '}
				Get job ready! Resumes, Cover Letters, and Elevator Pitch
			</h1>
			<p className="lead mt-3">
				There's never a bad time to update your job application materials. This
				month, we're here to support you!
			</p>
			<p className="lead">
				During this month, we'll work on creating, revising, or updating your
				job packet materials and that elevator pitch that might get you in the
				door. We'll work on a new piece each week, starting with the resume.
			</p>
			<hr />
			<h2>Theme</h2>
			<p>Get job ready! Resumes, Cover Letters, and Elevator Pitch</p>
			<h2>Goals</h2>
			To end the month with:
			<ul>
				<li>
					A complete and updated resume tailored to your job search or position
				</li>
				<li>
					A complete and updated cover letter that creates a personal connection
				</li>
				<li>A captivating elevator pitch</li>
			</ul>
			<h2>Who can participate?</h2>
			<p>
				Virtual Coffee's goal is to support all developers, no matter where they
				are in their coding journey. We encourage all members to participate.
			</p>
			<h2>How it works</h2>
			<ul>
				<li>
					We're focusing on creating job application materials. Whether you're
					actively looking, getting ready to look, or want to update your
					materials in case that dream job comes along, this is a great time to
					do it with the community and to get some feedback.
				</li>
				<li>
					We encourage you to post your ideas, questions, and even your fears in
					the <code>#monthly-challenge</code> channel in Slack. We're all
					learning and growing together!
				</li>
				<li>
					We'll do a Slack check-in each week to brainstorm, support, and learn
					from each other.
				</li>
				<li>
					Keep in mind that different experiences will have different approaches
					to the materials, but we can all provide positive feedback.
				</li>
			</ul>
			<p className="lead">
				<strong>
					We're breaking this challenge into two parts, but feel free to focus
					on what's most important to you.
				</strong>
			</p>
			<h3>Weeks one and two: Resume and Cover Letter</h3>
			<h4>Resume</h4>
			<ul>
				<li>Step one: Find a job post.</li>
				<li>Step two: Match your skills to the post.</li>
				<li>Step three: Make your resume stand out.</li>
			</ul>
			<h4>Cover Letter</h4>
			<ul>
				<li>
					Step one: Do some research. Learn about a company and make a
					connection.
				</li>
				<li>
					Step two: Do some storytelling. A cover letter isn't a written resume.
					It's an opportunity to go deeper.
				</li>
				<li>Step three: Connect your experience to the position.</li>
			</ul>
			<h3>Week three: Elevator Pitch</h3>
			<ul>
				<li>
					An elevator pitch is a short speech introducing yourself, what you do,
					your experience, and why you would be an excellent person to have on
					the team. The idea is to confidently convey information about yourself
					in a short amount of time and leave an impression on the mind of the
					person who hears it.
				</li>
			</ul>
			<h3>Week four: Tying it Together</h3>
			<p>
				Your resume, cover letter, and elevator pitch should work together to
				tell your story and represent where you are on your career journey. Each
				piece should complement the others. This week, take time to make sure
				they work together or get some extra feedback on what you've worked on.
			</p>
			<p>
				At the end of the month, we'll do the final check-in in our{' '}
				<code>#monthly-challenge</code> Slack channel. You can submit your
				resume, cover letter, and a one-minute video of your elevator pitch if
				you choose—this isn't required.
			</p>
			<p>
				Each week, our monthly challenge team will start us off with check-ins.
				For this challenge to be fruitful, ensure you're sharing, providing
				feedback, and asking for help when needed.
			</p>
			<h3>Job Application Materials and Resources</h3>
			<ul>
				<li>
					<a href="https://www.youtube.com/watch?v=NVaZu8--4p0">
						Abbey Perini's L&L on promoting yourself to potential employers
					</a>
				</li>
				<li>
					<a href="https://www.youtube.com/watch?v=XwPVZNvP_IM">
						Abbey Perini and Jennifer K's L&L Optimize Your Resume For Both A
						Hiring Manager And An ATS
					</a>
				</li>
				<li>
					<a href="https://www.youtube.com/watch?v=ghFNiCMy67M">
						Breaking down coding problems in interviews – Courtney Landau –
						Lightning Talks 2021
					</a>
				</li>
				<li>
					<a href="https://www.youtube.com/watch?v=p4Ux7c7PQ0M">
						Resume Roundtable
					</a>
				</li>
				<li>
					<a href="https://flowcv.io/">FlowCV: free resume builder</a>
				</li>
				<li>
					A list of{' '}
					<a href="https://linktr.ee/iandouglas736">
						Ian Douglas's Interview Resources
					</a>
				</li>
			</ul>
			<h2>What if I Need Help?</h2>
			<p>
				You can ask a question in the <code>#help-and-pairing</code> channel on
				Slack, get 1:1 help during Office Hours (you can find the doc for office
				hours at the top of the <code>#help-and-pairing</code> channel), join
				the VC <code>#co-working-room</code>, or ask at a Coffee! Asking for
				help is part of the process.
			</p>
			<p>
				Our{' '}
				<Link to="/resources/virtual-coffee-handbook/guides-to-virtual-coffee/coffee-table-groups#tech-interview-study-group">
					Tech Interview Study Group
				</Link>
				,{' '}
				<Link to="/resources/virtual-coffee-handbook/guides-to-virtual-coffee/coffee-table-groups#the-pack-hunt">
					The Pack Hunt
				</Link>
				, and{' '}
				<Link to="/resources/virtual-coffee-handbook/guides-to-virtual-coffee/coffee-table-groups#accountabilibuddies">
					Accountabilibuddies
				</Link>{' '}
				groups are here to support you during the challenge as well! Stay tuned
				at the <code>#announcement</code> and <code>#vc-events</code> channel on
				Slack for the schedules!
			</p>
			<p>And remember, we're always here to help ❤️</p>
		</>
	);
}
