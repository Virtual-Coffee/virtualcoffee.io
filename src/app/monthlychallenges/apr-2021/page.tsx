import UndrawIllustration from '@/components/UndrawIllustration';

import { createMetaData } from '@/util/createMetaData.server';

export const handle = {
	listTitle: 'April, 2021: Community Kindness!',
	meta: {
		title: 'Monthly Theme & Challenge for April, 2021: Community Kindness!',
		description:
			'April challenge -> Celebrating one year of Virtual Coffee by focusing on what make this community special: Kindness',
	},
	date: '2021-04-01',
	hero: {
		heroHeader: '',
	},
};

export async function loader() {
	const { title, description } = handle.meta;
	return json({ meta: createMetaData({ title, description }) });
}

export const meta = handle.meta;

export default function Challenge() {
	return (
		<>
			<div className="alert alert-success">
				This monthly challenge is complete. Congratulations! Please join us for
				the <a href="/monthlychallenges/">next challenge</a>!
			</div>

			<div className="row align-items-center">
				<div className="col-sm-4">
					<UndrawIllustration filename="UndrawAppreciation" />
				</div>
				<div className="col-sm-8">
					<h1 className="display-4">Virtual Coffee</h1>
					<p className="lead">Celebrating a year of community!</p>
				</div>
			</div>

			<h1>
				<small>Monthly Challenge for April, 2021:</small> Community Kindness!
			</h1>

			<p className="lead">
				We've made it through 100 Coffees, and we're celebrating a full year of
				Virtual Coffee! This month, let's celebrate one of the things that makes
				this community so special: Kindness.
			</p>

			<p className="lead">
				Since this is a special challenge, we have some ideas to start things
				off, but we're looking forward to the creative ways you participate.
			</p>

			<h2>Theme</h2>
			<p>
				Community Kindness: Celebrating 100+ Coffees, and a year of Virtual
				Coffee Kindness
			</p>

			<h2>Starter Ideas</h2>
			<p>
				We encourage everyone to take care of yourself and participate in a way
				that works for you. If you have the opportunity or time, here are some
				ideas to get things started:
			</p>
			<ul>
				<li>
					Use #Thanks in slack this month to acknowledge another community
					member's contributions or kindness.
				</li>
				<li>
					Reach out to a new member or member you haven't seen in a while.
				</li>
				<li>
					Highlight your office hours or consider holding a group mentoring
					session.
				</li>
				<li>Share your tips for a skill others struggle with #SkillShare</li>
				<li>Give honest and constructive feedback.</li>
			</ul>
			<p>
				And remember, a community is only as awesome as its members, and you are
				all awesome ❤️
			</p>
		</>
	);
}
