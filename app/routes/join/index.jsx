import { json } from '@remix-run/node';
import DefaultLayout from '~/components/layouts/DefaultLayout';
import { createMetaData } from '~/util/createMetaData.server';

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
						that allows room for growth and mentorship at all levels, and to
						create meaningful opportunities for learning, leadership, and
						contribution for everyone.
					</p>
					<p>
						To preserve what makes Virtual Coffee special and support our
						existing members, we intentionally keep our group small. We'd love
						to have everyone as a part of Virtual Coffee, but we prioritize the
						intimacy and closeness of the group. Our community is currently
						accepting members on a limited basis. As new membership becomes
						available, we'll reach out to those on the wait list to join.
					</p>
					<div className="mt-5 text-center">
						<a
							href="https://airtable.com/shrWOl22B5iKYADub"
							className="btn btn-primary btn-lg"
						>
							Join the Wait List
						</a>
					</div>
				</div>
			</div>
		</DefaultLayout>
	);
}
