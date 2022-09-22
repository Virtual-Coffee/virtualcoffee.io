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

export default function CocForm() {
	return (
		<DefaultLayout
			simple
			Hero="UndrawTeamSpirit"
			heroHeader="Join Virtual Coffee"
			heroSubheader="Learn how to join our community"
		>
			<div className="lead mb-5">
				<p>
					Virtual Coffee is a community that welcomes people at all stages of
					their tech journey. Our mission is to be a welcoming tech community
					that allows room for growth and mentorship at all levels, and to
					create meaningful opportunities for learning, leadership, and
					contribution for everyone.
				</p>
				<p>
					To preserve what makes Virtual Coffee special, we intentionally keep
					our group small. We'd love to have everyone as a part of Virtual
					Coffee, but we prioritize the intimacy and closeness of the group. Our
					community is currently accepting members on a limited basis. As new
					membership becomes available, we'll reach out to those on the waitlist
					to join. To join the waitlist, please fill out the form below.
				</p>
			</div>
			<iframe
				title="new membership form"
				class="airtable-embed"
				src="https://airtable.com/embed/shrWOl22B5iKYADub?backgroundColor=gray"
				frameborder="0"
				onmousewheel=""
				width="100%"
				height="533"
				style={{ background: 'transparent', border: '1px solid #ccc' }}
			></iframe>
		</DefaultLayout>
	);
}
