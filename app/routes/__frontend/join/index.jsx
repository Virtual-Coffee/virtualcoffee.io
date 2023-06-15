import { json } from '@remix-run/node';
import DefaultLayout from '~/components/layouts/DefaultLayout';
import { createMetaData } from '~/util/createMetaData.server';
import { Link } from '@remix-run/react';

export async function loader() {
	return json({
		meta: createMetaData({
			title: 'Join Virtual Coffee',
			description: `Virtual Coffee is an intimate community that welcomes people at all stages of their tech journey.`,
			Hero: 'UndrawTeamSpirit',
		}),
	});
}

export function meta({ data: { meta } }) {
	return meta;
}

export default function Join() {
	return (
		<DefaultLayout
			simple
			Hero="UndrawTeamSpirit"
			heroHeader="Join Virtual Coffee"
			heroSubheader="Learn how to join our community"
		>
			<div className="prose">
				<div className="lead mb-5">
					<p>
						Virtual Coffee is a community that welcomes people at all stages of
						their tech journey. Our mission is to be a welcoming tech community
						that allows room for growth and mentorship at all levels and to
						create meaningful opportunities for learning, leadership, and
						contribution for everyone.
					</p>
					<p>
						We intentionally keep our group small to preserve what makes Virtual
						Coffee special and support our existing members. We'd love to have
						everyone as a part of Virtual Coffee, but we prioritize the intimacy
						and closeness of the group. Our community is currently accepting
						members on a limited basis. As new membership becomes available,
						we'll reach out to those on the waitlist to join.
					</p>
					<p>
						In the meantime, feel free to check out the{' '}
						<Link to="/resources/virtual-coffee-handbook/join-virtual-coffee/faq">
							FAQ about joining Virtual Coffee
						</Link>
						.
					</p>
					<div className="mt-5 text-center">
						<a
							href="https://airtable.com/shrWOl22B5iKYADub"
							className="btn btn-primary btn-lg"
						>
							Join the Waitlist
						</a>
					</div>
				</div>
			</div>
		</DefaultLayout>
	);
}
