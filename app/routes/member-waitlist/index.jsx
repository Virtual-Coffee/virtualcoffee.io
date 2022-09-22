import { json } from '@remix-run/node';
import DefaultLayout from '~/components/layouts/DefaultLayout';
import { createMetaData } from '~/util/createMetaData.server';

export async function loader() {
	return json({
		meta: createMetaData({
			title: 'Join our Membership Waitlist',
			description: `We'd love to have everyone as a part of Virtual Coffee, but we prioritize the intimacy and closeness of the group. As new membership becomes available, we'll reach out to those on the waitlist to join.`,
			Hero: 'UndrawTeamSpirit',
		}),
	});
}

export function meta({ data: { meta } }) {
	return meta;
}

export default function CocForm() {
	return (
		<DefaultLayout
			simple
			Hero="UndrawTeamSpirit"
			heroHeader="New Member Waitlist"
			heroSubheader="Join our waitlist for future membership."
		>
			<div className="lead mb-5">
				<p>
					We love the closeness and intimacy of our community. To preserve what
					makes Virtual Coffee special, we intentionally keep our group small.
					But we're excited to be opening new membership on a limited basis. As
					spots become available, we'll contact folks on the waitlist to join.
				</p>
			</div>
		</DefaultLayout>
	);
}
