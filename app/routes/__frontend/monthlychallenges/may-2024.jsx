import { json } from '@remix-run/node';
import { createMetaData } from '~/util/createMetaData.server';

import UndrawIllustration from '~/components/UndrawIllustration';

export const handle = {
	listTitle: 'May, 2024: Community Kindness!',
	meta: {
		title: 'Monthly Theme & Challenge for May, 2024: Community Kindness!',
		description:
			'May challenge -> Heading strong into year five! This month, we are focusing on what make this community special: Kindness',
	},
	date: '2024-05-01',
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
			<div className="row align-items-center">
				<div className="col-sm-4">
					<UndrawIllustration filename="UndrawAppreciation" />
				</div>
				<div className="col-sm-8">
					<h1 className="display-4">Virtual Coffee</h1>
					<p className="lead">
						Celebrating our Community as we move into our fifth year!
					</p>
				</div>
			</div>

			<h1>
				<small>Monthly Challenge for May, 2024:</small> Community Kindness!
			</h1>

			<p className="lead">
				It's amazing to realize that we've made it through more than four years
				of Virtual Coffee! As we work hard to make sure this community continues
				to be the special and close-knit group that it has been during that
				time, let's celebrate one of the things that continually makes this
				community so special: Kindness.
			</p>

			<p className="lead">
				Since this is a special challenge, we have some ideas to start things
				off, but we're looking forward to the creative ways you participate.
			</p>

			<h2>Theme</h2>
			<p>
				Community Kindness: Celebrating our Community and continuing Virtual
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
					Use the #gratitude channel in slack to thank someone in the community
					you're grateful for.
				</li>
				<li>Reach out to a member you haven't seen in a while.</li>
				<li>
					Highlight your office hours or consider holding a group mentoring
					session.
				</li>
				<li>
					Share your tips for a skill others struggle through writing a blog
					post, creating video or live streaming. Even better, share it with us
					on a Lunch and Learn session!
				</li>
				<li>Give honest and constructive feedback.</li>
				<li>
					Use another social media platform, like X or LinkedIn, to offer
					gratitude, support, or kindness for a community member.
				</li>
				<li>Give honest and constructive feedback.</li>
			</ul>
			<p>
				And remember, a community is only as awesome as its members, and you are
				all awesome ❤️
			</p>
		</>
	);
}
