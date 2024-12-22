import { createMetaData } from '@/util/createMetaData.server';
import Link from 'next/link';
import LeadText from '@/components/content/LeadText';
import TextContainer from '@/components/content/TextContainer';

const handle = {
	listTitle: 'January 2025: New Year, New Goal!',
	meta: {
		title: 'Monthly Challenge for January 2025: New Year, New Goal!',
		description: "January challenge -> Let's set up our goal for the year!",
	},
	date: '2025-01-01',
	hero: {
		heroHeader: '',
	},
};

export const metadata = handle.meta;

export default function Challenge() {
	return (
		<>
			<h1>
				<small>Monthly Challenge for January, 2025:</small> New Year, New Goal!
			</h1>

			<LeadText>
				<p className="mt-3">
					The new year is the perfect time to set your new goal. Whether learning new dev-related things, preparing yourself to get a new job, making new habits to be a better developer, or anything you work towards this year. And this month, we're here to support you!
				</p>
			</LeadText>

			<LeadText>
				<p className="mt-3">
					During this month, we'll work on setting your one big goal for the year and breaking it down into achievable goals for each month.
				</p>
			</LeadText>

			<TextContainer background="light" showBackToTopLink={false}>
				<LeadText>
					<p className="px-3 text-justify">
						This year, we aim to hold <strong>Virtual Coffee Community Conference</strong> for the first time! If your goal is to speak at tech conferences, this is the perfect time to prepare!
					</p>
				</LeadText>
			</TextContainer>

			<hr />

			<h2 className="mb-3">Theme</h2>
			<p>New year, new goal!</p>

			<h2 className="mb-3">Goals</h2>
			<p>
				Our goal is for you to have a map of monthly achievable goals for the
				year by the end of the month.
			</p>

			<h2 className="mb-3">Who can participate?</h2>
			<p>
				Virtual Coffee's goal is to support all developers, no matter where they
				are in their coding journey. We encourage all members to participate.
			</p>

			<h2 className="mb-3">How it works</h2>
			<h3 className="mb-3">Set your goal and create your plans</h3>
			<ul>
				<li>
					<strong>Define</strong>: What is your goal in 2025?
				</li>
				<li>
					<strong>Plan</strong>: What steps do you need to take to achieve the
					goal?
				</li>
				<li>
					<strong>Set achievable goals for each month</strong>: What do you need
					to do each month to reach your big goal?
				</li>
			</ul>

			<h3 className="mb-4">
				What if I need help and want to hold myself accountable?
			</h3>
			<h4 className="mb-3">Coffee Table Groups</h4>
			<p>
				If you need help setting your goal or want to hold yourself
				accountable by working on them with the community over Zoom, we're here
				for you!
			</p>
			<ul>
				<li>
					Join the{' '}
					<Link href="/resources/virtual-coffee-handbook/guides-to-virtual-coffee/coffee-table-groups#accountabilibuddies">
						Accountabilibuddies
					</Link>{' '}
					to set your goal with other members or ask for help and ideas.
				</li>
				<li>
					Is your goal to prepare for that technical interview and get that
					dream job? Come to our{' '}
					<Link href="/resources/virtual-coffee-handbook/guides-to-virtual-coffee/coffee-table-groups#tech-interview-study-group">
						Tech Interview Study Group
					</Link>{' '}
					and{' '}
					<Link href="/resources/virtual-coffee-handbook/guides-to-virtual-coffee/coffee-table-groups#the-pack-hunt">
						The Pack Hunt
					</Link>{' '}
					to plan on working on your resume, preparing for a technical
					interview, and going job hunting!
				</li>
			</ul>
			<p>
				Check the <code>#announcement</code> channel on Slack for the schedule
				of each Coffee Table Group and <code>#vc-events</code> channel to join
				the event.
			</p>
			<h4 className="mb-3">Slack</h4>
			<ul>
				<li>
					We encourage you to post your ideas, questions, and progress in the{' '}
					<code>#monthly-challenge</code> channel in Slack. We're all learning
					and growing together!
				</li>
				<li>
					If your goal is toward job searching, you can always ask for help in
					the <code>#tech-interview-study-group</code> or <code>#job-hunt</code>{' '}
					channel.
				</li>
				<li>
					We'll do a Slack check-in each week to track your progress and support
					you.
				</li>
			</ul>
			<p>Remember, we're always here to help. ❤️</p>

			<h2 className="mb-3">Tools and Resources</h2>
			<ul>
				<li>
					<a href="https://www.notion.so/">Notion</a>
				</li>
				<li>
					<a href="https://docs.google.com/">Google Docs</a>
				</li>
				<li>
					<a href="https://www.mindtools.com/a4wo118/smart-goals">
						SMART Goals - How to Make Your Goals Achievable
					</a>
				</li>
				<li>
					<a href="https://www.betterup.com/blog/personal-goals">
						Personal goals that work: 20 examples to get started
					</a>
				</li>
			</ul>
		</>
	);
}
