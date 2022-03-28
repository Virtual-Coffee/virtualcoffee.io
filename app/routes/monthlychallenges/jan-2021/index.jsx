import { json, useLoaderData } from 'remix';
import challengeJson from './jan-2021.json';

export const handle = {
	listTitle: 'January, 2021: Month of Learning!',
	meta: {
		title: 'Monthly Theme & Challenge for January, 2021: Month of Learning!',
		description:
			'January challenge -> New year, time to learn new things. Four weeks, four check-ins.',
	},
	date: '2021-01-01',
	hero: {
		heroHeader: '',
	},
};

export const meta = () => {
	return handle.meta;
};

export function loader() {
	const { challengedata } = challengeJson;

	return json({
		list: challengedata.sort((a, b) => a.name.localeCompare(b.name)),
	});
}

export default function Challenge() {
	const { list } = useLoaderData();
	return (
		<>
			<div className="alert alert-success">
				This monthly challenge is complete. Congratulations! Please join us for
				the
				<a href="/monthlychallenges/">next challenge</a>!
			</div>

			<h1>
				<small>Monthly Challenge for January, 2021:</small> Month of Learning!
			</h1>

			<p className="lead">
				It's a new year and time for learning new things! During this month,
				we'll work on learning new dev-related things. You might deep-dive into
				one topic, start a small-group that focuses on community learning, focus
				on a new topic every week, or do a little bit of everything.
			</p>

			<p className="lead">
				If you're inspired by what you learn and want to share more, we
				encourage you to give a lightning talk in February!
			</p>

			<hr />

			<h2>Theme</h2>
			<p>Month of learning challenge</p>
			<h2>Duration</h2>
			<ul>
				<li>Entire month of January</li>
				<li>Four, week-long sprints</li>
			</ul>
			<h2>Goals</h2>
			<p>
				To learn something new, share what we've learned, and gather
				recommendations to share with the community
			</p>
			<h2>How it works</h2>
			<ul>
				<li>
					Challenge can be done individually, in self-organized teams, a mixture
					of both, or some hybrid
				</li>
				<li>
					Each week, members choose something they want to learn, the resources
					they'll use to learn about it, and then dive into learning.
				</li>
				<li>
					We encourage you to post your topic and resources for the week in the
					#monthly-challenge channel in slack, especially if you want to form a
					group.
				</li>
				<li>
					At the end of each week, we'll do the official check-in where you can
					report on what you've learned:
					<ul>
						<li>Define -&gt; What's the topic?</li>
						<li>Reference -&gt; Resource you used.</li>
						<li>
							Member name -&gt; If you're working in a group, you can use one PR
							to list all members. Otherwise, you can list your name!
						</li>
					</ul>
				</li>
				<li>
					At the end of the month, we'll collect recommendations of the best
					tools, guides, and resources we found as we explored our topics for
					this month's challenge and share it with the whole community.
				</li>
				<li>We're always here to help ❤️</li>
			</ul>

			<hr />

			<h2 className="mb-4">Resources Recommended by Our Members:</h2>
			{list.map((person, i) => (
				<div className="p-3 bg-light rounded mb-3 shadow-sm" key={i}>
					<h3 className="h4">{person.name}:</h3>
					{person.resources.map((resource, j) => (
						<div className="card mb-4" key={j}>
							<div className="card-body">
								<h5 className="card-title">
									<a href={resource.resourceLink}>{resource.title}</a>
								</h5>
								<h6 className="card-subtitle mb-2 text-muted">
									<strong>Cost</strong>: {resource.price}
								</h6>
								<p className="card-text">{resource.description}</p>
								<a href={resource.resourceLink}>Learn More</a>
							</div>
						</div>
					))}
				</div>
			))}
		</>
	);
}
