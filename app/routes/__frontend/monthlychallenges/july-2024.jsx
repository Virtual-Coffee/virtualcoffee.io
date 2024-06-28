import { json } from '@remix-run/node';
import { createMetaData } from '~/util/createMetaData.server';
import { Link } from '@remix-run/react';

export const handle = {
	listTitle: 'July 2024: Welcoming Community!',
	meta: {
		title: 'Monthly Challenge for July 2024: Welcoming Community!',
		description:
			"July challenge -> Let's bring new friends in and give them warm welcome!",
	},
	date: '2024-07-01',
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
				<small>Monthly Challenge for July 2024:</small> Welcoming Community!
			</h1>

			<p className="lead mt-3">
				Virtual Coffee is known as a welcoming and supportive community of
				developers of all levels. It is, and always will be, a genuine community
				of people who value and prioritize supporting one another.
			</p>

			<h2 className="mt-5">The Challenge</h2>
			<p>
				We love new friends! This month, you can invite one person to join our
				community! ✨
			</p>
			<p>
				During this month, we're also encouraging you to actively welcome our
				new members and show what the Virtual Coffee community is all about. A
				welcoming and supportive community. 💖
			</p>

			<h2>Who can Participate?</h2>
			<p>All Virtual Coffee members who joined before July 2024.</p>

			<h2>How to Participate</h2>
			<ul>
				<li>
					<strong>One member, one invitation:</strong> You may invite one person
					this month. The details for inviting a new member are in the
					<code>#announcement</code> and <code>#monthly-challenge</code>{' '}
					channels on Slack.
				</li>
				<li>
					<strong>Introduction:</strong> If you've invited your friend to join
					Virtual Coffee, encourage them to introduce themselves in the{' '}
					<code>#welcome</code> channel on Slack after attending their first
					Coffee.
				</li>
				<li>
					<strong>Welcoming message:</strong> Send a quick welcome message to
					new members when they introduce themselves in the{' '}
					<code>#welcome</code> channel. This can be a personalized message or a
					friendly hello!
				</li>
				<li>
					<strong>Offering help and support:</strong> This can be anything! For
					example, based on our new friends' interest when introducing
					themselves, you can point them to add the relevant{' '}
					<Link to="/resources/virtual-coffee-handbook/guides-to-virtual-coffee/slack-channels-guide">
						Slack channels
					</Link>{' '}
					or encourage them to attend and join VC events, answer questions in
					our channels on Slack, etc. You can invite them to hang out in the{' '}
					<code>#co-working-room</code>, too!
				</li>
			</ul>
		</>
	);
}
