import Image from 'next/image';
import logo from './logo.png';

const handle = {
	listTitle:
		'February, 2023: Get job ready! Resumes, Cover Letters, and Elevator Pitch',
	meta: {
		title:
			'Monthly Challenge for February, 2023: Get job ready! Resumes, Cover Letters, and Elevator Pitch',
		description:
			'February challenge -> There is never a bad time to work on job application materials and your elevator pitch',
	},
	date: '2023-02-01',
	hero: {
		heroHeader: '',
	},
};

export const metadata = handle.meta;

export default function Challenge() {
	return (
		<>
			<h1>
				<small className="text-muted">
					Monthly Challenge for February, 2023:
				</small>{' '}
				Get job ready! Resumes, Cover Letters, and Elevator Pitch
			</h1>
			<p className="lead">
				There's never a bad time to update your job application materials, and
				this month, we're here to support you!
			</p>
			<p className="lead">
				During this month, we'll work on creating, revising, or updating your
				job packet materials and that elevator pitch that might get you in the
				door. Each week, we'll work on a new piece, starting with the resume.
			</p>
			<hr />
			<p className="text-center">
				<em>This monthly challenge is sponsored by:</em>
			</p>
			<div className="row">
				<div className="col-sm">
					<h2>
						Joe Masilotti, founder of{' '}
						<a href="https://railsdevs.com/">RailsDevs</a>, the <em>reverse</em>{' '}
						job board for Ruby on Rails developers
					</h2>
				</div>
				<div className="col-sm">
					<a href="https://railsdevs.com/">
						<Image src={logo} alt="RailsDevs" />
					</a>
				</div>
			</div>
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
					A complete and updated Cover Letter that creates a personal connection
				</li>
				<li>A captivating elevator pitch</li>
			</ul>
			<h3>Who can participate?</h3>
			<p>
				Virtual Coffee's goal is to support all developers, no matter where they
				are in their coding journey. We encourage all members to participate.
			</p>
			<h3>How it works</h3>
			<ul>
				<li>
					We're focusing on creating job application materials. Whether you're
					actively looking, getting ready to look, or just want to update your
					materials in case that dream job comes along, this is a great time to
					do it with the community and to get some feedback.
				</li>
				<li>
					We encourage you to post your ideas, questions, and even your fears in
					`#monthly-challenge` channel in Slack. We're all learning and growing
					together!
				</li>
				<li>
					Each week, we'll do a slack check-in to brainstorm, support, and learn
					from each other.
				</li>
				<li>
					Keep in mind that different experiences will have different approaches
					to the materials, but we can all provide positive feedback.
				</li>
			</ul>
			<h3>
				We're breaking this challenge into two parts, but feel free to focus on
				what's most important to you.
			</h3>
			<h5>Weeks one and two: Resume and Cover Letter</h5>
			<h6>Resume</h6>
			<ul>
				<li>Step one: Find a job post.</li>
				<li>Step two: Match your skills to the post.</li>
				<li>Step three: Make your resume standout.</li>
			</ul>
			<h6>Cover Letter</h6>
			<ul>
				<li>
					Step one: Do some research. Learn about a company and make a
					connection.
				</li>
				<li>
					Step two: Do some storytelling. A CL isn't a written resume. It's an
					opportunity to go deeper.
				</li>
				<li>Step three: Connect your experience to the position.</li>
			</ul>
			<h5>Week three: Elevator Pitch</h5>
			<ul>
				<li>
					An elevator pitch is a short speech introducing yourself, what you do
					or your experience, and why you would be a good person to have on the
					team. The idea is to confidently convey information about yourself in
					a short amount of time and to leave an impression on the mind of the
					person who hears it.
				</li>
			</ul>
			<h5>Week four: Tying it Together</h5>
			<p>
				Your resume, cover letter, and elevator pitch should work together to
				tell your story and represent where you are on your career journey. Each
				piece should complement the others. This week, take time to make sure
				they work together or get some extra feedback on what you've worked on.
			</p>
			<p>
				At the end of the month, we'll post a form in our #monthly-challenge
				slack channel to submit your resume, cover letter, and elevator pitch if
				you choose-this isn't required. Links to resumes and cover letters will
				appear on this page, and elevator pitches will go onto our YouTube
				channel in a playlist.
			</p>
			<p>
				Each week, our monthly-challenge team will start us off with some
				questions and resources. For this challenge to be fruitful, make sure
				you're sharing, providing feedback, and asking for help when you need
				it.
			</p>
			<h3>Events that will help you with this Challenge</h3>
			<ul>
				<li>
					Get Job Ready Kickoff! | A Members-Only Event - 12p ET, Friday,
					February 3, 2023{' '}
				</li>
			</ul>
			<h3>Job application materials and resources</h3>
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
