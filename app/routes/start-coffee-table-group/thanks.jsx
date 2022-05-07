import { json } from '@remix-run/node';
import DefaultLayout from '~/components/layouts/DefaultLayout';

export async function loader() {
	return json({
		meta: {
			title: 'Volunteer Application Received!',
			description: `Thank you so much for your willingness to help at VC!`,
		},
	});
}

export function meta({ data: { meta } }) {
	return meta;
}

export default function Thanks() {
	return (
		<DefaultLayout simple Hero="UndrawPowerful">
			<div class="lead mb-5">
				<h2>Thank you so much for your willingness to help at VC!</h2>
				<p>One of our team members will get back to you shortly.</p>
			</div>
		</DefaultLayout>
	);
}
