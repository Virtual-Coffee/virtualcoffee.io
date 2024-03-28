import { json } from '@remix-run/node';
import { createMetaData } from '~/util/createMetaData.server';
import { Link } from '@remix-run/react';

export const handle = {
	listTitle:
		'April, 2024: Find Your Voice! Public Speaking',
	meta: {
		title:
			'Monthly Challenge for April 2024: Find Your Voice! Public Speaking',
		description:
			'April challenge -> Public speaking can feel daunting, but it is a valuable skill in all aspects of life. This month, we will help you conquer your fears and become a confident, captivating speaker!',
	},
	date: '2024-04-01',
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
				<small className="text-muted">Monthly Challenge for April 2024:</small>{' '}
                Find Your Voice! Public Speaking
			</h1>
			<p className="lead mt-3">
            Whether you're preparing for a keynote, a tech talk, or just want to get more comfortable speaking in public, we've got your back.
			</p>
			<p className="lead">
				During this month, we'll be breaking down the art of public speaking into manageable steps, focusing on different aspects each week. Throughout the month, we'll provide resources, tips, and opportunities to practice and get feedback from the community.
			</p>
			<hr />
			<h2>Theme</h2>
			<p>Find Your Voice! Public Speaking</p>
			<h2>Goals</h2>
			By the end the month, you'll be able to:
			<ul>
				<li>
                Deliver a clear and engaging presentation on a topic of your choice.
				</li>
				<li>
                Overcome nervousness and speak confidently in front of an audience.
				</li>
				<li>Structure your content effectively to grab and hold attention.</li>
			</ul>
			<h2>Who can Participate?</h2>
			<p>
				Virtual Coffee's goal is to support all developers, no matter where they
				are in their coding journey. We encourage all members to participate.
			</p>
			<h2>How it Works</h2>
			<ul>
				<li>
                We're dedicating this month to becoming confident public speakers. Whether you're gearing up for a conference, a local meetup, or just want to improve, now is the perfect time with the support of our community.
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
					Keep in mind that different experiences will have different approaches, but we can all provide constructive feedback.
				</li>
			</ul>
			<p className="lead">
				<strong>
					We're breaking this challenge into weeks, but feel free to focus
					on what's most important to you.
				</strong>
			</p>
			<h3>Week One: Building Confidence and Your Topic</h3>
			<h4> Building Confidence</h4>
			<ul>
				<li>
					<strong>Challenge</strong>:  Identify and challenge negative thoughts about public speaking.
				</li>
				<li>
					<strong>Activity</strong>: Record yourself delivering a short introduction and watch it back to identify areas for improvement (optional).
				</li>
				
			</ul>
			
			<h4>Topic Selection and Outline</h4>
			<ul>
				<li>
					<strong>Step one</strong>: Create a list of 5-10 topics you're passionate about or that you want to learn more about.
				</li>
				<li>
					<strong>Step two</strong>: Create a rough outline of 2-3 from the list.
				</li>
				
			</ul>
			<h3>Week Two: Crafting Your Content</h3>
			<ul>
				<li>
					<strong>Challenge</strong>:   Finalize your topic and develop a clear, concise message.
				</li>
				<li>
					<strong>Activity</strong>: Draft an outline for your talk, including an introduction, main points, and conclusion.
				</li>
				
			</ul>
			<h3>Week Three: Delivery and Practice</h3>
            <ul>
				<li>
					<strong>Challenge</strong>: Work on your vocal delivery, body language, and use of visuals.
				</li>
				<li>
					<strong>Activity</strong>: Practice delivering your presentation in front of a mirror or someone else.Refine your presentation based on the feedback received and practice delivering it confidently.
				</li>
				
			</ul>
			<h3>Week Four: Final Preparation and Presentation</h3>
            <ul>
				<li>
					<strong>Challenge</strong>: Make your final preparations and any adjustments to your presentation.
				</li>
				<li>
					<strong>Activity</strong>: Give a lightning talk!
				</li>
				
			</ul>
		
			<h3>Resources</h3>
			<ul>
				<li>
					<a href="https://www.toastmasters.org/">
						Toastmasters
					</a>
				</li>
				<li>
					<a href="https://www.speechanddebate.org/">
                    National Speech & Debate Association
					</a>{' '}
				</li>
				<li>
					<a href="https://www.ted.com/talks">
						TED Talks
					</a>{' '}
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
			<p>And remember, we're always here to help ❤️</p>
		</>
	);
}
